"use client";

import { useEffect, useMemo, useState } from "react";

type Locale = "zh" | "en" | "ja" | "ko";
type LocalizedText = Partial<Record<Locale, string>>;

type CaseStudy = {
  title: LocalizedText;
  summary: LocalizedText;
  image: string;
};

type Product = {
  id: number;
  name: string;
  nameI18n: LocalizedText;
  category: string;
  categoryI18n: LocalizedText;
  caseStudies: CaseStudy[];
};

const uiDict: Record<Locale, Record<string, string>> = {
  zh: {
    pageTitle: "案例管理",
    previewLang: "预览语言：",
    productList: "产品列表",
    caseCount: "案例数",
    editCases: "编辑案例",
    noProducts: "暂无产品",
    formTitle: "成功案例编辑",
    pickProduct: "请先从左侧选择产品",
    addCase: "新增案例",
    caseList: "当前案例",
    emptyCases: "暂无案例",
    titleMulti: "案例标题（多语言）",
    summaryMulti: "案例简介（多语言）",
    titleZh: "中文标题",
    titleEn: "English Title",
    titleJa: "日本語タイトル",
    titleKo: "한국어 제목",
    summaryZh: "中文简介",
    summaryEn: "English Summary",
    summaryJa: "日本語概要",
    summaryKo: "한국어 요약",
    imageUrl: "案例图片地址（上传后自动填充）",
    imageHint: "建议上传不超过 5MB 的图片；系统会自动处理为 16:9（等比缩放，空白透明补边）",
    upload: "上传图片",
    uploading: "图片上传中...",
    saveCase: "保存案例",
    updateCase: "更新案例",
    cancel: "取消",
    delete: "删除",
    saved: "案例已保存",
    saveFailed: "保存失败",
    uploadFailed: "上传失败",
  },
  en: {
    pageTitle: "Case Management",
    previewLang: "Preview Language:",
    productList: "Products",
    caseCount: "Cases",
    editCases: "Edit Cases",
    noProducts: "No products",
    formTitle: "Success Case Editor",
    pickProduct: "Select a product from the left first",
    addCase: "Add Case",
    caseList: "Current Cases",
    emptyCases: "No cases yet",
    titleMulti: "Case Title (Multilingual)",
    summaryMulti: "Case Summary (Multilingual)",
    titleZh: "Chinese Title",
    titleEn: "English Title",
    titleJa: "Japanese Title",
    titleKo: "Korean Title",
    summaryZh: "Chinese Summary",
    summaryEn: "English Summary",
    summaryJa: "Japanese Summary",
    summaryKo: "Korean Summary",
    imageUrl: "Case image URL (auto-filled after upload)",
    imageHint: "Use images up to 5MB; system auto-converts to 16:9 (scaled with transparent padding)",
    upload: "Upload Image",
    uploading: "Uploading image...",
    saveCase: "Save Case",
    updateCase: "Update Case",
    cancel: "Cancel",
    delete: "Delete",
    saved: "Case saved",
    saveFailed: "Save failed",
    uploadFailed: "Upload failed",
  },
  ja: {
    pageTitle: "導入事例管理",
    previewLang: "プレビュー言語：",
    productList: "製品一覧",
    caseCount: "事例数",
    editCases: "事例を編集",
    noProducts: "製品がありません",
    formTitle: "導入事例編集",
    pickProduct: "左側から製品を選択してください",
    addCase: "事例を追加",
    caseList: "現在の事例",
    emptyCases: "事例はまだありません",
    titleMulti: "事例タイトル（多言語）",
    summaryMulti: "事例概要（多言語）",
    titleZh: "中国語タイトル",
    titleEn: "英語タイトル",
    titleJa: "日本語タイトル",
    titleKo: "韓国語タイトル",
    summaryZh: "中国語概要",
    summaryEn: "英語概要",
    summaryJa: "日本語概要",
    summaryKo: "韓国語概要",
    imageUrl: "事例画像URL（アップロード後に自動入力）",
    imageHint: "5MB 以下の画像を推奨。システムが 16:9（等比拡大縮小＋透明余白）に自動変換します",
    upload: "画像をアップロード",
    uploading: "画像アップロード中...",
    saveCase: "事例を保存",
    updateCase: "事例を更新",
    cancel: "キャンセル",
    delete: "削除",
    saved: "事例を保存しました",
    saveFailed: "保存に失敗しました",
    uploadFailed: "アップロードに失敗しました",
  },
  ko: {
    pageTitle: "성공 사례 관리",
    previewLang: "미리보기 언어:",
    productList: "제품 목록",
    caseCount: "사례 수",
    editCases: "사례 편집",
    noProducts: "제품이 없습니다",
    formTitle: "성공 사례 편집",
    pickProduct: "왼쪽에서 제품을 먼저 선택하세요",
    addCase: "사례 추가",
    caseList: "현재 사례",
    emptyCases: "사례가 없습니다",
    titleMulti: "사례 제목(다국어)",
    summaryMulti: "사례 요약(다국어)",
    titleZh: "중국어 제목",
    titleEn: "영문 제목",
    titleJa: "일본어 제목",
    titleKo: "한국어 제목",
    summaryZh: "중국어 요약",
    summaryEn: "영문 요약",
    summaryJa: "일본어 요약",
    summaryKo: "한국어 요약",
    imageUrl: "사례 이미지 URL(업로드 후 자동 입력)",
    imageHint: "5MB 이하 이미지를 권장하며, 시스템이 16:9(비율 유지 + 투명 여백)로 자동 변환합니다",
    upload: "이미지 업로드",
    uploading: "이미지 업로드 중...",
    saveCase: "사례 저장",
    updateCase: "사례 업데이트",
    cancel: "취소",
    delete: "삭제",
    saved: "사례가 저장되었습니다",
    saveFailed: "저장 실패",
    uploadFailed: "업로드 실패",
  },
};

const emptyCase: CaseStudy = {
  title: { zh: "", en: "", ja: "", ko: "" },
  summary: { zh: "", en: "", ja: "", ko: "" },
  image: "",
};

function pickText(localized: LocalizedText | undefined, fallback: string, locale: Locale) {
  return localized?.[locale] ?? localized?.zh ?? fallback;
}

export default function AdminCasesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [previewLocale, setPreviewLocale] = useState<Locale>("zh");
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [caseForm, setCaseForm] = useState<CaseStudy>(emptyCase);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const ui = uiDict[previewLocale];

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  async function loadProducts() {
    const response = await fetch("/api/products", { cache: "no-store" });
    const data = (await response.json()) as Product[];
    setProducts(data);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setCases([]);
      setCaseForm(emptyCase);
      setEditingIndex(null);
      return;
    }
    setCases(selectedProduct.caseStudies ?? []);
    setCaseForm(emptyCase);
    setEditingIndex(null);
  }, [selectedProduct]);

  async function persistCases(nextCases: CaseStudy[]) {
    if (!selectedProductId) {
      return;
    }

    setError("");
    setMessage("");

    const response = await fetch(`/api/cases/${selectedProductId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseStudies: nextCases }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? ui.saveFailed);
      return;
    }

    setCases(nextCases);
    setMessage(ui.saved);
    await loadProducts();
  }

  async function handleUploadImage(file: File) {
    setError("");
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
      setError(data.message ?? ui.uploadFailed);
      return;
    }

    const data = (await response.json()) as { url: string };
    setCaseForm((prev) => ({ ...prev, image: data.url }));
  }

  async function handleSaveCase() {
    if (!selectedProduct) {
      return;
    }

    const normalized: CaseStudy = {
      title: {
        zh: caseForm.title.zh?.trim() ?? "",
        en: caseForm.title.en?.trim() ?? "",
        ja: caseForm.title.ja?.trim() ?? "",
        ko: caseForm.title.ko?.trim() ?? "",
      },
      summary: {
        zh: caseForm.summary.zh?.trim() ?? "",
        en: caseForm.summary.en?.trim() ?? "",
        ja: caseForm.summary.ja?.trim() ?? "",
        ko: caseForm.summary.ko?.trim() ?? "",
      },
      image: caseForm.image.trim(),
    };

    const nextCases = [...cases];
    if (editingIndex === null) {
      nextCases.push(normalized);
    } else {
      nextCases[editingIndex] = normalized;
    }

    await persistCases(nextCases);
    setCaseForm(emptyCase);
    setEditingIndex(null);
  }

  async function handleDeleteCase(index: number) {
    const nextCases = cases.filter((_, currentIndex) => currentIndex !== index);
    await persistCases(nextCases);
    if (editingIndex === index) {
      setCaseForm(emptyCase);
      setEditingIndex(null);
    }
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">{ui.productList}</h2>
          {products.length === 0 ? <p className="text-sm text-muted">{ui.noProducts}</p> : null}

          {products.map((product) => (
            <div key={product.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-primary">{pickText(product.categoryI18n, product.category, previewLocale)}</p>
                  <p className="mt-1 text-base font-semibold text-gray-900">{pickText(product.nameI18n, product.name, previewLocale)}</p>
                  <p className="mt-1 text-xs text-muted">{ui.caseCount}: {product.caseStudies?.length ?? 0}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProductId(product.id)}
                  className="rounded-md border border-border px-3 py-1 text-sm"
                >
                  {ui.editCases}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-light-blue p-4">
          <p className="text-lg font-semibold text-primary">{ui.formTitle}</p>

          {!selectedProduct ? (
            <p className="text-sm text-muted">{ui.pickProduct}</p>
          ) : (
            <>
              <div className="rounded-md border border-border bg-white p-3">
                <p className="text-xs text-muted">{ui.caseList}</p>
                {cases.length === 0 ? <p className="mt-2 text-sm text-muted">{ui.emptyCases}</p> : null}
                <div className="mt-2 space-y-2">
                  {cases.map((item, index) => (
                    <div key={`${selectedProduct.id}-${index}`} className="rounded-md border border-border p-2">
                      <p className="text-sm font-semibold text-gray-900">{pickText(item.title, "", previewLocale) || `${ui.addCase} ${index + 1}`}</p>
                      <p className="mt-1 text-xs text-muted">{pickText(item.summary, "", previewLocale)}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndex(index);
                            setCaseForm(item);
                          }}
                          className="rounded-md border border-border px-2 py-1 text-xs"
                        >
                          {ui.editCases}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCase(index)}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs text-white"
                        >
                          {ui.delete}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-700">{ui.titleMulti}</p>
              <input value={caseForm.title.zh ?? ""} onChange={(event) => setCaseForm((prev) => ({ ...prev, title: { ...prev.title, zh: event.target.value } }))} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder={ui.titleZh} />
              <input value={caseForm.title.en ?? ""} onChange={(event) => setCaseForm((prev) => ({ ...prev, title: { ...prev.title, en: event.target.value } }))} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder={ui.titleEn} />
              <input value={caseForm.title.ja ?? ""} onChange={(event) => setCaseForm((prev) => ({ ...prev, title: { ...prev.title, ja: event.target.value } }))} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder={ui.titleJa} />
              <input value={caseForm.title.ko ?? ""} onChange={(event) => setCaseForm((prev) => ({ ...prev, title: { ...prev.title, ko: event.target.value } }))} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder={ui.titleKo} />

              <p className="text-sm font-semibold text-gray-700">{ui.summaryMulti}</p>
              <input value={caseForm.summary.zh ?? ""} onChange={(event) => setCaseForm((prev) => ({ ...prev, summary: { ...prev.summary, zh: event.target.value } }))} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder={ui.summaryZh} />
              <input value={caseForm.summary.en ?? ""} onChange={(event) => setCaseForm((prev) => ({ ...prev, summary: { ...prev.summary, en: event.target.value } }))} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder={ui.summaryEn} />
              <input value={caseForm.summary.ja ?? ""} onChange={(event) => setCaseForm((prev) => ({ ...prev, summary: { ...prev.summary, ja: event.target.value } }))} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder={ui.summaryJa} />
              <input value={caseForm.summary.ko ?? ""} onChange={(event) => setCaseForm((prev) => ({ ...prev, summary: { ...prev.summary, ko: event.target.value } }))} className="w-full rounded-md border border-border px-3 py-2 text-sm" placeholder={ui.summaryKo} />

              <input
                value={caseForm.image}
                onChange={(event) => setCaseForm((prev) => ({ ...prev, image: event.target.value }))}
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
              <p className="text-xs text-muted">{ui.imageHint}</p>
              {isUploading ? <p className="text-xs text-primary">{ui.uploading}</p> : null}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleSaveCase()}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  {editingIndex === null ? ui.saveCase : ui.updateCase}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setCaseForm(emptyCase);
                  }}
                  className="rounded-md border border-border bg-white px-4 py-2 text-sm"
                >
                  {ui.cancel}
                </button>
              </div>
            </>
          )}

          {message ? <p className="text-xs text-primary">{message}</p> : null}
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
