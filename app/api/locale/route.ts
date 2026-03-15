import { NextRequest, NextResponse } from "next/server";
import { normalizeLocale, SITE_LOCALE_COOKIE } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { locale?: string };
  const locale = normalizeLocale(payload.locale);

  const response = NextResponse.json({ locale });
  response.cookies.set({
    name: SITE_LOCALE_COOKIE,
    value: locale,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: false,
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
