import Link from "next/link";
import { countNews, countProducts, countUnreadInquiries } from "@/lib/db";
import { readSiteData } from "@/lib/data";

export default async function AdminDashboardPage() {
  const data = await readSiteData();
  const productCount = await countProducts();
  const newsCount = await countNews();
  const unreadInquiries = await countUnreadInquiries();

  const cards = [
    { label: "产品总数", value: productCount },
    { label: "新闻条数", value: newsCount },
    { label: "未读客户需求", value: unreadInquiries },
    { label: "产品分类", value: data.productCategories.length },
    { label: "企业优势项", value: data.advantages.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
      <p className="mt-2 text-sm text-muted">欢迎进入企业网站管理后台。</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-light-blue p-4">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      {unreadInquiries > 0 ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">你有 {unreadInquiries} 条新客户需求待处理</p>
          <Link href="/admin/inquiries" className="mt-2 inline-block text-sm font-medium text-primary underline">
            前往客户需求列表
          </Link>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-border bg-white p-4">
        <p className="text-sm text-muted">当前企业名称</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">{data.company.name}</p>
      </div>
    </div>
  );
}
