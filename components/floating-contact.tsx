import Link from "next/link";

type FloatingContactProps = {
  phone: string;
  email: string;
  contactLabel: string;
  businessLabel: string;
};

export default function FloatingContact({ phone, email, contactLabel, businessLabel }: FloatingContactProps) {
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;

  return (
    <>
      <aside className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 z-40 hidden rounded-2xl border border-emerald-100/90 bg-emerald-50/92 px-4 py-3 text-xs text-slate-700 shadow-xl shadow-emerald-900/15 backdrop-blur md:block">
        <p className="font-semibold text-slate-900">{businessLabel}</p>
        <p className="mt-1 whitespace-nowrap">Tel: {phone}</p>
        <p className="whitespace-nowrap">Email: {email}</p>
      </aside>
      <a
        href={telHref}
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 z-40 inline-flex items-center justify-center rounded-full border border-emerald-100 bg-emerald-50/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg shadow-emerald-900/15 backdrop-blur md:hidden"
      >
        Tel
      </a>
      <Link
        href="/contact"
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-40 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-700 to-green-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-700/30 transition hover:scale-[1.03] hover:shadow-green-500/30 md:right-4"
      >
        {contactLabel}
      </Link>
    </>
  );
}
