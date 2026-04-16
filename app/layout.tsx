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
  title: "玉石大世界 | 玉器商城",
  description: "玉石大世界提供手镯、吊坠、玉牌与礼赠摆件等玉器甄选服务。",
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
      backgroundImage: `linear-gradient(110deg, rgba(18, 44, 28, 0.72), rgba(58, 109, 77, 0.58)), url(${localized.heroBackgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
    : undefined;

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} antialiased`}>
        <header className="border-b border-emerald-950/10" style={headerStyle}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="rounded-2xl border border-white/10 bg-emerald-950/12 px-3 py-2 shadow-md shadow-emerald-950/10 backdrop-blur-sm">
              <BrandLogo companyName={localized.company.name} slogan={localized.company.slogan} subdued />
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-emerald-100/55 bg-emerald-50/18 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-emerald-50/28"
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
