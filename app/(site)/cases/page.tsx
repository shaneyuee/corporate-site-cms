import { listProducts } from "@/lib/db";
import { getRequestPreferredLocale, pickLocalizedText } from "@/lib/i18n";
import { siteDict } from "@/lib/site-dictionary";

export const dynamic = "force-dynamic";

type CaseItem = {
  key: string;
  productName: string;
  category: string;
  title: string;
  summary: string;
  image: string;
};

export default async function CasesPage() {
  const locale = await getRequestPreferredLocale();
  const dict = siteDict[locale];
  const products = await listProducts();

  const cases: CaseItem[] = products.flatMap((product) =>
    (product.caseStudies ?? []).map((item, index) => ({
      key: `${product.id}-${index}`,
      productName: pickLocalizedText(product.nameI18n, locale, product.name),
      category: pickLocalizedText(product.categoryI18n, locale, product.category),
      title: pickLocalizedText(item.title, locale, ""),
      summary: pickLocalizedText(item.summary, locale, ""),
      image: item.image,
    })),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{dict.casesTitle}</h1>
      <p className="mt-3 text-sm text-muted md:text-base">{dict.casesIntro}</p>

      {cases.length === 0 ? (
        <p className="mt-8 rounded-xl border border-border bg-light-blue p-4 text-sm text-muted">{dict.noCases}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {cases.map((item) => (
            <article key={item.key} className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-primary">{item.category}</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">{item.title || dict.successCases}</h2>
              <p className="mt-2 text-sm text-muted">{item.summary}</p>
              <p className="mt-3 text-xs text-muted">{dict.relatedProduct}: {item.productName}</p>
              {item.image ? <img src={item.image} alt={item.title || dict.successCases} className="mt-3 aspect-video w-full rounded-md object-cover" /> : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
