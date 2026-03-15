import { listProducts } from "@/lib/db";
import ProductsCatalog from "@/components/products-catalog";
import { getLocalizedSiteContent, readSiteData } from "@/lib/data";
import { getRequestPreferredLocale, pickLocalizedList, pickLocalizedText } from "@/lib/i18n";
import { siteDict } from "@/lib/site-dictionary";

export const dynamic = "force-dynamic";

const categoryFallbackMap: Record<string, { en: string; ja: string; ko: string }> = {
  超声波清洗设备: {
    en: "Ultrasonic Cleaning Equipment",
    ja: "超音波洗浄設備",
    ko: "초음파 세정 장비",
  },
  自动化输送系统: {
    en: "Automated Conveyor Systems",
    ja: "自動搬送システム",
    ko: "자동화 이송 시스템",
  },
  工业环保配套: {
    en: "Industrial Environmental Solutions",
    ja: "産業環境関連設備",
    ko: "산업 환경 설비",
  },
  非标定制产线: {
    en: "Custom Production Lines",
    ja: "非標準カスタムライン",
    ko: "비표준 맞춤형 라인",
  },
};

export default async function ProductsPage() {
  const locale = await getRequestPreferredLocale();
  const dict = siteDict[locale];
  const detailLabels = {
    view: locale === "zh" ? "查看详情" : locale === "en" ? "View Details" : locale === "ja" ? "詳細を見る" : "상세 보기",
    close: locale === "zh" ? "关闭" : locale === "en" ? "Close" : locale === "ja" ? "閉じる" : "닫기",
  };
  const data = await readSiteData();
  const localizedSite = getLocalizedSiteContent(data, locale);
  const products = await listProducts();

  const categoryNamesByZh = new Map(
    (data.productCategoryCards ?? []).map((item) => [item.name, pickLocalizedText(item.nameI18n, locale, item.name)]),
  );

  const categorySet = new Set(localizedSite.productCategories);
  const catalogItems = products.map((product) => {
    const categoryLabel = product.categoryI18n?.[locale]
      ?? categoryNamesByZh.get(product.category)
      ?? (locale === "zh" ? product.category : categoryFallbackMap[product.category]?.[locale] ?? product.categoryI18n?.zh)
      ?? product.category;

    categorySet.add(categoryLabel);

    return {
      id: product.id,
      categoryLabel,
      name: pickLocalizedText(product.nameI18n, locale, product.name),
      summary: pickLocalizedText(product.summaryI18n, locale, product.summary),
      image: product.image,
      features: pickLocalizedList(product.featuresI18n, locale, product.features),
      videos: product.videos ?? [],
    };
  });

  const allCategories = Array.from(categorySet);

  return (
    <ProductsCatalog
      heading={dict.productCenter}
      description={localizedSite.productPageDescription || dict.productCenterIntro}
      categories={allCategories}
      allLabel={dict.allCategories}
      videosLabel={dict.productVideos}
      viewDetailLabel={detailLabels.view}
      closeLabel={detailLabels.close}
      items={catalogItems}
    />
  );
}
