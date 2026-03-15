import { cookies, headers } from "next/headers";

export const SITE_LOCALE_COOKIE = "site_locale";
export const SUPPORTED_LOCALES = ["zh", "en", "ja", "ko"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalizedText = Partial<Record<SupportedLocale, string>>;
export type LocalizedList = Partial<Record<SupportedLocale, string[]>>;

export function normalizeLocale(input?: string | null): SupportedLocale {
  const value = (input ?? "").toLowerCase();
  if (value.startsWith("en")) return "en";
  if (value.startsWith("ja")) return "ja";
  if (value.startsWith("ko")) return "ko";
  return "zh";
}

export function pickLocalizedText(localized: LocalizedText | undefined, locale: SupportedLocale, fallback = ""): string {
  if (!localized) {
    return fallback;
  }

  return localized[locale] ?? localized.zh ?? localized.en ?? localized.ja ?? localized.ko ?? fallback;
}

export function pickLocalizedList(localized: LocalizedList | undefined, locale: SupportedLocale, fallback: string[] = []): string[] {
  if (!localized) {
    return fallback;
  }

  return localized[locale] ?? localized.zh ?? localized.en ?? localized.ja ?? localized.ko ?? fallback;
}

export function withZhFallback(value: string, localized?: LocalizedText): LocalizedText {
  return {
    zh: value,
    ...(localized ?? {}),
  };
}

export async function getRequestPreferredLocale(): Promise<SupportedLocale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(SITE_LOCALE_COOKIE)?.value;
  if (fromCookie) {
    return normalizeLocale(fromCookie);
  }

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language") ?? "";
  const first = acceptLanguage.split(",")[0]?.trim();
  return normalizeLocale(first);
}
