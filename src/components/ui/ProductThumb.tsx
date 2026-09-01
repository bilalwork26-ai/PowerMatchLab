import { cn } from "@/lib/cn";

/**
 * Inline-SVG placeholder for product imagery.
 *
 * V1 ships no verified product photos. Rather than hotlink manufacturer or
 * Amazon images (licensing + integrity concerns), we render a neutral,
 * brand-labelled placeholder. Real assets can drop in later behind this API.
 */
export function ProductThumb({
  brand,
  model,
  size = 96,
  className,
}: {
  brand: string;
  model: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-navy-100 bg-navy-50",
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${brand} ${model} (image not available)`}
    >
      <svg
        viewBox="0 0 48 48"
        width={size * 0.5}
        height={size * 0.5}
        aria-hidden="true"
        fill="none"
      >
        <rect
          x="7"
          y="12"
          width="34"
          height="24"
          rx="3"
          stroke="#8aa5cb"
          strokeWidth="2"
        />
        <path d="M14 12v-3h20v3" stroke="#8aa5cb" strokeWidth="2" />
        <circle cx="18" cy="24" r="4" stroke="#8aa5cb" strokeWidth="2" />
        <path
          d="M28 20h7M28 24h7M28 28h7"
          stroke="#8aa5cb"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
