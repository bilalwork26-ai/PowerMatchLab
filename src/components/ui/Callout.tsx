import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "warn" | "neutral";

const tones: Record<Tone, string> = {
  info: "border-brand-200 bg-brand-50 text-brand-900",
  warn: "border-warn-100 bg-warn-50 text-navy-800",
  neutral: "border-navy-200 bg-white text-navy-700",
};

export function Callout({
  title,
  tone = "info",
  children,
  className,
}: {
  title?: string;
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border p-4 text-sm leading-6", tones[tone], className)}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}
