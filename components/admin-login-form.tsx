"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function readResponseMessage(response: Response, fallback: string): Promise<string> {
  const text = await response.text();
  if (!text) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(text) as { message?: string };
    return parsed.message ?? fallback;
  } catch {
    return fallback;
  }
}

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("adm12312");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadCaptcha() {
    try {
      const response = await fetch("/api/auth/captcha", { cache: "no-store" });
      if (!response.ok) {
        setCaptchaQuestion("");
        return;
      }

      const data = (await response.json()) as { question?: string };
      setCaptchaQuestion(data.question ?? "");
    } catch {
      setCaptchaQuestion("");
    }
  }

  useEffect(() => {
    loadCaptcha();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captchaAnswer }),
      });

      if (!response.ok) {
        const message = await readResponseMessage(response, "登录失败，请稍后重试");
        setErrorMessage(message);
        setCaptchaAnswer("");
        await loadCaptcha();
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setErrorMessage("登录请求失败，请检查网络或服务状态");
      setCaptchaAnswer("");
      await loadCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-xl border border-border bg-[#fcfefb] p-5 shadow-sm shadow-emerald-900/5">
      <input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        placeholder="账号"
      />
      <input
        value={password}
        type="password"
        onChange={(event) => setPassword(event.target.value)}
        className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        placeholder="密码"
      />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={captchaAnswer}
          onChange={(event) => setCaptchaAnswer(event.target.value)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="请输入验证码结果"
        />
        <button
          type="button"
          onClick={loadCaptcha}
          className="rounded-md border border-border bg-emerald-50/70 px-3 py-2 text-sm text-gray-700"
        >
          {captchaQuestion || "加载中..."}
        </button>
      </div>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? "登录中..." : "登录"}
      </button>
    </form>
  );
}
