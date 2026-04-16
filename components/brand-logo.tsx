import Link from "next/link";

type BrandLogoProps = {
  companyName: string;
  slogan?: string;
  compact?: boolean;
  subdued?: boolean;
};

export default function BrandLogo({ companyName, slogan, compact = false, subdued = false }: BrandLogoProps) {
  const logoText = (() => {
    const trimmed = companyName.trim();
    if (/^[\u4e00-\u9fff]/.test(trimmed)) {
      return trimmed.slice(0, 2);
    }

    const initials = trimmed
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

    return initials || "JW";
  })();

  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label={companyName}>
      <span
        className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white ring-1 transition ${
          subdued
            ? "bg-gradient-to-br from-white/24 via-emerald-300/24 to-lime-200/18 shadow-md shadow-slate-900/10 ring-white/20"
            : "bg-gradient-to-br from-emerald-600 via-green-500 to-lime-500 shadow-lg shadow-emerald-700/25 ring-white/40"
        }`}
      >
        <span className="text-lg font-black tracking-tight">{logoText}</span>
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
              : "font-bold text-slate-900 group-hover:text-emerald-800"
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
