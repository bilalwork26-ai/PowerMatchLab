import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "positive" | "warn" | "navy";

const tones: Record<Tone, string> = {
  neutral: "bg-navy-100 text-navy-700",
  brand: "bg-brand-50 text-brand-700 border border-brand-100",
  positive: "bg-positive-50 text-positive-700 border border-positive-100",
  warn: "bg-warn-50 text-warn-DEFAULT border border-warn-100",
  navy: "bg-navy-900 text-white",
};

/** Dark-surface equivalents — a navy chip with a cyan-tinted border instead
 *  of a near-white pill, for badges placed on a dark card (e.g. ProductCard
 *  tone="dark"). */
const darkTones: Record<Tone, string> = {
  neutral: "bg-navy-800 text-navy-100 border border-navy-600",
  brand: "bg-navy-800 text-cyan-300 border border-cyan-400/40",
  positive: "bg-navy-800 text-positive-500 border border-positive-500/40",
  warn: "bg-navy-800 text-amber-300 border border-amber-400/40",
  navy: "bg-navy-950 text-white border border-navy-700",
};

export function Badge({
  children,
  tone = "neutral",
  dark = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  /** Render the dark-surface variant — a navy chip instead of a near-white pill. */
  dark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        dark ? darkTones[tone] : tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function NotVerifiedBadge() {
  return (
    <Badge tone="warn" className="font-normal">
      Not verified
    </Badge>
  );
}
