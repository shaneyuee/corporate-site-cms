import { getLocalizedSiteContent, readSiteData } from "@/lib/data";
import { getRequestPreferredLocale } from "@/lib/i18n";
import { siteDict } from "@/lib/site-dictionary";

export default async function AboutPage() {
  const locale = await getRequestPreferredLocale();
  const dict = siteDict[locale];
  const data = await readSiteData();
  const localizedSite = getLocalizedSiteContent(data, locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{dict.aboutTitle}</h1>
      <p className="mt-4 max-w-4xl text-sm leading-7 text-gray-700 md:text-base">{localizedSite.company.intro}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-muted">{dict.companyNameLabel}</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">{localizedSite.company.name}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-muted">{dict.aboutVision}</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">{localizedSite.company.slogan}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-muted">{dict.serviceIdea}</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">{dict.serviceIdeaValue}</p>
        </div>
      </div>
    </div>
  );
}
