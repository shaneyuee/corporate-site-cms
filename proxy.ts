import { NextRequest, NextResponse } from "next/server";
import { normalizeLocale, SITE_LOCALE_COOKIE } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const hasLocaleCookie = request.cookies.get(SITE_LOCALE_COOKIE);
  if (hasLocaleCookie) {
    return NextResponse.next();
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const preferred = normalizeLocale(acceptLanguage.split(",")[0]);

  const response = NextResponse.next();
  response.cookies.set({
    name: SITE_LOCALE_COOKIE,
    value: preferred,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: false,
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
