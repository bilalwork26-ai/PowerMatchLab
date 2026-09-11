import Image from "next/image";
import type { Product } from "@/types/product";
import { cn } from "@/lib/cn";
import {
  getIllustrationAlt,
  getIllustrationCaption,
  getIllustrationPath,
} from "@/lib/illustrations";

/**
 * Original PowerMatchLab render for a product.
 *
 * V1 ships no licensed product photography (see /affiliate-disclosure and
 * the render's own alt text): every catalog product instead gets one
 * original, brand-neutral render in public/illustrations/, generated for
 * this project and sized by category (compact / mid-size / large /
 * whole-home backup) using the product's own verified capacity — never an
 * attempt at the real industrial design, and never presented as an exact
 * photograph.
 */
export function ProductIllustration({
  product,
  size = 96,
  className,
  showCaption = true,
  tone = "light",
  priority = false,
}: {
  product: Product;
  size?: number;
  className?: string;
  showCaption?: boolean;
  tone?: "light" | "dark";
  /**
   * Set only on the one illustration per page that's actually the LCP
   * candidate (e.g. the product detail hero) — it skips lazy-loading and
   * gets a fetch priority hint. Every other render of this component (grid
   * cards, compare tables, recommendation cards) stays lazy by default;
   * marking more than one image per page as priority defeats the point.
   */
  priority?: boolean;
}) {
  const path = getIllustrationPath(product);
  const alt = getIllustrationAlt(product);
  const captionWidth = Math.max(size, 96);
  const dark = tone === "dark";

  return (
    <div className={cn("flex shrink-0 flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border",
          dark ? "border-navy-700 bg-navy-950/40" : "border-navy-100 bg-navy-50",
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={path}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-contain p-2"
          priority={priority}
        />
      </div>
      {showCaption ? (
        <p
          className={cn(
            "text-center text-[9px] leading-tight",
            dark ? "text-navy-300" : "text-navy-400",
          )}
          style={{ width: captionWidth }}
        >
          {getIllustrationCaption(product)}
        </p>
      ) : null}
    </div>
  );
}
