import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { readSiteData, writeSiteData } from "@/lib/data";
import { LocalizedText } from "@/lib/i18n";

type LocalizedList = Partial<Record<"zh" | "en" | "ja" | "ko", string[]>>;

export async function GET(request: NextRequest) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const data = await readSiteData();
  return NextResponse.json({
    company: data.company,
    heroBackgroundImage: data.heroBackgroundImage,
    contactFormHint: data.contactFormHint,
    productCategories: data.productCategories,
    productCategoryCards: data.productCategoryCards ?? [],
    productPageDescription: data.productPageDescription,
    advantages: data.advantages,
    footerIcp: data.footerIcp,
    i18n: {
      company: data.i18n?.company,
      productCategories: data.i18n?.productCategories,
      productCategoryDescriptions: data.i18n?.productCategoryDescriptions,
      productPageDescription: data.i18n?.productPageDescription,
      advantages: data.i18n?.advantages,
      contactFormHint: data.i18n?.contactFormHint,
      footerIcp: data.i18n?.footerIcp,
    },
  });
}

export async function PUT(request: NextRequest) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    name?: string;
    slogan?: string;
    intro?: string;
    address?: string;
    phone?: string;
    email?: string;
    bannerTitle?: string;
    bannerSubtitle?: string;
    heroBackgroundImage?: string;
    productCategories?: string[];
    productCategoryCards?: Array<{
      name: string;
      description: string;
      nameI18n?: LocalizedText;
      descriptionI18n?: LocalizedText;
    }>;
    productPageDescription?: string;
    advantages?: string[];
    footerIcp?: string;
    companyI18n?: {
      name?: LocalizedText;
      slogan?: LocalizedText;
      intro?: LocalizedText;
      address?: LocalizedText;
      bannerTitle?: LocalizedText;
      bannerSubtitle?: LocalizedText;
    };
    productCategoriesI18n?: LocalizedList;
    productCategoryDescriptionsI18n?: LocalizedList;
    productPageDescriptionI18n?: LocalizedText;
    advantagesI18n?: LocalizedList;
    contactFormHint?: string;
    contactFormHintI18n?: LocalizedText;
    footerIcpI18n?: LocalizedText;
  };

  const data = await readSiteData();

  const nextName = payload.name ?? data.company.name;
  const nextSlogan = payload.slogan ?? data.company.slogan;
  const nextIntro = payload.intro ?? data.company.intro;
  const nextAddress = payload.address ?? data.company.address;
  const nextPhone = payload.phone ?? data.company.phone;
  const nextEmail = payload.email ?? data.company.email;
  const nextBannerTitle = payload.bannerTitle ?? data.company.bannerTitle;
  const nextBannerSubtitle = payload.bannerSubtitle ?? data.company.bannerSubtitle;

  data.company = {
    ...data.company,
    name: nextName,
    slogan: nextSlogan,
    intro: nextIntro,
    address: nextAddress,
    phone: nextPhone,
    email: nextEmail,
    bannerTitle: nextBannerTitle,
    bannerSubtitle: nextBannerSubtitle,
  };

  data.heroBackgroundImage = payload.heroBackgroundImage ?? data.heroBackgroundImage;

  data.contactFormHint = payload.contactFormHint ?? data.contactFormHint;
  data.productCategoryCards = payload.productCategoryCards ?? data.productCategoryCards;
  data.productCategories = payload.productCategories
    ?? data.productCategoryCards?.map((item) => item.name)
    ?? data.productCategories;
  data.productPageDescription = payload.productPageDescription ?? data.productPageDescription;
  data.advantages = payload.advantages ?? data.advantages;
  data.footerIcp = payload.footerIcp ?? data.footerIcp;
  data.i18n = {
    ...(data.i18n ?? {}),
    company: {
      ...(data.i18n?.company ?? {}),
      ...(payload.companyI18n ?? {}),
      name: { zh: nextName, ...(payload.companyI18n?.name ?? {}) },
      slogan: { zh: nextSlogan, ...(payload.companyI18n?.slogan ?? {}) },
      intro: { zh: nextIntro, ...(payload.companyI18n?.intro ?? {}) },
      address: { zh: nextAddress, ...(payload.companyI18n?.address ?? {}) },
      bannerTitle: { zh: nextBannerTitle, ...(payload.companyI18n?.bannerTitle ?? {}) },
      bannerSubtitle: { zh: nextBannerSubtitle, ...(payload.companyI18n?.bannerSubtitle ?? {}) },
    },
    productCategories: {
      zh: payload.productCategories ?? data.productCategories,
      ...(payload.productCategoriesI18n ?? {}),
    },
    productCategoryDescriptions: {
      zh: payload.productCategoryCards?.map((item) => item.description)
        ?? payload.productCategoryDescriptionsI18n?.zh
        ?? data.i18n?.productCategoryDescriptions?.zh
        ?? [],
      ...(payload.productCategoryDescriptionsI18n ?? {}),
    },
    productPageDescription: {
      zh: payload.productPageDescription ?? data.productPageDescription,
      ...(payload.productPageDescriptionI18n ?? {}),
    },
    advantages: {
      zh: payload.advantages ?? data.advantages,
      ...(payload.advantagesI18n ?? {}),
    },
    contactFormHint: { zh: payload.contactFormHint ?? data.contactFormHint, ...(payload.contactFormHintI18n ?? {}) },
    footerIcp: { zh: payload.footerIcp ?? data.footerIcp, ...(payload.footerIcpI18n ?? {}) },
  };

  await writeSiteData(data);
  return NextResponse.json({
    company: data.company,
    heroBackgroundImage: data.heroBackgroundImage,
    contactFormHint: data.contactFormHint,
    productCategories: data.productCategories,
    productCategoryCards: data.productCategoryCards ?? [],
    productPageDescription: data.productPageDescription,
    advantages: data.advantages,
    footerIcp: data.footerIcp,
    i18n: {
      company: data.i18n?.company,
      productCategories: data.i18n?.productCategories,
      productCategoryDescriptions: data.i18n?.productCategoryDescriptions,
      productPageDescription: data.i18n?.productPageDescription,
      advantages: data.i18n?.advantages,
      contactFormHint: data.i18n?.contactFormHint,
      footerIcp: data.i18n?.footerIcp,
    },
  });
}
