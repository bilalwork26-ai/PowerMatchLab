import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "warn" | "neutral";

const tones: Record<Tone, string> = {
  info: "border-brand-200 bg-brand-50 text-brand-900 border-l-4 border-l-brand-500",
  warn: "border-warn-100 bg-warn-50 text-navy-800 border-l-4 border-l-warn-DEFAULT",
  neutral: "border-navy-200 bg-white text-navy-700 border-l-4 border-l-navy-300",
};

/** Dark-surface equivalents — a navy panel with a coloured accent border
 *  instead of a near-white/pastel one, for callouts placed on a dark page. */
const darkTones: Record<Tone, string> = {
  info: "border-cyan-400/25 bg-navy-900/70 text-navy-100 border-l-4 border-l-cyan-400",
  warn: "border-amber-400/25 bg-navy-900/70 text-navy-100 border-l-4 border-l-amber-400",
  neutral: "border-navy-700 bg-navy-900/70 text-navy-100 border-l-4 border-l-navy-500",
};

export function Callout({
  title,
  tone = "info",
  dark = false,
  children,
  className,
}: {
  title?: string;
  tone?: Tone;
  /** Render the dark-surface variant for a callout on a dark page. */
  dark?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 text-sm leading-6",
        dark ? darkTones[tone] : tones[tone],
        className,
      )}
    >
      {title ? (
        <p className={cn("mb-1 font-semibold", dark && "text-white")}>{title}</p>
      ) : null}
      <div>{children}</div>
    </div>
  );
}
