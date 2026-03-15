import { NextResponse } from "next/server";
import { CAPTCHA_COOKIE_NAME, createCaptchaToken } from "@/lib/auth";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET() {
  const left = randomInt(1, 9);
  const right = randomInt(1, 9);
  const answer = String(left + right);

  const response = NextResponse.json({ question: `${left} + ${right} = ?` });
  response.cookies.set({
    name: CAPTCHA_COOKIE_NAME,
    value: createCaptchaToken(answer),
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5,
  });

  return response;
}
