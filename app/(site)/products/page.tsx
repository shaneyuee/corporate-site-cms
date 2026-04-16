import { listProducts } from "@/lib/db";
import ProductsCatalog from "@/components/products-catalog";
import { getLocalizedSiteContent, readSiteData } from "@/lib/data";
import { getRequestPreferredLocale, pickLocalizedList, pickLocalizedText } from "@/lib/i18n";
import { siteDict } from "@/lib/site-dictionary";

export const dynamic = "force-dynamic";

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
      ?? product.categoryI18n?.zh
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
