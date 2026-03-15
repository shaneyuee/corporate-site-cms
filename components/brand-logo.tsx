import Link from "next/link";

type BrandLogoProps = {
  companyName: string;
  slogan?: string;
  compact?: boolean;
  subdued?: boolean;
};

export default function BrandLogo({ companyName, slogan, compact = false, subdued = false }: BrandLogoProps) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label={companyName}>
      <span
        className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white ring-1 transition ${
          subdued
            ? "bg-gradient-to-br from-white/28 via-sky-300/28 to-cyan-200/22 shadow-md shadow-slate-900/10 ring-white/20"
            : "bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 shadow-lg shadow-sky-500/25 ring-white/40"
        }`}
      >
        <span className="text-lg font-black tracking-tight">HC</span>
        <span
          className={`absolute inset-0 ${
            subdued
              ? "bg-[radial-gradient(circle_at_22%_24%,rgba(255,255,255,0.3),transparent_48%)]"
              : "bg-[radial-gradient(circle_at_22%_24%,rgba(255,255,255,0.58),transparent_45%)]"
          }`}
        />
      </span>
      <span className="min-w-0">
        <span
          className={`block truncate text-base leading-tight transition-colors ${
            subdued
              ? "font-semibold text-white/78 group-hover:text-white/92"
              : "font-bold text-slate-900 group-hover:text-sky-700"
          }`}
        >
          {companyName}
        </span>
        {!compact && slogan ? (
          <span className={`block truncate text-xs ${subdued ? "text-white/58" : "text-slate-600"}`}>{slogan}</span>
        ) : null}
      </span>
    </Link>
  );
}
