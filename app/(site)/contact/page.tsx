import { getLocalizedSiteContent, readSiteData } from "@/lib/data";
import { getRequestPreferredLocale } from "@/lib/i18n";
import { siteDict } from "@/lib/site-dictionary";
import ContactDemandForm from "@/components/contact-demand-form";

export default async function ContactPage() {
  const locale = await getRequestPreferredLocale();
  const dict = siteDict[locale];
  const data = await readSiteData();
  const localizedSite = getLocalizedSiteContent(data, locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-lime-50 to-green-100 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-slate-900">{dict.contactTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">{dict.contactSubTitle}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={`tel:${localizedSite.company.phone.replace(/\s+/g, "")}`} className="rounded-full border border-emerald-200 bg-[#fcfefb] px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
            {dict.phoneLabel} · {localizedSite.company.phone}
          </a>
          <a href={`mailto:${localizedSite.company.email}`} className="rounded-full border border-lime-200 bg-[#fcfefb] px-4 py-2 text-sm font-semibold text-green-800 shadow-sm">
            {dict.emailLabel} · {localizedSite.company.email}
          </a>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-emerald-100 bg-[#fcfefb] p-6 shadow-sm shadow-emerald-900/5 md:p-7">
          <h2 className="text-lg font-semibold text-slate-900">{dict.contactInfo}</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">{dict.companyLabel}：{localizedSite.company.name}</p>
            <p className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">{dict.phoneLabel}：{localizedSite.company.phone}</p>
            <p className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">{dict.emailLabel}：{localizedSite.company.email}</p>
            <p className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">{dict.addressLabel}：{localizedSite.company.address}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-[#fcfefb] p-6 shadow-sm shadow-emerald-900/5 md:p-7">
          <h2 className="text-lg font-semibold text-slate-900">{dict.demandSubmit}</h2>
          <ContactDemandForm
            locale={locale}
            placeholders={{
              name: dict.yourNamePlaceholder,
              phone: dict.contactPhonePlaceholder,
              requirement: dict.requirementPlaceholder,
              submit: dict.submitConsultation,
            }}
            messages={{
              success: locale === "zh" ? "提交成功！" : locale === "en" ? "Submitted successfully!" : locale === "ja" ? "送信に成功しました！" : "제출이 완료되었습니다!",
              pending: locale === "zh" ? "请耐心等待，客服人员会尽快联系您。" : locale === "en" ? "Please wait patiently, our support team will contact you soon." : locale === "ja" ? "担当スタッフよりできるだけ早くご連絡いたします。しばらくお待ちください。" : "고객센터 담당자가 최대한 빨리 연락드릴 예정입니다. 잠시만 기다려 주세요.",
              error: locale === "zh" ? "提交失败，请稍后重试。" : locale === "en" ? "Submission failed, please try again later." : locale === "ja" ? "送信に失敗しました。しばらくしてから再度お試しください。" : "제출에 실패했습니다. 잠시 후 다시 시도해 주세요.",
              required: locale === "zh" ? "请完整填写姓名、电话和需求内容。" : locale === "en" ? "Please fill in your name, phone number, and requirement." : locale === "ja" ? "お名前・電話番号・ご要件をすべて入力してください。" : "이름, 연락처, 요구사항을 모두 입력해 주세요.",
            }}
          />
          <p className="mt-3 text-xs text-slate-500">{localizedSite.contactFormHint}</p>
        </section>
      </div>
    </div>
  );
}
