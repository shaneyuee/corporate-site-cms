"use client";

import { FormEvent, useEffect, useState } from "react";

const localeOptions = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ja", label: "日本語" },
  { key: "ko", label: "한국어" },
] as const;

type LocaleKey = (typeof localeOptions)[number]["key"];

type LocalizedText = Record<LocaleKey, string>;
type LocalizedList = Record<LocaleKey, string[]>;

type SiteSettings = {
  name: string;
  slogan: string;
  intro: string;
  address: string;
  phone: string;
  email: string;
  bannerTitle: string;
  bannerSubtitle: string;
  heroBackgroundImage: string;
  contactFormHint: string;
  productCategories: string;
  advantages: string;
  footerIcp: string;
};

type SiteI18n = {
  company: {
    name: LocalizedText;
    slogan: LocalizedText;
    intro: LocalizedText;
    address: LocalizedText;
    bannerTitle: LocalizedText;
    bannerSubtitle: LocalizedText;
  };
  productCategories: LocalizedList;
  advantages: LocalizedList;
  contactFormHint: LocalizedText;
  footerIcp: LocalizedText;
};

const adminSettingsUi: Record<LocaleKey, Record<string, string>> = {
  zh: {
    pageTitle: "站点配置",
    previewLang: "预览语言：",
    previewTitle: "配置预览",
    companyName: "公司名称",
    companySlogan: "公司标语",
    companyIntro: "公司介绍",
    companyAddress: "公司地址",
    phoneLabel: "联系电话",
    emailLabel: "联系邮箱",
    heroBackgroundLabel: "首页背景图",
    contactHint: "联系提示",
    productCategories: "产品分类",
    advantages: "企业优势",
    footerIcp: "页脚备案",
    namePh: "企业名称",
    sloganPh: "企业标语",
    introPh: "企业简介",
    addressPh: "公司地址",
    phonePh: "联系电话",
    emailPh: "联系邮箱",
    bannerTitlePh: "首页Banner标题",
    bannerSubtitlePh: "首页Banner副标题",
    heroBackgroundPh: "首页背景图URL（建议 16:9）",
    heroBackgroundHint: "可直接上传图片或填写URL，首页将使用该图作为商城首屏背景。",
    uploading: "图片上传中...",
    uploadFailed: "上传失败",
    contactHintPh: "联系页提示文案",
    categoriesPh: "产品分类（中文，逗号分隔）",
    advantagesPh: "企业优势（中文，逗号分隔）",
    footerIcpPh: "页脚备案号/版权说明",
    companyNameMulti: "公司名称（多语言）",
    companySloganMulti: "公司标语（多语言）",
    companyIntroMulti: "公司介绍（多语言）",
    companyAddressMulti: "公司地址（多语言）",
    bannerTitleMulti: "Banner标题（多语言）",
    bannerSubtitleMulti: "Banner副标题（多语言）",
    contactHintMulti: "联系页提示（多语言）",
    categoriesMulti: "产品分类（多语言）",
    advantagesMulti: "企业优势（多语言）",
    footerIcpMulti: "页脚备案/版权（多语言）",
    save: "保存配置",
  },
  en: {
    pageTitle: "Site Settings",
    previewLang: "Preview Language:",
    previewTitle: "Settings Preview",
    companyName: "Company Name",
    companySlogan: "Company Slogan",
    companyIntro: "Company Intro",
    companyAddress: "Company Address",
    phoneLabel: "Phone",
    emailLabel: "Email",
    heroBackgroundLabel: "Homepage Background Image",
    contactHint: "Contact Hint",
    productCategories: "Product Categories",
    advantages: "Advantages",
    footerIcp: "Footer ICP",
    namePh: "Company Name",
    sloganPh: "Company Slogan",
    introPh: "Company Introduction",
    addressPh: "Company Address",
    phonePh: "Phone",
    emailPh: "Email",
    bannerTitlePh: "Homepage Banner Title",
    bannerSubtitlePh: "Homepage Banner Subtitle",
    heroBackgroundPh: "Homepage background image URL (16:9 recommended)",
    heroBackgroundHint: "Upload an image or paste a URL. The homepage hero section will use this as background.",
    uploading: "Uploading image...",
    uploadFailed: "Upload failed",
    contactHintPh: "Contact page hint text",
    categoriesPh: "Product categories (zh, comma-separated)",
    advantagesPh: "Advantages (zh, comma-separated)",
    footerIcpPh: "Footer ICP/Copyright",
    companyNameMulti: "Company Name (Multilingual)",
    companySloganMulti: "Company Slogan (Multilingual)",
    companyIntroMulti: "Company Intro (Multilingual)",
    companyAddressMulti: "Company Address (Multilingual)",
    bannerTitleMulti: "Banner Title (Multilingual)",
    bannerSubtitleMulti: "Banner Subtitle (Multilingual)",
    contactHintMulti: "Contact Hint (Multilingual)",
    categoriesMulti: "Product Categories (Multilingual)",
    advantagesMulti: "Advantages (Multilingual)",
    footerIcpMulti: "Footer ICP/Copyright (Multilingual)",
    save: "Save Settings",
  },
  ja: {
    pageTitle: "サイト設定",
    previewLang: "プレビュー言語：",
    previewTitle: "設定プレビュー",
    companyName: "会社名",
    companySlogan: "会社スローガン",
    companyIntro: "会社紹介",
    companyAddress: "会社住所",
    phoneLabel: "電話番号",
    emailLabel: "メールアドレス",
    heroBackgroundLabel: "トップ背景画像",
    contactHint: "お問い合わせヒント",
    productCategories: "製品カテゴリ",
    advantages: "強み",
    footerIcp: "フッター备案",
    namePh: "会社名",
    sloganPh: "会社スローガン",
    introPh: "会社紹介",
    addressPh: "会社住所",
    phonePh: "電話番号",
    emailPh: "メールアドレス",
    bannerTitlePh: "トップバナータイトル",
    bannerSubtitlePh: "トップバナーサブタイトル",
    heroBackgroundPh: "トップ背景画像URL（16:9 推奨）",
    heroBackgroundHint: "画像をアップロードするかURLを入力してください。トップの背景画像として使用されます。",
    uploading: "画像アップロード中...",
    uploadFailed: "アップロードに失敗しました",
    contactHintPh: "お問い合わせページのヒント",
    categoriesPh: "製品カテゴリ（中国語、カンマ区切り）",
    advantagesPh: "強み（中国語、カンマ区切り）",
    footerIcpPh: "フッター备案/著作権表記",
    companyNameMulti: "会社名（多言語）",
    companySloganMulti: "会社スローガン（多言語）",
    companyIntroMulti: "会社紹介（多言語）",
    companyAddressMulti: "会社住所（多言語）",
    bannerTitleMulti: "バナータイトル（多言語）",
    bannerSubtitleMulti: "バナーサブタイトル（多言語）",
    contactHintMulti: "お問い合わせヒント（多言語）",
    categoriesMulti: "製品カテゴリ（多言語）",
    advantagesMulti: "強み（多言語）",
    footerIcpMulti: "フッター备案/著作権（多言語）",
    save: "設定を保存",
  },
  ko: {
    pageTitle: "사이트 설정",
    previewLang: "미리보기 언어:",
    previewTitle: "설정 미리보기",
    companyName: "회사명",
    companySlogan: "회사 슬로건",
    companyIntro: "회사 소개",
    companyAddress: "회사 주소",
    phoneLabel: "전화번호",
    emailLabel: "이메일",
    heroBackgroundLabel: "홈 배경 이미지",
    contactHint: "문의 힌트",
    productCategories: "제품 분류",
    advantages: "기업 강점",
    footerIcp: "푸터 ICP",
    namePh: "회사명",
    sloganPh: "회사 슬로건",
    introPh: "회사 소개",
    addressPh: "회사 주소",
    phonePh: "전화번호",
    emailPh: "이메일",
    bannerTitlePh: "홈 배너 제목",
    bannerSubtitlePh: "홈 배너 부제목",
    heroBackgroundPh: "홈 배경 이미지 URL(16:9 권장)",
    heroBackgroundHint: "이미지를 업로드하거나 URL을 입력하세요. 홈 히어로 배경으로 사용됩니다.",
    uploading: "이미지 업로드 중...",
    uploadFailed: "업로드 실패",
    contactHintPh: "문의 페이지 힌트 문구",
    categoriesPh: "제품 분류(중국어, 쉼표 구분)",
    advantagesPh: "기업 강점(중국어, 쉼표 구분)",
    footerIcpPh: "푸터 ICP/저작권",
    companyNameMulti: "회사명(다국어)",
    companySloganMulti: "회사 슬로건(다국어)",
    companyIntroMulti: "회사 소개(다국어)",
    companyAddressMulti: "회사 주소(다국어)",
    bannerTitleMulti: "배너 제목(다국어)",
    bannerSubtitleMulti: "배너 부제목(다국어)",
    contactHintMulti: "문의 힌트(다국어)",
    categoriesMulti: "제품 분류(다국어)",
    advantagesMulti: "기업 강점(다국어)",
    footerIcpMulti: "푸터 ICP/저작권(다국어)",
    save: "설정 저장",
  },
};

function emptyLocalizedText() {
  return { zh: "", en: "", ja: "", ko: "" };
}

function emptyLocalizedList() {
  return { zh: [], en: [], ja: [], ko: [] };
}

function mergeLocalizedList(input?: Partial<Record<LocaleKey, string[]>>, zhFallback: string[] = []): LocalizedList {
  return {
    zh: input?.zh ?? zhFallback,
    en: input?.en ?? [],
    ja: input?.ja ?? [],
    ko: input?.ko ?? [],
  };
}

function listToText(list: string[] = []) {
  return list.join("，");
}

function textToList(text: string) {
  return text
    .split(/[，,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeLocalized(input?: Partial<Record<LocaleKey, string>>, zhFallback = ""): LocalizedText {
  return {
    zh: input?.zh ?? zhFallback,
    en: input?.en ?? "",
    ja: input?.ja ?? "",
    ko: input?.ko ?? "",
  };
}

export default function AdminSettingsPage() {
  const [previewLocale, setPreviewLocale] = useState<LocaleKey>("zh");
  const ui = adminSettingsUi[previewLocale];
  const [form, setForm] = useState<SiteSettings>({
    name: "",
    slogan: "",
    intro: "",
    address: "",
    phone: "",
    email: "",
    bannerTitle: "",
    bannerSubtitle: "",
    heroBackgroundImage: "",
    contactFormHint: "",
    productCategories: "",
    advantages: "",
    footerIcp: "",
  });
  const [i18n, setI18n] = useState<SiteI18n>({
    company: {
      name: emptyLocalizedText(),
      slogan: emptyLocalizedText(),
      intro: emptyLocalizedText(),
      address: emptyLocalizedText(),
      bannerTitle: emptyLocalizedText(),
      bannerSubtitle: emptyLocalizedText(),
    },
    productCategories: emptyLocalizedList(),
    advantages: emptyLocalizedList(),
    contactFormHint: emptyLocalizedText(),
    footerIcp: emptyLocalizedText(),
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function loadSettings() {
    const response = await fetch("/api/site", { cache: "no-store" });
    const data = (await response.json()) as {
      company: SiteSettings;
      heroBackgroundImage?: string;
      contactFormHint?: string;
      productCategories?: string[];
      advantages?: string[];
      footerIcp?: string;
      i18n?: {
        company?: Partial<Record<"name" | "slogan" | "intro" | "address" | "bannerTitle" | "bannerSubtitle", Partial<Record<LocaleKey, string>>>>;
        productCategories?: Partial<Record<LocaleKey, string[]>>;
        advantages?: Partial<Record<LocaleKey, string[]>>;
        contactFormHint?: Partial<Record<LocaleKey, string>>;
        footerIcp?: Partial<Record<LocaleKey, string>>;
      };
    };
    setForm({
      ...data.company,
      heroBackgroundImage: data.heroBackgroundImage ?? "/home-hero.webp",
      contactFormHint: data.contactFormHint ?? "",
      productCategories: listToText(data.productCategories ?? []),
      advantages: listToText(data.advantages ?? []),
      footerIcp: data.footerIcp ?? "",
    });

    setI18n({
      company: {
        name: mergeLocalized(data.i18n?.company?.name, data.company.name),
        slogan: mergeLocalized(data.i18n?.company?.slogan, data.company.slogan),
        intro: mergeLocalized(data.i18n?.company?.intro, data.company.intro),
        address: mergeLocalized(data.i18n?.company?.address, data.company.address),
        bannerTitle: mergeLocalized(data.i18n?.company?.bannerTitle, data.company.bannerTitle),
        bannerSubtitle: mergeLocalized(data.i18n?.company?.bannerSubtitle, data.company.bannerSubtitle),
      },
      productCategories: mergeLocalizedList(data.i18n?.productCategories, data.productCategories ?? []),
      advantages: mergeLocalizedList(data.i18n?.advantages, data.advantages ?? []),
      contactFormHint: mergeLocalized(data.i18n?.contactFormHint, data.contactFormHint ?? ""),
      footerIcp: mergeLocalized(data.i18n?.footerIcp, data.footerIcp ?? ""),
    });
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleUploadHeroImage(file: File) {
    setUploadError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/product-image", {
      method: "POST",
      body: formData,
    });

    setIsUploading(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setUploadError(data.message ?? ui.uploadFailed);
      return;
    }

    const data = (await response.json()) as { url: string };
    setForm((prev) => ({ ...prev, heroBackgroundImage: data.url }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        productCategories: textToList(form.productCategories),
        advantages: textToList(form.advantages),
        companyI18n: i18n.company,
        productCategoriesI18n: i18n.productCategories,
        advantagesI18n: i18n.advantages,
        contactFormHintI18n: i18n.contactFormHint,
        footerIcpI18n: i18n.footerIcp,
      }),
    });
    await loadSettings();
  }

  function renderLocaleListInputs(
    title: string,
    value: LocalizedList,
    onChange: (locale: LocaleKey, text: string) => void,
  ) {
    return (
      <div className="rounded-md border border-border bg-white p-3">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          {localeOptions.map((item) => (
            <label key={item.key} className="space-y-1">
              <span className="text-xs text-muted">{item.label}</span>
              <input
                value={listToText(value[item.key])}
                onChange={(event) => onChange(item.key, event.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="用逗号分隔"
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  function renderLocaleInputs(
    title: string,
    value: LocalizedText,
    onChange: (locale: LocaleKey, text: string) => void,
    multiline = false,
  ) {
    return (
      <div className="rounded-md border border-border bg-white p-3">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          {localeOptions.map((item) => (
            <label key={item.key} className="space-y-1">
              <span className="text-xs text-muted">{item.label}</span>
              {multiline ? (
                <textarea
                  value={value[item.key]}
                  onChange={(event) => onChange(item.key, event.target.value)}
                  className="h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
                />
              ) : (
                <input
                  value={value[item.key]}
                  onChange={(event) => onChange(item.key, event.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                />
              )}
            </label>
          ))}
        </div>
      </div>
    );
  }

  function previewText(localized: LocalizedText, zhFallback: string) {
    return localized[previewLocale] || localized.zh || zhFallback;
  }

  function previewList(localized: LocalizedList, zhFallbackText: string) {
    const list = localized[previewLocale]?.length ? localized[previewLocale] : localized.zh;
    if (list.length > 0) {
      return list.join("，");
    }
    return zhFallbackText;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{ui.pageTitle}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">{ui.previewLang}</span>
        {localeOptions.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPreviewLocale(item.key)}
            className={`rounded-md px-3 py-1 text-sm ${previewLocale === item.key ? "bg-primary text-white" : "border border-border bg-white text-gray-700"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <p className="text-sm font-semibold text-primary">{ui.previewTitle}（{previewLocale.toUpperCase()}）</p>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
          <p><span className="text-muted">{ui.companyName}：</span>{previewText(i18n.company.name, form.name)}</p>
          <p><span className="text-muted">{ui.companySlogan}：</span>{previewText(i18n.company.slogan, form.slogan)}</p>
          <p className="md:col-span-2"><span className="text-muted">{ui.heroBackgroundLabel}：</span>{form.heroBackgroundImage || "-"}</p>
          <p className="md:col-span-2"><span className="text-muted">{ui.companyIntro}：</span>{previewText(i18n.company.intro, form.intro)}</p>
          <p><span className="text-muted">{ui.companyAddress}：</span>{previewText(i18n.company.address, form.address)}</p>
          <p><span className="text-muted">{ui.contactHint}：</span>{previewText(i18n.contactFormHint, form.contactFormHint)}</p>
          <p className="md:col-span-2"><span className="text-muted">{ui.productCategories}：</span>{previewList(i18n.productCategories, form.productCategories)}</p>
          <p className="md:col-span-2"><span className="text-muted">{ui.advantages}：</span>{previewList(i18n.advantages, form.advantages)}</p>
          <p><span className="text-muted">{ui.footerIcp}：</span>{previewText(i18n.footerIcp, form.footerIcp)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-4xl grid-cols-1 gap-3 rounded-xl border border-border bg-light-blue p-4">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-gray-700">{ui.heroBackgroundLabel}</span>
          <input
            value={form.heroBackgroundImage}
            onChange={(event) => setForm((prev) => ({ ...prev, heroBackgroundImage: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.heroBackgroundPh}
          />
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleUploadHeroImage(file);
            }
          }}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted">{ui.heroBackgroundHint}</p>
        {isUploading ? <p className="text-xs text-primary">{ui.uploading}</p> : null}
        {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
        {form.heroBackgroundImage ? (
          <img src={form.heroBackgroundImage} alt="hero background preview" className="aspect-video w-full rounded-md border border-border object-cover" />
        ) : null}

        <label className="space-y-1">
          <span className="text-sm font-semibold text-gray-700">{ui.phoneLabel}</span>
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.phonePh}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-semibold text-gray-700">{ui.emailLabel}</span>
          <input
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.emailPh}
          />
        </label>

        {renderLocaleInputs(ui.companyNameMulti, i18n.company.name, (locale, text) => {
          setI18n((prev) => ({ ...prev, company: { ...prev.company, name: { ...prev.company.name, [locale]: text } } }));
        })}
        {renderLocaleInputs(ui.companySloganMulti, i18n.company.slogan, (locale, text) => {
          setI18n((prev) => ({ ...prev, company: { ...prev.company, slogan: { ...prev.company.slogan, [locale]: text } } }));
        })}
        {renderLocaleInputs(ui.companyIntroMulti, i18n.company.intro, (locale, text) => {
          setI18n((prev) => ({ ...prev, company: { ...prev.company, intro: { ...prev.company.intro, [locale]: text } } }));
        }, true)}
        {renderLocaleInputs(ui.companyAddressMulti, i18n.company.address, (locale, text) => {
          setI18n((prev) => ({ ...prev, company: { ...prev.company, address: { ...prev.company.address, [locale]: text } } }));
        })}
        {renderLocaleInputs(ui.bannerTitleMulti, i18n.company.bannerTitle, (locale, text) => {
          setI18n((prev) => ({ ...prev, company: { ...prev.company, bannerTitle: { ...prev.company.bannerTitle, [locale]: text } } }));
        })}
        {renderLocaleInputs(ui.bannerSubtitleMulti, i18n.company.bannerSubtitle, (locale, text) => {
          setI18n((prev) => ({ ...prev, company: { ...prev.company, bannerSubtitle: { ...prev.company.bannerSubtitle, [locale]: text } } }));
        }, true)}
        {renderLocaleInputs(ui.contactHintMulti, i18n.contactFormHint, (locale, text) => {
          setI18n((prev) => ({ ...prev, contactFormHint: { ...prev.contactFormHint, [locale]: text } }));
        })}
        {renderLocaleListInputs(ui.categoriesMulti, i18n.productCategories, (locale, text) => {
          setI18n((prev) => ({ ...prev, productCategories: { ...prev.productCategories, [locale]: textToList(text) } }));
        })}
        {renderLocaleListInputs(ui.advantagesMulti, i18n.advantages, (locale, text) => {
          setI18n((prev) => ({ ...prev, advantages: { ...prev.advantages, [locale]: textToList(text) } }));
        })}
        {renderLocaleInputs(ui.footerIcpMulti, i18n.footerIcp, (locale, text) => {
          setI18n((prev) => ({ ...prev, footerIcp: { ...prev.footerIcp, [locale]: text } }));
        })}

        <button type="submit" className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          {ui.save}
        </button>
      </form>
    </div>
  );
}
