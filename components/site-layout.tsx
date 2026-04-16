import Link from "next/link";
import { ReactNode } from "react";
import LanguageSwitcher from "@/components/language-switcher";
import { getLocalizedSiteContent, readSiteData } from "@/lib/data";
import { getRequestPreferredLocale } from "@/lib/i18n";
import { siteDict } from "@/lib/site-dictionary";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const locale = await getRequestPreferredLocale();
  const dict = siteDict[locale];
  const siteData = await readSiteData();
  const localized = getLocalizedSiteContent(siteData, locale);
  const navItems = [
    { href: "/", label: dict.navHome },
    { href: "/products", label: dict.navProducts },
    { href: "/cases", label: dict.navCases },
    { href: "/about", label: dict.navAbout },
    { href: "/news", label: dict.navNews },
    { href: "/contact", label: dict.navContact },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#edf7ee_0%,#f7fbf5_18%,#f4fbf4_100%)] text-gray-800">
      <header className="sticky top-0 z-30 border-b border-emerald-100/80 bg-[#f7fbf5]/88 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold md:text-base">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="shrink-0">
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-12 border-t border-border bg-emerald-50/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>© 2026 {localized.company.name}</p>
          <p>{localized.footerIcp}</p>
        </div>
      </footer>
    </div>
  );
}
