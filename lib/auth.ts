import crypto from "node:crypto";
import { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "admin_session";
export const CAPTCHA_COOKIE_NAME = "admin_captcha";
const SESSION_EXPIRES_SECONDS = 60 * 60 * 8;
const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET ?? "dev-admin-secret-change-me";

type SessionPayload = {
  username: string;
  exp: number;
};

type CaptchaPayload = {
  answer: string;
  exp: number;
};

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf-8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf-8");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", AUTH_SECRET).update(value).digest("base64url");
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function createSessionToken(username: string): string {
  const payload: SessionPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_EXPIRES_SECONDS,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = sign(encoded);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getAuthenticatedUser(request: NextRequest): string | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  const payload = verifySessionToken(token);
  return payload?.username ?? null;
}

export function shouldUseSecureCookies(request: NextRequest): boolean {
  const secureCookieConfig = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (secureCookieConfig === "true" || secureCookieConfig === "1") {
    return true;
  }

  if (secureCookieConfig === "false" || secureCookieConfig === "0") {
    return false;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return request.nextUrl.protocol === "https:";
}

export function createCaptchaToken(answer: string): string {
  const payload: CaptchaPayload = {
    answer: answer.trim(),
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyCaptchaToken(token: string, answer: string): boolean {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return false;
  }

  const expectedSignature = sign(encoded);
  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as CaptchaPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return false;
    }
    return payload.answer === answer.trim();
  } catch {
    return false;
  }
}
