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
      <aside className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 z-40 hidden rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3 text-xs text-slate-700 shadow-xl shadow-slate-300/40 backdrop-blur md:block">
        <p className="font-semibold text-slate-900">{businessLabel}</p>
        <p className="mt-1 whitespace-nowrap">Tel: {phone}</p>
        <p className="whitespace-nowrap">Email: {email}</p>
      </aside>
      <a
        href={telHref}
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 z-40 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg shadow-slate-300/30 backdrop-blur md:hidden"
      >
        Tel
      </a>
      <Link
        href="/contact"
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-40 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-sky-500/35 transition hover:scale-[1.03] hover:shadow-cyan-500/35 md:right-4"
      >
        {contactLabel}
      </Link>
    </>
  );
}
