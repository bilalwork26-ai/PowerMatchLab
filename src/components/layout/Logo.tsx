import Link from "next/link";

export function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  const primary = variant === "light" ? "text-white" : "text-navy-900";
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2"
      aria-label="PowerMatchLab home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <path
            d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`text-[15px] font-bold ${primary}`}>
          Power<span className="text-brand-400">Match</span>Lab
        </span>
        <span
          className={`text-[10px] font-medium uppercase tracking-wide ${
            variant === "light" ? "text-navy-300" : "text-navy-500"
          }`}
        >
          Compare · Calculate · Choose smarter
        </span>
      </span>
    </Link>
  );
}
