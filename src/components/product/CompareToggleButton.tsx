"use client";

import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/cn";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";

export function CompareToggleButton({
  productId,
  className,
  size = "md",
  tone = "light",
}: {
  productId: string;
  className?: string;
  size?: "sm" | "md";
  tone?: "light" | "dark";
}) {
  const { has, toggle, isFull, ready } = useCompare();
  const selected = ready && has(productId);
  const disabled = ready && !selected && isFull;
  const dark = tone === "dark";

  const sizeCls = size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm";

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-lg border font-medium transition-colors",
        dark
          ? selected
            ? "border-cyan-400 bg-cyan-400/10 text-cyan-200 shadow-glow-soft"
            : "border-cyan-400/30 bg-navy-800 text-navy-100 hover:border-cyan-300 hover:bg-navy-700 hover:shadow-glow-soft focus-visible:border-cyan-300 focus-visible:shadow-glow-soft"
          : selected
            ? "border-brand-600 bg-brand-50 text-brand-700"
            : "border-navy-200 bg-white text-navy-800 hover:bg-navy-50",
        disabled && "cursor-not-allowed opacity-60",
        sizeCls,
        className,
      )}
      title={
        disabled
          ? "Compare list is full (4 products). Remove one to add another."
          : undefined
      }
    >
      {selected ? <CheckIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
      {selected ? "Added to Compare" : "Add to Compare"}
    </button>
  );
}
