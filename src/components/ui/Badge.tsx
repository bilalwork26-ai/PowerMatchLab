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

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
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
