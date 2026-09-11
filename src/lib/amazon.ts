import type { Product } from "@/types/product";

/**
 * Resolves the destination for the "Check Price on Amazon" CTA.
 *
 * Definitive rule: `amazon_affiliate_url` is the ONLY field a purchase CTA
 * may ever use. `amazon_product_url` (and `amazon_asin`) exist purely for
 * research/product-matching purposes — confirming which real Amazon listing
 * a catalog entry corresponds to — and must never be rendered as a
 * clickable "Check Price on Amazon" destination, no matter how confident
 * that match is. `amazon_verification_status: "confirmed"` means the
 * product's identity/specs are verified; it does NOT mean the CTA may
 * link anywhere — only a real Associates link does that. If
 * `amazon_affiliate_url` is null, there is no purchase link, full stop,
 * for all 40 catalog products alike.
 *
 * tests/amazon-cta-affiliate-only.test.ts enforces this: it fails if any
 * consumer ever surfaces amazon_product_url as a clickable CTA href.
 */
export interface AmazonLink {
  href: string | null;
  /** Always true when href is non-null — kept for call-site clarity/back-compat; a non-affiliate href no longer exists. */
  isAffiliate: boolean;
}

export function resolveAmazonLink(product: Product): AmazonLink {
  if (product.amazon_affiliate_url) {
    return { href: product.amazon_affiliate_url, isAffiliate: true };
  }
  return { href: null, isAffiliate: false };
}

export function hasAmazonDestination(product: Product): boolean {
  return resolveAmazonLink(product).href !== null;
}
