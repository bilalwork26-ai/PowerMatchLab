import { cn } from "@/lib/cn";

/** Horizontal 0-100 bar used in score breakdowns and comparison rows. */
export function ScoreBar({
  value,
  label,
  sublabel,
  className,
  tone = "light",
}: {
  value: number | null;
  label?: string;
  sublabel?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const pct = value == null ? 0 : Math.min(100, Math.max(0, value));
  const color =
    value == null
      ? "#cbd5e1"
      : pct >= 70
        ? "#16a34a"
        : pct >= 55
          ? "#1c6dd0"
          : pct >= 40
            ? "#d97706"
            : "#64748b";
  const dark = tone === "dark";
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
          <span className={dark ? "text-navy-300" : "text-navy-700"}>{label}</span>
          <span
            className={cn(
              "tabular-nums font-medium",
              dark ? "text-white" : "text-navy-800",
            )}
          >
            {value == null ? "Not scored" : `${Math.round(value)}/100`}
          </span>
        </div>
      ) : null}
      <div
        className={cn(
          "h-2 w-full overflow-hidden rounded-full",
          dark ? "bg-navy-700" : "bg-navy-100",
        )}
        role="img"
        aria-label={
          label
            ? `${label}: ${value == null ? "not scored" : `${Math.round(value)} out of 100`}`
            : undefined
        }
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {sublabel ? (
        <p className={cn("mt-1 text-xs", dark ? "text-navy-400" : "text-navy-500")}>
          {sublabel}
        </p>
      ) : null}
    </div>
  );
}
