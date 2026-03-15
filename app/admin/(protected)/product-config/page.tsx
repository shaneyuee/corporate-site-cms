"use client";

import { FormEvent, useEffect, useState } from "react";

type Locale = "zh" | "en" | "ja" | "ko";
type LocalizedText = Record<Locale, string>;

type CategoryCard = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
};

const localeOptions = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ja", label: "日本語" },
  { key: "ko", label: "한국어" },
] as const;

const uiText: Record<Locale, Record<string, string>> = {
  zh: {
    pageTitle: "产品配置",
    previewLang: "预览语言：",
    descMulti: "产品页描述（多语言）",
    categoriesMulti: "产品分类与描述（多语言）",
    addCategory: "添加分类",
    categoryName: "分类名称",
    categoryDesc: "分类描述",
    remove: "删除",
    save: "保存配置",
    saved: "已保存",
    loadFail: "加载失败",
    saveFail: "保存失败",
  },
  en: {
    pageTitle: "Product Config",
    previewLang: "Preview Language:",
    descMulti: "Products Page Description (Multilingual)",
    categoriesMulti: "Product Categories & Descriptions (Multilingual)",
    addCategory: "Add Category",
    categoryName: "Category Name",
    categoryDesc: "Category Description",
    remove: "Remove",
    save: "Save Config",
    saved: "Saved",
    loadFail: "Load failed",
    saveFail: "Save failed",
  },
  ja: {
    pageTitle: "製品設定",
    previewLang: "プレビュー言語：",
    descMulti: "製品ページ説明（多言語）",
    categoriesMulti: "製品カテゴリと説明（多言語）",
    addCategory: "カテゴリ追加",
    categoryName: "カテゴリ名",
    categoryDesc: "カテゴリ説明",
    remove: "削除",
    save: "設定を保存",
    saved: "保存しました",
    loadFail: "読み込み失敗",
    saveFail: "保存失敗",
  },
  ko: {
    pageTitle: "제품 설정",
    previewLang: "미리보기 언어:",
    descMulti: "제품 페이지 설명(다국어)",
    categoriesMulti: "제품 분류 및 설명(다국어)",
    addCategory: "분류 추가",
    categoryName: "분류명",
    categoryDesc: "분류 설명",
    remove: "삭제",
    save: "설정 저장",
    saved: "저장됨",
    loadFail: "불러오기 실패",
    saveFail: "저장 실패",
  },
};

function emptyLocalizedText(): LocalizedText {
  return { zh: "", en: "", ja: "", ko: "" };
}

function createEmptyCard(): CategoryCard {
  return {
    id: `card-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: emptyLocalizedText(),
    description: emptyLocalizedText(),
  };
}

export default function AdminProductConfigPage() {
  const [previewLocale, setPreviewLocale] = useState<Locale>("zh");
  const [descriptionI18n, setDescriptionI18n] = useState<LocalizedText>(emptyLocalizedText());
  const [categoryCards, setCategoryCards] = useState<CategoryCard[]>([]);
  const [status, setStatus] = useState("");

  const ui = uiText[previewLocale];

  async function loadConfig() {
    setStatus("");
    const response = await fetch("/api/site", { cache: "no-store" });
    if (!response.ok) {
      setStatus(ui.loadFail);
      return;
    }

    const data = (await response.json()) as {
      productPageDescription?: string;
      productCategoryCards?: Array<{
        name: string;
        description: string;
        nameI18n?: Partial<Record<Locale, string>>;
        descriptionI18n?: Partial<Record<Locale, string>>;
      }>;
      productCategories?: string[];
      i18n?: {
        productPageDescription?: Partial<Record<Locale, string>>;
        productCategories?: Partial<Record<Locale, string[]>>;
        productCategoryDescriptions?: Partial<Record<Locale, string[]>>;
      };
    };

    setDescriptionI18n({
      zh: data.i18n?.productPageDescription?.zh ?? data.productPageDescription ?? "",
      en: data.i18n?.productPageDescription?.en ?? "",
      ja: data.i18n?.productPageDescription?.ja ?? "",
      ko: data.i18n?.productPageDescription?.ko ?? "",
    });

    if (data.productCategoryCards && data.productCategoryCards.length > 0) {
      setCategoryCards(
        data.productCategoryCards.map((item, index) => ({
          id: `remote-${index}`,
          name: {
            zh: item.nameI18n?.zh ?? item.name ?? "",
            en: item.nameI18n?.en ?? "",
            ja: item.nameI18n?.ja ?? "",
            ko: item.nameI18n?.ko ?? "",
          },
          description: {
            zh: item.descriptionI18n?.zh ?? item.description ?? "",
            en: item.descriptionI18n?.en ?? "",
            ja: item.descriptionI18n?.ja ?? "",
            ko: item.descriptionI18n?.ko ?? "",
          },
        })),
      );
      return;
    }

    const fallbackNames = data.i18n?.productCategories ?? { zh: data.productCategories ?? [], en: [], ja: [], ko: [] };
    const fallbackDescs = data.i18n?.productCategoryDescriptions ?? { zh: [], en: [], ja: [], ko: [] };
    const count = Math.max(
      fallbackNames.zh?.length ?? 0,
      fallbackNames.en?.length ?? 0,
      fallbackNames.ja?.length ?? 0,
      fallbackNames.ko?.length ?? 0,
    );

    setCategoryCards(
      Array.from({ length: count }).map((_, index) => ({
        id: `fallback-${index}`,
        name: {
          zh: fallbackNames.zh?.[index] ?? "",
          en: fallbackNames.en?.[index] ?? "",
          ja: fallbackNames.ja?.[index] ?? "",
          ko: fallbackNames.ko?.[index] ?? "",
        },
        description: {
          zh: fallbackDescs.zh?.[index] ?? "",
          en: fallbackDescs.en?.[index] ?? "",
          ja: fallbackDescs.ja?.[index] ?? "",
          ko: fallbackDescs.ko?.[index] ?? "",
        },
      })),
    );
  }

  useEffect(() => {
    loadConfig();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("");

    const filteredCards = categoryCards
      .map((item) => ({
        name: {
          zh: item.name.zh.trim(),
          en: item.name.en.trim(),
          ja: item.name.ja.trim(),
          ko: item.name.ko.trim(),
        },
        description: {
          zh: item.description.zh.trim(),
          en: item.description.en.trim(),
          ja: item.description.ja.trim(),
          ko: item.description.ko.trim(),
        },
      }))
      .filter((item) => item.name.zh || item.name.en || item.name.ja || item.name.ko);

    const response = await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productPageDescription: descriptionI18n.zh,
        productPageDescriptionI18n: descriptionI18n,
        productCategories: filteredCards.map((item) => item.name.zh),
        productCategoriesI18n: {
          zh: filteredCards.map((item) => item.name.zh),
          en: filteredCards.map((item) => item.name.en),
          ja: filteredCards.map((item) => item.name.ja),
          ko: filteredCards.map((item) => item.name.ko),
        },
        productCategoryDescriptionsI18n: {
          zh: filteredCards.map((item) => item.description.zh),
          en: filteredCards.map((item) => item.description.en),
          ja: filteredCards.map((item) => item.description.ja),
          ko: filteredCards.map((item) => item.description.ko),
        },
        productCategoryCards: filteredCards.map((item) => ({
          name: item.name.zh,
          description: item.description.zh,
          nameI18n: item.name,
          descriptionI18n: item.description,
        })),
      }),
    });

    if (!response.ok) {
      setStatus(ui.saveFail);
      return;
    }

    setStatus(ui.saved);
    await loadConfig();
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

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border bg-light-blue p-4">
        <div className="rounded-md border border-border bg-white p-3">
          <p className="text-sm font-semibold text-gray-700">{ui.descMulti}</p>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            {localeOptions.map((item) => (
              <label key={item.key} className="space-y-1">
                <span className="text-xs text-muted">{item.label}</span>
                <textarea
                  value={descriptionI18n[item.key]}
                  onChange={(event) => setDescriptionI18n((prev) => ({ ...prev, [item.key]: event.target.value }))}
                  className="h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-white p-3">
          <p className="text-sm font-semibold text-gray-700">{ui.categoriesMulti}</p>
          <div className="mt-3 space-y-3">
            {categoryCards.map((card, index) => (
              <div key={card.id} className="rounded-md border border-border bg-light-blue p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-primary">#{index + 1}</p>
                  <button
                    type="button"
                    onClick={() => setCategoryCards((prev) => prev.filter((item) => item.id !== card.id))}
                    className="rounded-md border border-red-300 bg-white px-2 py-1 text-xs text-red-600"
                  >
                    {ui.remove}
                  </button>
                </div>

                <p className="mb-1 text-xs font-semibold text-gray-700">{ui.categoryName}</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {localeOptions.map((item) => (
                    <label key={`${card.id}-name-${item.key}`} className="space-y-1">
                      <span className="text-xs text-muted">{item.label}</span>
                      <input
                        value={card.name[item.key]}
                        onChange={(event) =>
                          setCategoryCards((prev) =>
                            prev.map((it) =>
                              it.id === card.id
                                ? { ...it, name: { ...it.name, [item.key]: event.target.value } }
                                : it,
                            ),
                          )
                        }
                        className="w-full rounded-md border border-border px-3 py-2 text-sm"
                      />
                    </label>
                  ))}
                </div>

                <p className="mb-1 mt-3 text-xs font-semibold text-gray-700">{ui.categoryDesc}</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {localeOptions.map((item) => (
                    <label key={`${card.id}-desc-${item.key}`} className="space-y-1">
                      <span className="text-xs text-muted">{item.label}</span>
                      <textarea
                        value={card.description[item.key]}
                        onChange={(event) =>
                          setCategoryCards((prev) =>
                            prev.map((it) =>
                              it.id === card.id
                                ? { ...it, description: { ...it.description, [item.key]: event.target.value } }
                                : it,
                            ),
                          )
                        }
                        className="h-20 w-full rounded-md border border-border px-3 py-2 text-sm"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setCategoryCards((prev) => [...prev, createEmptyCard()])}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-gray-700"
            >
              {ui.addCategory}
            </button>
          </div>
        </div>

        {status ? <p className="text-sm text-primary">{status}</p> : null}

        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          {ui.save}
        </button>
      </form>
    </div>
  );
}
