"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Locale = "zh" | "en" | "ja" | "ko";

type LocalizedText = Partial<Record<Locale, string>>;
type LocalizedList = Partial<Record<Locale, string[]>>;

type CaseStudy = {
  title: LocalizedText;
  summary: LocalizedText;
  image: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  categoryI18n: LocalizedText;
  summary: string;
  image: string;
  features: string[];
  nameI18n: LocalizedText;
  summaryI18n: LocalizedText;
  featuresI18n: LocalizedList;
  videos: string[];
  caseStudies: CaseStudy[];
};

type CategoryOption = {
  zh: string;
  en: string;
  ja: string;
  ko: string;
};

const adminProductUi: Record<Locale, Record<string, string>> = {
  zh: {
    pageTitle: "产品管理",
    previewLang: "预览语言：",
    edit: "编辑",
    remove: "删除",
    editProduct: "编辑产品",
    newProduct: "新增产品",
    nameMulti: "产品名称（多语言）",
    nameZh: "中文名称",
    nameEn: "English Name",
    nameJa: "日本語名称",
    nameKo: "한국어 이름",
    categoryMulti: "产品分类（下拉选择）",
    categorySelect: "选择分类",
    categoryAutoFill: "分类多语言值会随选项自动填充",
    categoryManage: "去产品配置页管理分类",
    categoryEmpty: "暂无分类，请先到产品配置页添加分类。",
    summaryMulti: "产品简介（多语言）",
    summaryZh: "中文简介",
    summaryEn: "English Summary",
    summaryJa: "日本語概要",
    summaryKo: "한국어 요약",
    imageUrl: "图片地址（上传后自动填充）",
    imageUploadHint: "建议上传不超过 5MB 的图片；系统会自动处理为 16:9（等比缩放，空白透明补边）",
    uploading: "图片上传中...",
    uploadFailed: "上传失败",
    imagePreview: "图片预览",
    featuresMulti: "产品特性（多语言，逗号分隔）",
    featuresZh: "中文特性",
    featuresEn: "English Features",
    featuresJa: "日本語特性",
    featuresKo: "한국어 특성",
    videosPlaceholder: "产品介绍视频URL（每行一个）",
    save: "保存修改",
    create: "新增产品",
    cancel: "取消",
  },
  en: {
    pageTitle: "Product Management",
    previewLang: "Preview Language:",
    edit: "Edit",
    remove: "Delete",
    editProduct: "Edit Product",
    newProduct: "New Product",
    nameMulti: "Product Name (Multilingual)",
    nameZh: "Chinese Name",
    nameEn: "English Name",
    nameJa: "Japanese Name",
    nameKo: "Korean Name",
    categoryMulti: "Product Category (Dropdown)",
    categorySelect: "Select Category",
    categoryAutoFill: "Multilingual category values are auto-filled from selected option",
    categoryManage: "Manage categories in Product Config",
    categoryEmpty: "No categories yet. Please add categories in Product Config first.",
    summaryMulti: "Product Summary (Multilingual)",
    summaryZh: "Chinese Summary",
    summaryEn: "English Summary",
    summaryJa: "Japanese Summary",
    summaryKo: "Korean Summary",
    imageUrl: "Image URL (auto-filled after upload)",
    imageUploadHint: "Use images up to 5MB; system auto-converts to 16:9 (scaled with transparent padding)",
    uploading: "Uploading image...",
    uploadFailed: "Upload failed",
    imagePreview: "Image Preview",
    featuresMulti: "Product Features (Multilingual, comma separated)",
    featuresZh: "Chinese Features",
    featuresEn: "English Features",
    featuresJa: "Japanese Features",
    featuresKo: "Korean Features",
    videosPlaceholder: "Product video URLs (one per line)",
    save: "Save Changes",
    create: "Create Product",
    cancel: "Cancel",
  },
  ja: {
    pageTitle: "製品管理",
    previewLang: "プレビュー言語：",
    edit: "編集",
    remove: "削除",
    editProduct: "製品を編集",
    newProduct: "製品を追加",
    nameMulti: "製品名（多言語）",
    nameZh: "中国語名",
    nameEn: "英語名",
    nameJa: "日本語名",
    nameKo: "韓国語名",
    categoryMulti: "製品カテゴリ（選択式）",
    categorySelect: "カテゴリを選択",
    categoryAutoFill: "カテゴリの多言語値は選択に応じて自動入力されます",
    categoryManage: "製品設定ページでカテゴリを管理",
    categoryEmpty: "カテゴリがありません。先に製品設定ページで追加してください。",
    summaryMulti: "製品概要（多言語）",
    summaryZh: "中国語概要",
    summaryEn: "英語概要",
    summaryJa: "日本語概要",
    summaryKo: "韓国語概要",
    imageUrl: "画像URL（アップロード後に自動入力）",
    imageUploadHint: "5MB 以下の画像を推奨。システムが 16:9（等比拡大縮小＋透明余白）に自動変換します",
    uploading: "画像アップロード中...",
    uploadFailed: "アップロードに失敗しました",
    imagePreview: "画像プレビュー",
    featuresMulti: "製品特性（多言語、カンマ区切り）",
    featuresZh: "中国語特性",
    featuresEn: "英語特性",
    featuresJa: "日本語特性",
    featuresKo: "韓国語特性",
    videosPlaceholder: "製品紹介動画URL（1行1件）",
    save: "変更を保存",
    create: "製品を追加",
    cancel: "キャンセル",
  },
  ko: {
    pageTitle: "제품 관리",
    previewLang: "미리보기 언어:",
    edit: "수정",
    remove: "삭제",
    editProduct: "제품 수정",
    newProduct: "제품 추가",
    nameMulti: "제품명(다국어)",
    nameZh: "중국어 이름",
    nameEn: "영문 이름",
    nameJa: "일본어 이름",
    nameKo: "한국어 이름",
    categoryMulti: "제품 분류(드롭다운)",
    categorySelect: "분류 선택",
    categoryAutoFill: "선택한 항목 기준으로 분류 다국어 값이 자동 입력됩니다",
    categoryManage: "제품 설정 페이지에서 분류 관리",
    categoryEmpty: "분류가 없습니다. 먼저 제품 설정 페이지에서 추가해 주세요.",
    summaryMulti: "제품 요약(다국어)",
    summaryZh: "중국어 요약",
    summaryEn: "영문 요약",
    summaryJa: "일본어 요약",
    summaryKo: "한국어 요약",
    imageUrl: "이미지 URL(업로드 후 자동 입력)",
    imageUploadHint: "5MB 이하 이미지를 권장하며, 시스템이 16:9(비율 유지 + 투명 여백)로 자동 변환합니다",
    uploading: "이미지 업로드 중...",
    uploadFailed: "업로드 실패",
    imagePreview: "이미지 미리보기",
    featuresMulti: "제품 특성(다국어, 쉼표 구분)",
    featuresZh: "중국어 특성",
    featuresEn: "영문 특성",
    featuresJa: "일본어 특성",
    featuresKo: "한국어 특성",
    videosPlaceholder: "제품 소개 영상 URL(줄바꿈으로 구분)",
    save: "변경 저장",
    create: "제품 추가",
    cancel: "취소",
  },
};

const emptyForm = {
  nameZh: "",
  nameEn: "",
  nameJa: "",
  nameKo: "",
  categoryZh: "",
  categoryEn: "",
  categoryJa: "",
  categoryKo: "",
  summaryZh: "",
  summaryEn: "",
  summaryJa: "",
  summaryKo: "",
  image: "",
  featuresZh: "",
  featuresEn: "",
  featuresJa: "",
  featuresKo: "",
  videos: "",
};

function listToInput(list: string[] | undefined): string {
  return (list ?? []).join("，");
}

function inputToList(value: string): string[] {
  return value
    .split(/[，,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [previewLocale, setPreviewLocale] = useState<Locale>("zh");
  const [form, setForm] = useState(emptyForm);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const ui = adminProductUi[previewLocale];

  async function loadProducts() {
    const response = await fetch("/api/products", { cache: "no-store" });
    const data = (await response.json()) as Product[];
    setProducts(data);
  }

  async function loadCategoryOptions() {
    const response = await fetch("/api/site", { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as {
      productCategoryCards?: Array<{
        name?: string;
        nameI18n?: Partial<Record<Locale, string>>;
      }>;
      productCategories?: string[];
      i18n?: {
        productCategories?: Partial<Record<Locale, string[]>>;
      };
    };

    const cards = data.productCategoryCards ?? [];
    const fromCards: CategoryOption[] = cards
      .map((item) => {
        const zh = item.nameI18n?.zh ?? item.name ?? "";
        if (!zh) return null;
        return {
          zh,
          en: item.nameI18n?.en ?? "",
          ja: item.nameI18n?.ja ?? "",
          ko: item.nameI18n?.ko ?? "",
        };
      })
      .filter((item): item is CategoryOption => item !== null);

    if (fromCards.length > 0) {
      setCategoryOptions(fromCards);
      return;
    }

    const zhList = data.i18n?.productCategories?.zh ?? data.productCategories ?? [];
    const enList = data.i18n?.productCategories?.en ?? [];
    const jaList = data.i18n?.productCategories?.ja ?? [];
    const koList = data.i18n?.productCategories?.ko ?? [];

    setCategoryOptions(
      zhList.map((zh, index) => ({
        zh,
        en: enList[index] ?? "",
        ja: jaList[index] ?? "",
        ko: koList[index] ?? "",
      })),
    );
  }

  useEffect(() => {
    loadProducts();
    loadCategoryOptions();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedId) ?? null,
    [products, selectedId],
  );

  function pickText(localized: LocalizedText | undefined, fallback: string, locale: Locale) {
    return localized?.[locale] ?? localized?.zh ?? fallback;
  }

  function pickCategoryOptionLabel(option: CategoryOption, locale: Locale) {
    return option[locale] || option.zh || option.en || option.ja || option.ko;
  }

  useEffect(() => {
    if (!selectedProduct) {
      setForm(emptyForm);
      return;
    }

    setForm({
      nameZh: selectedProduct.nameI18n?.zh ?? selectedProduct.name,
      nameEn: selectedProduct.nameI18n?.en ?? "",
      nameJa: selectedProduct.nameI18n?.ja ?? "",
      nameKo: selectedProduct.nameI18n?.ko ?? "",
      categoryZh: selectedProduct.categoryI18n?.zh ?? selectedProduct.category,
      categoryEn: selectedProduct.categoryI18n?.en ?? "",
      categoryJa: selectedProduct.categoryI18n?.ja ?? "",
      categoryKo: selectedProduct.categoryI18n?.ko ?? "",
      summaryZh: selectedProduct.summaryI18n?.zh ?? selectedProduct.summary,
      summaryEn: selectedProduct.summaryI18n?.en ?? "",
      summaryJa: selectedProduct.summaryI18n?.ja ?? "",
      summaryKo: selectedProduct.summaryI18n?.ko ?? "",
      image: selectedProduct.image,
      featuresZh: listToInput(selectedProduct.featuresI18n?.zh ?? selectedProduct.features),
      featuresEn: listToInput(selectedProduct.featuresI18n?.en),
      featuresJa: listToInput(selectedProduct.featuresI18n?.ja),
      featuresKo: listToInput(selectedProduct.featuresI18n?.ko),
      videos: (selectedProduct.videos ?? []).join("\n"),
    });
  }, [selectedProduct]);

  function buildPayload(caseStudies: Product["caseStudies"] = []) {
    return {
      name: form.nameZh.trim(),
      category: form.categoryZh.trim(),
      categoryI18n: {
        zh: form.categoryZh.trim(),
        en: form.categoryEn.trim(),
        ja: form.categoryJa.trim(),
        ko: form.categoryKo.trim(),
      },
      summary: form.summaryZh.trim(),
      image: form.image.trim(),
      features: inputToList(form.featuresZh),
      nameI18n: {
        zh: form.nameZh.trim(),
        en: form.nameEn.trim(),
        ja: form.nameJa.trim(),
        ko: form.nameKo.trim(),
      },
      summaryI18n: {
        zh: form.summaryZh.trim(),
        en: form.summaryEn.trim(),
        ja: form.summaryJa.trim(),
        ko: form.summaryKo.trim(),
      },
      featuresI18n: {
        zh: inputToList(form.featuresZh),
        en: inputToList(form.featuresEn),
        ja: inputToList(form.featuresJa),
        ko: inputToList(form.featuresKo),
      },
      videos: form.videos
        .split(/\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      caseStudies,
    };
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setSubmitError("");
    const payload = buildPayload([]);

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setForm(emptyForm);
    setSelectedId(null);
    await loadProducts();
  }

  async function handleUpdate(event: FormEvent) {
    event.preventDefault();
    if (!selectedId) return;

    setSubmitError("");
    const payload = buildPayload(selectedProduct?.caseStudies ?? []);

    await fetch(`/api/products/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await loadProducts();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (selectedId === id) {
      setSelectedId(null);
      setForm(emptyForm);
    }
    await loadProducts();
  }

  async function handleUploadImage(file: File) {
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
      const error = (await response.json()) as { message?: string };
      setUploadError(error.message ?? ui.uploadFailed);
      return;
    }

    const data = (await response.json()) as { url: string };
    setForm((prev) => ({ ...prev, image: data.url }));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{ui.pageTitle}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">{ui.previewLang}</span>
        {(["zh", "en", "ja", "ko"] as Locale[]).map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setPreviewLocale(locale)}
            className={`rounded-md px-3 py-1 text-sm ${previewLocale === locale ? "bg-primary text-white" : "border border-border bg-white text-gray-700"}`}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-primary">{pickText(product.categoryI18n, product.category, previewLocale)}</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{pickText(product.nameI18n, product.name, previewLocale)}</p>
                  <p className="mt-1 text-sm text-muted">{pickText(product.summaryI18n, product.summary, previewLocale)}</p>
                  {product.image ? (
                    <img src={product.image} alt={pickText(product.nameI18n, product.name, previewLocale)} className="mt-2 aspect-video w-24 rounded-md border border-border object-cover" />
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(product.id)}
                    className="rounded-md border border-border px-3 py-1 text-sm"
                  >
                    {ui.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="rounded-md bg-red-600 px-3 py-1 text-sm text-white"
                  >
                    {ui.remove}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={selectedId ? handleUpdate : handleCreate} className="space-y-3 rounded-xl border border-border bg-light-blue p-4">
          <p className="text-lg font-semibold text-primary">{selectedId ? ui.editProduct : ui.newProduct}</p>

          <p className="text-sm font-semibold text-gray-700">{ui.nameMulti}</p>
          <input
            value={form.nameZh}
            onChange={(event) => setForm((prev) => ({ ...prev, nameZh: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.nameZh}
          />
          <input
            value={form.nameEn}
            onChange={(event) => setForm((prev) => ({ ...prev, nameEn: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.nameEn}
          />
          <input
            value={form.nameJa}
            onChange={(event) => setForm((prev) => ({ ...prev, nameJa: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.nameJa}
          />
          <input
            value={form.nameKo}
            onChange={(event) => setForm((prev) => ({ ...prev, nameKo: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.nameKo}
          />
          <p className="text-sm font-semibold text-gray-700">{ui.categoryMulti}</p>
          <select
            value={form.categoryZh}
            onChange={(event) => {
              const selected = categoryOptions.find((item) => item.zh === event.target.value);
              if (!selected) {
                setForm((prev) => ({ ...prev, categoryZh: event.target.value }));
                return;
              }
              setForm((prev) => ({
                ...prev,
                categoryZh: selected.zh,
                categoryEn: selected.en,
                categoryJa: selected.ja,
                categoryKo: selected.ko,
              }));
            }}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            <option value="">{ui.categorySelect}</option>
            {categoryOptions.map((item) => (
              <option key={`${item.zh}-${item.en}`} value={item.zh}>
                {pickCategoryOptionLabel(item, previewLocale)}
              </option>
            ))}
            {form.categoryZh && !categoryOptions.some((item) => item.zh === form.categoryZh) ? (
              <option value={form.categoryZh}>{form.categoryZh}</option>
            ) : null}
          </select>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted">{ui.categoryAutoFill}</p>
            <Link href="/admin/product-config" className="text-xs font-medium text-primary underline">
              {ui.categoryManage}
            </Link>
          </div>
          {categoryOptions.length === 0 ? <p className="text-xs text-amber-700">{ui.categoryEmpty}</p> : null}

          <p className="text-sm font-semibold text-gray-700">{ui.summaryMulti}</p>
          <input
            value={form.summaryZh}
            onChange={(event) => setForm((prev) => ({ ...prev, summaryZh: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.summaryZh}
          />
          <input
            value={form.summaryEn}
            onChange={(event) => setForm((prev) => ({ ...prev, summaryEn: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.summaryEn}
          />
          <input
            value={form.summaryJa}
            onChange={(event) => setForm((prev) => ({ ...prev, summaryJa: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.summaryJa}
          />
          <input
            value={form.summaryKo}
            onChange={(event) => setForm((prev) => ({ ...prev, summaryKo: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.summaryKo}
          />
          <input
            value={form.image}
            onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.imageUrl}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUploadImage(file);
              }
            }}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted">{ui.imageUploadHint}</p>
          {isUploading ? <p className="text-xs text-primary">{ui.uploading}</p> : null}
          {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
          {form.image ? (
            <div className="rounded-md border border-border bg-white p-2">
              <p className="mb-2 text-xs text-muted">{ui.imagePreview}</p>
              <img src={form.image} alt="产品预览" className="aspect-video w-full rounded-md object-cover" />
            </div>
          ) : null}

          <p className="text-sm font-semibold text-gray-700">{ui.featuresMulti}</p>
          <input
            value={form.featuresZh}
            onChange={(event) => setForm((prev) => ({ ...prev, featuresZh: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.featuresZh}
          />
          <input
            value={form.featuresEn}
            onChange={(event) => setForm((prev) => ({ ...prev, featuresEn: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.featuresEn}
          />
          <input
            value={form.featuresJa}
            onChange={(event) => setForm((prev) => ({ ...prev, featuresJa: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.featuresJa}
          />
          <input
            value={form.featuresKo}
            onChange={(event) => setForm((prev) => ({ ...prev, featuresKo: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.featuresKo}
          />

          <textarea
            value={form.videos}
            onChange={(event) => setForm((prev) => ({ ...prev, videos: event.target.value }))}
            className="h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder={ui.videosPlaceholder}
          />

          {submitError ? <p className="text-xs text-red-600">{submitError}</p> : null}

          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
              {selectedId ? ui.save : ui.create}
            </button>
            {selectedId ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setForm(emptyForm);
                }}
                className="rounded-md border border-border bg-white px-4 py-2 text-sm"
              >
                {ui.cancel}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
