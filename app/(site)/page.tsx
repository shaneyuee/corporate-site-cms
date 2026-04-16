import Link from "next/link";
import Image from "next/image";
import { listProducts } from "@/lib/db";
import { getLocalizedSiteContent, readSiteData } from "@/lib/data";
import { getRequestPreferredLocale, pickLocalizedList, pickLocalizedText } from "@/lib/i18n";
import { siteDict } from "@/lib/site-dictionary";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getRequestPreferredLocale();
  const dict = siteDict[locale];
  const data = await readSiteData();
  const localizedSite = getLocalizedSiteContent(data, locale);
  const products = await listProducts();
  const categoryNameByZh = new Map(
    (data.productCategoryCards ?? []).map((item) => [item.name, pickLocalizedText(item.nameI18n, locale, item.name)]),
  );
  const heroStyle = localizedSite.heroBackgroundImage
    ? {
      backgroundImage: `linear-gradient(rgba(31, 77, 48, 0.66), rgba(54, 120, 74, 0.62)), url(${localizedSite.heroBackgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
    : undefined;
  const stats = [
    { label: locale === "zh" ? "在库玉款" : locale === "en" ? "Curated Pieces" : locale === "ja" ? "掲載玉器数" : "진열 상품 수", value: "300+" },
    { label: locale === "zh" ? "顾问在线" : locale === "en" ? "Consulting Hours" : locale === "ja" ? "相談対応" : "상담 운영", value: "12h" },
    { label: locale === "zh" ? "复购好评" : locale === "en" ? "Positive Reviews" : locale === "ja" ? "高評価率" : "재구매 만족도", value: "96%" },
    { label: locale === "zh" ? "礼盒证书" : locale === "en" ? "Gift Box & Cert" : locale === "ja" ? "箱・証書付" : "선물 포장", value: "标配" },
  ];
  const logoCloud = [
    locale === "zh" ? "和田玉" : locale === "en" ? "Hetian Jade" : locale === "ja" ? "和田玉" : "허톈옥",
    locale === "zh" ? "翡翠" : locale === "en" ? "Jadeite" : locale === "ja" ? "翡翠" : "비취",
    locale === "zh" ? "碧玉" : locale === "en" ? "Green Jade" : locale === "ja" ? "碧玉" : "벽옥",
    locale === "zh" ? "墨玉" : locale === "en" ? "Black Jade" : locale === "ja" ? "墨玉" : "묵옥",
    locale === "zh" ? "平安扣" : locale === "en" ? "Peace Buckle" : locale === "ja" ? "平安扣" : "평안환",
    locale === "zh" ? "礼盒证书" : locale === "en" ? "Gift Ready" : locale === "ja" ? "ギフト対応" : "선물 대응",
  ];
  const marqueeLogos = [...logoCloud, ...logoCloud];

  return (
    <div>
      <section
        className={localizedSite.heroBackgroundImage ? "relative overflow-hidden text-white" : "relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark text-white"}
        style={heroStyle}
      >
        <div className="pointer-events-none absolute -left-20 top-16 h-44 w-44 rounded-full bg-lime-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-52 w-52 rounded-full bg-emerald-300/28 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="animate-fade-up text-sm opacity-90">{dict.heroTag}</p>
          <h1 className="animate-fade-up animate-delay-100 mt-3 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">{localizedSite.company.bannerTitle}</h1>
          <p className="animate-fade-up animate-delay-200 mt-4 max-w-2xl text-sm leading-7 opacity-95 md:text-base">{localizedSite.company.bannerSubtitle}</p>
          <div className="animate-fade-up animate-delay-300 mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-md bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-900 shadow-sm md:text-base">
              {dict.viewProducts}
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-emerald-50/70 bg-emerald-950/12 px-5 py-2 text-sm font-semibold text-white md:text-base"
            >
              {dict.getPlan}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((item, index) => (
              <div
                key={item.label}
                className={`animate-fade-up rounded-2xl border border-emerald-50/20 bg-emerald-950/12 p-4 backdrop-blur ${index % 2 === 0 ? "animate-gentle-float" : ""}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <p className="text-2xl font-bold md:text-3xl">{item.value}</p>
                <p className="mt-1 text-xs opacity-90 md:text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-[#f7fbf5]">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="logo-marquee-wrap overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/70 py-3">
            <div className="logo-marquee-track gap-3 px-3">
              {marqueeLogos.map((logo, index) => (
                <span
                  key={`${logo}-${index}`}
                  className="rounded-full border border-emerald-100 bg-[#fcfefb] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-emerald-800 md:text-sm"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900">{dict.productCenter}</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(localizedSite.productCategoryCards?.length ? localizedSite.productCategoryCards : localizedSite.productCategories.map((name) => ({ name, description: "" }))).map((category, index) => (
            <div key={`${category.name}-${category.description}`} className="group rounded-2xl border border-emerald-100 bg-[#fcfefb] p-5 shadow-sm shadow-emerald-900/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10">
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 via-green-500 to-lime-500 text-sm font-bold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-500">Category</span>
              </div>
              <p className="text-base font-semibold text-slate-900 group-hover:text-emerald-800">{category.name}</p>
              <p className="mt-2 text-sm text-muted">{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-light-blue">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900">{dict.coreProducts}</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="rounded-xl border border-border bg-[#fcfefb] p-5 shadow-sm shadow-emerald-900/5">
                <p className="text-sm font-semibold text-primary">
                  {pickLocalizedText(product.categoryI18n, locale, categoryNameByZh.get(product.category) ?? product.category)}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">{pickLocalizedText(product.nameI18n, locale, product.name)}</h3>
                <p className="mt-2 text-sm text-muted">{pickLocalizedText(product.summaryI18n, locale, product.summary)}</p>
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={pickLocalizedText(product.nameI18n, locale, product.name)}
                    width={960}
                    height={540}
                    className="mt-3 aspect-video w-full rounded-md object-cover"
                  />
                ) : null}
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {pickLocalizedList(product.featuresI18n, locale, product.features).map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900">{dict.companyAdvantage}</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {localizedSite.advantages.map((item) => (
            <div key={item} className="rounded-xl border border-border bg-[#fcfefb] p-5 text-center shadow-sm shadow-emerald-900/5">
              <p className="text-base font-semibold text-primary">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold">{dict.needPlan}</p>
            <p className="mt-2 text-sm opacity-95">{dict.needPlanDesc}</p>
          </div>
          <Link href="/contact" className="w-fit rounded-md bg-emerald-50 px-5 py-2 font-semibold text-emerald-900">
            {dict.consultNow}
          </Link>
        </div>
      </section>
    </div>
  );
}
