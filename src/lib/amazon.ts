import type { Product } from "@/types/product";

/**
 * Resolves the destination for the "Check Price on Amazon" CTA.
 *
 * Rule (from the Master Build Prompt):
 *  - `amazon_affiliate_url` is the future Amazon Associates link — currently null.
 *  - Until it exists, fall back to the verified direct `amazon_product_url`.
 *  - Never fabricate a tracking ID or affiliate URL.
 */
export interface AmazonLink {
  href: string | null;
  /** true when we are using the (future) affiliate URL. */
  isAffiliate: boolean;
}

export function resolveAmazonLink(product: Product): AmazonLink {
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
