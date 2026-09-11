"use client";

import type { Product } from "@/types/product";
import { productDisplayName } from "@/data/products";
import { resolveAmazonLink } from "@/lib/amazon";
import { trackEvent } from "@/lib/analytics";
import { fmtDate } from "@/lib/format";

/**
 * Discreet persistent "buy" bar shown only on small screens on a single
 * product's own page — the one point in the conversion journey where the
 * visitor has already picked a specific model. Sits directly above the
 * global bottom nav (see `pb-20` reserved for it in the root layout) rather
 * than replacing it, and stays out of the way on desktop where the sticky
 * sidebar CTA already covers this.
 */
export function MobileBuyBar({ product }: { product: Product }) {
  const { href, isAffiliate } = resolveAmazonLink(product);
  const name = productDisplayName(product);

  return (
    <div
      className="fixed inset-x-0 bottom-20 z-30 border-t border-cyan-400/10 bg-navy-900/95 px-3 py-2 shadow-[0_-1px_12px_rgba(0,0,0,0.35)] backdrop-blur md:hidden"
      role="region"
      aria-label={`Buy ${name} on Amazon`}
    >
      <div className="mx-auto flex max-w-content items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">{name}</p>
          <p className="truncate text-[10px] text-navy-400">
            Checked {fmtDate(product.last_verified)}
          </p>
        </div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            onClick={() =>
              trackEvent("affiliate_click", {
                product_id: product.id,
                is_affiliate: isAffiliate,
                placement: "product_page_mobile_bar",
              })
            }
            className="amazon-cta-link inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-amazon-hover bg-amazon px-4 text-sm font-semibold text-amazon-text transition-colors hover:bg-amazon-hover"
          >
            Check Price
          </a>
        ) : (
          <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-navy-700 px-4 text-xs font-medium text-navy-400">
            {product.amazon_verification_status === "confirmed" ? "Link pending" : "Not verified"}
          </span>
        )}
      </div>
    </div>
  );
}
