import { NextRequest, NextResponse } from "next/server";
import {
  CAPTCHA_COOKIE_NAME,
  createSessionToken,
  hashPassword,
  SESSION_COOKIE_NAME,
  verifyCaptchaToken,
} from "@/lib/auth";
import { findUserByUsername } from "@/lib/db";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 10;

type LoginAttemptState = {
  failedCount: number;
  lockUntil: number;
};

const loginAttempts = new Map<string, LoginAttemptState>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { username?: string; password?: string; captchaAnswer?: string };
    const username = (payload.username ?? "").trim();
    const password = payload.password ?? "";
    const captchaAnswer = (payload.captchaAnswer ?? "").trim();

    if (!username || !password || !captchaAnswer) {
      return NextResponse.json({ message: "用户名、密码和验证码不能为空" }, { status: 400 });
    }

    const captchaToken = request.cookies.get(CAPTCHA_COOKIE_NAME)?.value;
    if (!captchaToken || !verifyCaptchaToken(captchaToken, captchaAnswer)) {
      return NextResponse.json({ message: "验证码错误或已过期" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const attemptKey = `${username.toLowerCase()}|${ip}`;
    const now = Date.now();
    const attemptState = loginAttempts.get(attemptKey);

    if (attemptState && attemptState.lockUntil > now) {
      const remainingSeconds = Math.ceil((attemptState.lockUntil - now) / 1000);
      return NextResponse.json(
        { message: `登录失败次数过多，请 ${remainingSeconds} 秒后再试` },
        { status: 429 },
      );
    }

    const admin = await findUserByUsername(username);

    if (!admin || admin.passwordHash !== hashPassword(password)) {
      const nextFailedCount = (attemptState?.failedCount ?? 0) + 1;
      if (nextFailedCount >= MAX_FAILED_ATTEMPTS) {
        loginAttempts.set(attemptKey, {
          failedCount: nextFailedCount,
          lockUntil: now + LOCK_MINUTES * 60 * 1000,
        });
        return NextResponse.json(
          { message: `连续失败过多，账号已锁定 ${LOCK_MINUTES} 分钟` },
          { status: 429 },
        );
      }

      loginAttempts.set(attemptKey, {
        failedCount: nextFailedCount,
        lockUntil: 0,
      });

      return NextResponse.json({ message: "用户名或密码错误" }, { status: 401 });
    }

    loginAttempts.delete(attemptKey);

    const token = createSessionToken(admin.username);
    const response = NextResponse.json({ message: "登录成功", username: admin.username });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    response.cookies.set({
      name: CAPTCHA_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json({ message: "服务暂时不可用，请稍后重试" }, { status: 500 });
  }
}
