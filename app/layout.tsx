import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import BrandLogo from "@/components/brand-logo";
import FloatingContact from "@/components/floating-contact";
import { getLocalizedSiteContent, readSiteData } from "@/lib/data";
import { getRequestPreferredLocale } from "@/lib/i18n";
import { siteDict } from "@/lib/site-dictionary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "企业官网 | 产品展示平台",
  description: "企业官网与管理后台一体化项目",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestPreferredLocale();
  const dict = siteDict[locale];
  const siteData = await readSiteData();
  const localized = getLocalizedSiteContent(siteData, locale);

  const headerStyle = localized.heroBackgroundImage
    ? {
      backgroundImage: `linear-gradient(110deg, rgba(2, 6, 23, 0.64), rgba(12, 74, 110, 0.58)), url(${localized.heroBackgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
    : undefined;

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} antialiased`}>
        <header className="border-b border-slate-200" style={headerStyle}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 shadow-md shadow-slate-950/10 backdrop-blur-sm">
              <BrandLogo companyName={localized.company.name} slogan={localized.company.slogan} subdued />
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-white/55 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-white/30"
            >
              {dict.navContact}
            </Link>
          </div>
        </header>
        {children}
        <FloatingContact
          phone={localized.company.phone}
          email={localized.company.email}
          contactLabel={dict.navContact}
          businessLabel={dict.businessContact}
        />
      </body>
    </html>
  );
}
