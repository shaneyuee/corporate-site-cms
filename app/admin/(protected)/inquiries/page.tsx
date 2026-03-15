"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Inquiry = {
  id: number;
  name: string;
  phone: string;
  requirement: string;
  locale: string;
  isRead: boolean;
  createdAt: string;
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadInquiries() {
    setLoading(true);
    const response = await fetch("/api/inquiries", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as Inquiry[];
      setItems(data);
    }
    setLoading(false);
  }

  async function markAsRead(id: number) {
    await fetch(`/api/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    router.refresh();
    await loadInquiries();
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">客户需求</h1>
        <button type="button" onClick={loadInquiries} className="rounded-md border border-border px-3 py-1 text-sm">
          刷新
        </button>
      </div>

      {loading ? <p className="text-sm text-muted">加载中...</p> : null}
      {!loading && items.length === 0 ? <p className="text-sm text-muted">暂无客户需求</p> : null}

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className={`rounded-xl border p-4 ${item.isRead ? "border-border bg-white" : "border-red-200 bg-red-50"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">#{item.id}</p>
                <p className="text-sm text-gray-700">{item.name}</p>
                <p className="text-sm text-gray-700">{item.phone}</p>
                <span className="rounded-full bg-light-blue px-2 py-0.5 text-xs text-primary">{item.locale}</span>
                {!item.isRead ? <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">新需求</span> : null}
              </div>
              <p className="text-xs text-muted">{formatTime(item.createdAt)}</p>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{item.requirement}</p>

            {!item.isRead ? (
              <button
                type="button"
                onClick={() => void markAsRead(item.id)}
                className="mt-3 rounded-md bg-primary px-3 py-1 text-sm font-semibold text-white"
              >
                标记为已读
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
