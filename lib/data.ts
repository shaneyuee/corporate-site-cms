import { promises as fs } from "node:fs";
import path from "node:path";
import { LocalizedList, LocalizedText, pickLocalizedList, pickLocalizedText, SupportedLocale, withZhFallback } from "@/lib/i18n";

export type Product = {
  id: number;
  name: string;
  category: string;
  summary: string;
  image: string;
  features: string[];
  nameI18n?: LocalizedText;
  summaryI18n?: LocalizedText;
  featuresI18n?: LocalizedList;
  videos?: string[];
  caseStudies?: Array<{
    title: LocalizedText;
    summary: LocalizedText;
    image: string;
  }>;
};

export type NewsItem = {
  id: number;
  title: string;
  date: string;
  summary: string;
  content: string;
};

export type SiteData = {
  company: {
    name: string;
    slogan: string;
    intro: string;
    address: string;
    phone: string;
    email: string;
    bannerTitle: string;
    bannerSubtitle: string;
  };
  heroBackgroundImage: string;
  advantages: string[];
  productCategories: string[];
  productCategoryCards?: Array<{
    name: string;
    description: string;
    nameI18n?: LocalizedText;
    descriptionI18n?: LocalizedText;
  }>;
  productPageDescription: string;
  contactFormHint: string;
  footerIcp: string;
  i18n?: {
    company?: {
      name?: LocalizedText;
      slogan?: LocalizedText;
      intro?: LocalizedText;
      address?: LocalizedText;
      bannerTitle?: LocalizedText;
      bannerSubtitle?: LocalizedText;
    };
    productCategories?: LocalizedList;
    productCategoryDescriptions?: LocalizedList;
    productPageDescription?: LocalizedText;
    advantages?: LocalizedList;
    contactFormHint?: LocalizedText;
    footerIcp?: LocalizedText;
  };
  seed?: {
    products?: Product[];
    news?: NewsItem[];
    admins?: Array<{
      username: string;
      passwordHash: string;
    }>;
  };
};

const dataFile = path.join(process.cwd(), "data", "site.json");

export async function readSiteData(): Promise<SiteData> {
  const content = await fs.readFile(dataFile, "utf-8");
  const parsed = JSON.parse(content) as SiteData;

  if (!parsed.i18n) {
    parsed.i18n = {};
  }

  parsed.i18n.company = {
    name: withZhFallback(parsed.company.name, parsed.i18n.company?.name),
    slogan: withZhFallback(parsed.company.slogan, parsed.i18n.company?.slogan),
    intro: withZhFallback(parsed.company.intro, parsed.i18n.company?.intro),
    address: withZhFallback(parsed.company.address, parsed.i18n.company?.address),
    bannerTitle: withZhFallback(parsed.company.bannerTitle, parsed.i18n.company?.bannerTitle),
    bannerSubtitle: withZhFallback(parsed.company.bannerSubtitle, parsed.i18n.company?.bannerSubtitle),
  };

  parsed.heroBackgroundImage = parsed.heroBackgroundImage || "/home-hero.webp";

  parsed.i18n.productCategories = {
    zh: parsed.productCategories,
    ...(parsed.i18n.productCategories ?? {}),
  };

  if (!parsed.productCategoryCards || parsed.productCategoryCards.length === 0) {
    const descZh = parsed.i18n.productCategoryDescriptions?.zh ?? [];
    parsed.productCategoryCards = parsed.productCategories.map((name, index) => ({
      name,
      description: descZh[index] ?? "覆盖多行业应用场景，支持标准化与定制化。",
      nameI18n: {
        zh: name,
        en: parsed.i18n?.productCategories?.en?.[index] ?? "",
        ja: parsed.i18n?.productCategories?.ja?.[index] ?? "",
        ko: parsed.i18n?.productCategories?.ko?.[index] ?? "",
      },
      descriptionI18n: {
        zh: descZh[index] ?? "覆盖多行业应用场景，支持标准化与定制化。",
        en: parsed.i18n?.productCategoryDescriptions?.en?.[index] ?? "",
        ja: parsed.i18n?.productCategoryDescriptions?.ja?.[index] ?? "",
        ko: parsed.i18n?.productCategoryDescriptions?.ko?.[index] ?? "",
      },
    }));
  } else {
    parsed.productCategoryCards = parsed.productCategoryCards.map((item) => ({
      ...item,
      nameI18n: withZhFallback(item.name, item.nameI18n),
      descriptionI18n: withZhFallback(item.description, item.descriptionI18n),
    }));
  }

  parsed.productCategories = parsed.productCategoryCards.map((item) => item.name);
  parsed.i18n.productCategories = {
    zh: parsed.productCategoryCards.map((item) => item.name),
    en: parsed.productCategoryCards.map((item) => item.nameI18n?.en ?? ""),
    ja: parsed.productCategoryCards.map((item) => item.nameI18n?.ja ?? ""),
    ko: parsed.productCategoryCards.map((item) => item.nameI18n?.ko ?? ""),
  };
  parsed.i18n.productCategoryDescriptions = {
    zh: parsed.productCategoryCards.map((item) => item.description),
    en: parsed.productCategoryCards.map((item) => item.descriptionI18n?.en ?? ""),
    ja: parsed.productCategoryCards.map((item) => item.descriptionI18n?.ja ?? ""),
    ko: parsed.productCategoryCards.map((item) => item.descriptionI18n?.ko ?? ""),
  };

  parsed.i18n.advantages = {
    zh: parsed.advantages,
    ...(parsed.i18n.advantages ?? {}),
  };

  parsed.productPageDescription = parsed.productPageDescription || "从和田玉到翡翠碧玉，覆盖日常佩戴、礼赠收藏与节庆选礼场景。";
  parsed.i18n.productPageDescription = withZhFallback(parsed.productPageDescription, parsed.i18n.productPageDescription);

  parsed.i18n.contactFormHint = withZhFallback(parsed.contactFormHint, parsed.i18n.contactFormHint);
  parsed.footerIcp = parsed.footerIcp || "粤ICP备00000000号";
  parsed.i18n.footerIcp = withZhFallback(parsed.footerIcp, parsed.i18n.footerIcp);

  return parsed;
}

export async function writeSiteData(data: SiteData): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf-8");
}

export function getNextId(list: Array<{ id: number }>): number {
  if (list.length === 0) {
    return 1;
  }
  return Math.max(...list.map((item) => item.id)) + 1;
}

export function getLocalizedSiteContent(data: SiteData, locale: SupportedLocale) {
  return {
    company: {
      ...data.company,
      name: pickLocalizedText(data.i18n?.company?.name, locale, data.company.name),
      slogan: pickLocalizedText(data.i18n?.company?.slogan, locale, data.company.slogan),
      intro: pickLocalizedText(data.i18n?.company?.intro, locale, data.company.intro),
      address: pickLocalizedText(data.i18n?.company?.address, locale, data.company.address),
      bannerTitle: pickLocalizedText(data.i18n?.company?.bannerTitle, locale, data.company.bannerTitle),
      bannerSubtitle: pickLocalizedText(data.i18n?.company?.bannerSubtitle, locale, data.company.bannerSubtitle),
    },
    advantages: pickLocalizedList(data.i18n?.advantages, locale, data.advantages),
    productCategories: pickLocalizedList(data.i18n?.productCategories, locale, data.productCategories),
    productCategoryCards: (data.productCategoryCards ?? []).map((item) => ({
      name: pickLocalizedText(item.nameI18n, locale, item.name),
      description: pickLocalizedText(item.descriptionI18n, locale, item.description),
    })),
    productPageDescription: pickLocalizedText(data.i18n?.productPageDescription, locale, data.productPageDescription),
    heroBackgroundImage: data.heroBackgroundImage,
    contactFormHint: pickLocalizedText(data.i18n?.contactFormHint, locale, data.contactFormHint),
    footerIcp: pickLocalizedText(data.i18n?.footerIcp, locale, data.footerIcp),
  };
}
