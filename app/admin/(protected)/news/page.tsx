"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Locale = "zh" | "en" | "ja" | "ko";
type LocalizedText = Partial<Record<Locale, string>>;

type NewsItem = {
  id: number;
  title: string;
  titleI18n: LocalizedText;
  date: string;
  summary: string;
  summaryI18n: LocalizedText;
  content: string;
  contentI18n: LocalizedText;
};

const emptyForm = {
  titleZh: "",
  titleEn: "",
  titleJa: "",
  titleKo: "",
  date: "",
  summaryZh: "",
  summaryEn: "",
  summaryJa: "",
  summaryKo: "",
  contentZh: "",
  contentEn: "",
  contentJa: "",
  contentKo: "",
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [previewLocale, setPreviewLocale] = useState<Locale>("zh");
  const [form, setForm] = useState(emptyForm);

  function getLocalizedValue(localized: LocalizedText, fallback: string, locale: Locale): string {
    return localized?.[locale] ?? localized?.zh ?? fallback;
  }

  async function loadNews() {
    const response = await fetch("/api/news", { cache: "no-store" });
    const data = (await response.json()) as NewsItem[];
    setNews(data);
  }

  useEffect(() => {
    loadNews();
  }, []);

  const selectedNews = useMemo(() => news.find((item) => item.id === selectedId) ?? null, [news, selectedId]);

  useEffect(() => {
    if (!selectedNews) {
      setForm(emptyForm);
      return;
    }
    setForm({
      titleZh: selectedNews.titleI18n?.zh ?? selectedNews.title,
      titleEn: selectedNews.titleI18n?.en ?? "",
      titleJa: selectedNews.titleI18n?.ja ?? "",
      titleKo: selectedNews.titleI18n?.ko ?? "",
      date: selectedNews.date,
      summaryZh: selectedNews.summaryI18n?.zh ?? selectedNews.summary,
      summaryEn: selectedNews.summaryI18n?.en ?? "",
      summaryJa: selectedNews.summaryI18n?.ja ?? "",
      summaryKo: selectedNews.summaryI18n?.ko ?? "",
      contentZh: selectedNews.contentI18n?.zh ?? selectedNews.content,
      contentEn: selectedNews.contentI18n?.en ?? "",
      contentJa: selectedNews.contentI18n?.ja ?? "",
      contentKo: selectedNews.contentI18n?.ko ?? "",
    });
  }, [selectedNews]);

  function buildPayload() {
    return {
      title: form.titleZh.trim(),
      titleI18n: {
        zh: form.titleZh.trim(),
        en: form.titleEn.trim(),
        ja: form.titleJa.trim(),
        ko: form.titleKo.trim(),
      },
      date: form.date,
      summary: form.summaryZh.trim(),
      summaryI18n: {
        zh: form.summaryZh.trim(),
        en: form.summaryEn.trim(),
        ja: form.summaryJa.trim(),
        ko: form.summaryKo.trim(),
      },
      content: form.contentZh.trim(),
      contentI18n: {
        zh: form.contentZh.trim(),
        en: form.contentEn.trim(),
        ja: form.contentJa.trim(),
        ko: form.contentKo.trim(),
      },
    };
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const payload = buildPayload();
    await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setForm(emptyForm);
    setSelectedId(null);
    await loadNews();
  }

  async function handleUpdate(event: FormEvent) {
    event.preventDefault();
    if (!selectedId) return;
    const payload = buildPayload();
    await fetch(`/api/news/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await loadNews();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (selectedId === id) {
      setSelectedId(null);
      setForm(emptyForm);
    }
    await loadNews();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">新闻管理</h1>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">预览语言：</span>
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
          {news.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-primary">{item.date}</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{getLocalizedValue(item.titleI18n, item.title, previewLocale)}</p>
                  <p className="mt-1 text-sm text-muted">{getLocalizedValue(item.summaryI18n, item.summary, previewLocale)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className="rounded-md border border-border px-3 py-1 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-md bg-red-600 px-3 py-1 text-sm text-white"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={selectedId ? handleUpdate : handleCreate} className="space-y-3 rounded-xl border border-border bg-light-blue p-4">
          <p className="text-lg font-semibold text-primary">{selectedId ? "编辑新闻" : "新增新闻"}</p>
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />

          <p className="text-sm font-semibold text-gray-700">新闻标题（多语言）</p>
          <input
            value={form.titleZh}
            onChange={(event) => setForm((prev) => ({ ...prev, titleZh: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="中文标题"
          />
          <input
            value={form.titleEn}
            onChange={(event) => setForm((prev) => ({ ...prev, titleEn: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="English Title"
          />
          <input
            value={form.titleJa}
            onChange={(event) => setForm((prev) => ({ ...prev, titleJa: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="日本語タイトル"
          />
          <input
            value={form.titleKo}
            onChange={(event) => setForm((prev) => ({ ...prev, titleKo: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="한국어 제목"
          />

          <p className="text-sm font-semibold text-gray-700">新闻摘要（多语言）</p>
          <input
            value={form.summaryZh}
            onChange={(event) => setForm((prev) => ({ ...prev, summaryZh: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="中文摘要"
          />
          <input
            value={form.summaryEn}
            onChange={(event) => setForm((prev) => ({ ...prev, summaryEn: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="English Summary"
          />
          <input
            value={form.summaryJa}
            onChange={(event) => setForm((prev) => ({ ...prev, summaryJa: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="日本語要約"
          />
          <input
            value={form.summaryKo}
            onChange={(event) => setForm((prev) => ({ ...prev, summaryKo: event.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="한국어 요약"
          />

          <p className="text-sm font-semibold text-gray-700">新闻正文（多语言）</p>
          <textarea
            value={form.contentZh}
            onChange={(event) => setForm((prev) => ({ ...prev, contentZh: event.target.value }))}
            className="h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="中文正文"
          />
          <textarea
            value={form.contentEn}
            onChange={(event) => setForm((prev) => ({ ...prev, contentEn: event.target.value }))}
            className="h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="English Content"
          />
          <textarea
            value={form.contentJa}
            onChange={(event) => setForm((prev) => ({ ...prev, contentJa: event.target.value }))}
            className="h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="日本語本文"
          />
          <textarea
            value={form.contentKo}
            onChange={(event) => setForm((prev) => ({ ...prev, contentKo: event.target.value }))}
            className="h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="한국어 본문"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
              {selectedId ? "保存修改" : "新增新闻"}
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
                取消
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
