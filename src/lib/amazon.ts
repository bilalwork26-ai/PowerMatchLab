import type { Product } from "@/types/product";

/**
 * Resolves the destination for the "Check Price on Amazon" CTA.
 *
 * Rule (from the Master Build Prompt):
 *  - `amazon_affiliate_url` is the Amazon Associates link for that product,
 *    when one has been generated for it.
 *  - Until/unless it exists for a given product, fall back to the verified
 *    direct `amazon_product_url`.
 *  - Never fabricate a tracking ID or affiliate URL.
 *
 * A product whose `amazon_verification_status` isn't "confirmed" never gets
 * a link here at all, even if `amazon_product_url`/`amazon_asin` are
 * populated — those fields can hold an unverified research candidate (which
 * may turn out to be a bundle or the wrong listing), and the UI must not
 * present an unverified candidate as a real purchase destination.
 */
export interface AmazonLink {
  href: string | null;
  /** true when we are using the Amazon Associates affiliate URL. */
  isAffiliate: boolean;
}

export function resolveAmazonLink(product: Product): AmazonLink {
  if (product.amazon_verification_status !== "confirmed") {
    return { href: null, isAffiliate: false };
  }
  if (product.amazon_affiliate_url) {
    return { href: product.amazon_affiliate_url, isAffiliate: true };
  }
  if (product.amazon_product_url) {
    return { href: product.amazon_product_url, isAffiliate: false };
  }
  return { href: null, isAffiliate: false };
}

export function hasAmazonDestination(product: Product): boolean {
  return resolveAmazonLink(product).href !== null;
}
