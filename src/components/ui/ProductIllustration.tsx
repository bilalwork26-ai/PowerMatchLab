import Image from "next/image";
import type { Product } from "@/types/product";
import { cn } from "@/lib/cn";
import {
  getIllustrationAlt,
  getIllustrationPath,
  ILLUSTRATIVE_CAPTION_SHORT,
} from "@/lib/illustrations";

/**
 * Original PowerMatchLab illustration for a product.
 *
 * V1 ships no licensed product photography (see /affiliate-disclosure and
 * the illustration's own alt text): every catalog product instead gets one
 * hand-authored, brand-neutral SVG in public/illustrations/, sized by
 * category (compact / mid-size / large / whole-home backup) using the
 * product's own verified capacity — never an attempt at the real industrial
 * design, and never presented as a photograph.
 */
export function ProductIllustration({
  product,
  size = 96,
  className,
  showCaption = true,
}: {
  product: Product;
  size?: number;
  className?: string;
  showCaption?: boolean;
}) {
  const path = getIllustrationPath(product);
  const alt = getIllustrationAlt(product);
  const captionWidth = Math.max(size, 96);

  return (
    <div className={cn("flex shrink-0 flex-col items-center gap-1", className)}>
      <div
        className="relative overflow-hidden rounded-lg border border-navy-100 bg-navy-50"
        style={{ width: size, height: size }}
      >
        <Image
          src={path}
          alt={alt}
          fill
          sizes={`${size}px`}
          unoptimized
          className="object-contain p-2"
        />
      </div>
      {showCaption ? (
        <p
          className="text-center text-[9px] leading-tight text-navy-400"
          style={{ width: captionWidth }}
        >
          {ILLUSTRATIVE_CAPTION_SHORT}
        </p>
      ) : null}
    </div>
  );
}
