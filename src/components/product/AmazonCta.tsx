import Link from "next/link";
import type { Product } from "@/types/product";
import { resolveAmazonLink } from "@/lib/amazon";
import { cn } from "@/lib/cn";

/**
 * "Check Price on Amazon" CTA.
 *
 * - Uses `amazon_affiliate_url` when it exists (an Amazon Associates link).
 * - Otherwise falls back to the verified direct `amazon_product_url`.
 * - If neither exists, shows a disabled state — never a fabricated link.
 */
export function AmazonCta({
  product,
  size = "md",
  withDisclosure = true,
  className,
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
  withDisclosure?: boolean;
  className?: string;
}) {
  const { href, isAffiliate } = resolveAmazonLink(product);

  const sizeCls =
    size === "lg"
      ? "h-12 px-6 text-base"
      : size === "sm"
        ? "h-9 px-3 text-sm"
        : "h-11 px-5 text-sm";

  return (
    <div className={cn("w-full", className)}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amazon-hover bg-amazon font-semibold text-amazon-text transition-colors hover:bg-amazon-hover",
            sizeCls,
          )}
        >
          Check Price on Amazon
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path
              d="M7 17 17 7M9 7h8v8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      ) : (
        <span
          className={cn(
            "inline-flex w-full items-center justify-center rounded-lg border border-navy-200 bg-navy-50 font-medium text-navy-400",
            sizeCls,
          )}
        >
          Amazon link not verified
        </span>
      )}

      <p className="mt-1.5 text-[11px] leading-4 text-navy-500">
        Price, availability and current rating are shown on Amazon — PowerMatchLab
        does not display them because we have not independently verified them.
        {isAffiliate
          ? " As an Amazon Associate we may earn from qualifying purchases."
          : " This is a normal Amazon product link; affiliate tracking will be added later."}
        {withDisclosure ? (
          <>
            {" "}
            <Link href="/affiliate-disclosure" className="underline">
              Disclosure
            </Link>
            .
          </>
        ) : null}
      </p>
    </div>
  );
}
