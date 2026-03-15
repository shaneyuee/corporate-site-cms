"use client";

import { useState } from "react";

type Props = {
  locale: "zh" | "en" | "ja" | "ko";
};

const options = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
] as const;

export default function LanguageSwitcher({ locale }: Props) {
  const [value, setValue] = useState<Props["locale"]>(locale);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(next: Props["locale"]) {
    setValue(next);
    setIsSaving(true);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      window.location.reload();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <select
      value={value}
      disabled={isSaving}
      onChange={(event) => void handleChange(event.target.value as Props["locale"])}
      className="rounded-md border border-border bg-white px-2 py-1 text-sm text-gray-700"
      aria-label="language switcher"
    >
      {options.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
