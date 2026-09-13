import type { Product } from "@/types/product";

/**
 * Objective data-sufficiency gate for the homepage's small "featured / top
 * picks" spotlight — NOT a catalog visibility filter. A product missing one
 * of its three most basic specs (capacity, continuous output, weight) can
 * still rank highly on PowerMatch Score (which only averages the dimensions
 * it CAN score), so without this gate an incompletely-specified unit could
 * be presented as one of the site's top recommendations. This never removes
 * a product from the general catalog, search, or its own product page — it
 * only decides whether it is eligible for the homepage's limited spotlight.
 */
export function hasEssentialSpecsForFeaturing(product: Product): boolean {
  return (
    product.capacity_wh != null && product.rated_output_w != null && product.weight_kg != null
  );
}
