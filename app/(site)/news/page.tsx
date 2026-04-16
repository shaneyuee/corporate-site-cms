import { listNews } from "@/lib/db";
import { getRequestPreferredLocale } from "@/lib/i18n";
import { siteDict } from "@/lib/site-dictionary";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const locale = await getRequestPreferredLocale();
  const dict = siteDict[locale];
  const news = await listNews();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{dict.newsCenterTitle}</h1>
      <div className="mt-8 space-y-4">
        {news.map((item) => (
          <article key={item.id} className="rounded-xl border border-border bg-[#fcfefb] p-5 shadow-sm shadow-emerald-900/5">
            <p className="text-sm text-primary">{item.date}</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              {item.titleI18n?.[locale]
                ?? item.titleI18n?.zh
                ?? item.title}
            </h2>
            <p className="mt-3 text-sm text-muted">
              {item.summaryI18n?.[locale]
                ?? item.summaryI18n?.zh
                ?? item.summary}
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              {item.contentI18n?.[locale]
                ?? item.contentI18n?.zh
                ?? item.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
