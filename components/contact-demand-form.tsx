"use client";

import { FormEvent, useState } from "react";

type Props = {
  locale: "zh" | "en" | "ja" | "ko";
  placeholders: {
    name: string;
    phone: string;
    requirement: string;
    submit: string;
  };
  messages: {
    success: string;
    pending: string;
    error: string;
    required: string;
  };
};

export default function ContactDemandForm({ locale, placeholders, messages }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requirement, setRequirement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim() || !phone.trim() || !requirement.trim()) {
      setErrorMessage(messages.required);
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        requirement: requirement.trim(),
        locale,
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setErrorMessage(data.message ?? messages.error);
      return;
    }

    setName("");
    setPhone("");
    setRequirement("");
    setSuccessMessage(`${messages.success} ${messages.pending}`);
  }

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="w-full rounded-xl border border-emerald-100 bg-[#fdfefc] px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        placeholder={placeholders.name}
      />
      <input
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        className="w-full rounded-xl border border-emerald-100 bg-[#fdfefc] px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        placeholder={placeholders.phone}
      />
      <textarea
        value={requirement}
        onChange={(event) => setRequirement(event.target.value)}
        className="h-32 w-full rounded-xl border border-emerald-100 bg-[#fdfefc] px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        placeholder={placeholders.requirement}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-700 to-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-700/30 disabled:opacity-60"
      >
        {isSubmitting ? `${placeholders.submit}...` : placeholders.submit}
      </button>
      {successMessage ? <p className="text-sm text-green-700">{successMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </form>
  );
}
