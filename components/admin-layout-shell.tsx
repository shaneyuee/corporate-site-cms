import Link from "next/link";
import { ReactNode } from "react";
import AdminLogoutButton from "@/components/admin-logout-button";
import BrandLogo from "@/components/brand-logo";
import { getLocalizedSiteContent, readSiteData } from "@/lib/data";
import { getRequestPreferredLocale } from "@/lib/i18n";
import { countUnreadInquiries } from "@/lib/db";

const adminNav = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/products", label: "产品管理" },
  { href: "/admin/cases", label: "案例管理" },
  { href: "/admin/inquiries", label: "客户需求", withUnread: true },
  { href: "/admin/product-config", label: "产品配置" },
  { href: "/admin/news", label: "新闻管理" },
  { href: "/admin/settings", label: "站点配置" },
];

export default async function AdminLayoutShell({ children }: { children: ReactNode }) {
  const unreadCount = await countUnreadInquiries();
  const locale = await getRequestPreferredLocale();
  const siteData = await readSiteData();
  const localized = getLocalizedSiteContent(siteData, locale);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#edf7ee_0%,#e5f3e7_100%)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-[248px_1fr]">
        <aside className="rounded-2xl border border-emerald-100 bg-[#fcfefb]/95 p-4 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
            <BrandLogo companyName={localized.company.name} compact />
            <p className="mt-2 text-sm font-semibold text-emerald-800">管理后台</p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                <span>{item.label}</span>
                {item.withUnread && unreadCount > 0 ? (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{unreadCount}</span>
                ) : null}
              </Link>
            ))}
            <AdminLogoutButton />
          </nav>
        </aside>
        <section className="rounded-2xl border border-emerald-100 bg-[#fcfefb] p-4 shadow-lg shadow-emerald-900/10 md:p-6">{children}</section>
      </div>
    </div>
  );
}
