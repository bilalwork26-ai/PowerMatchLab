import type { Product } from "@/types/product";

/**
 * Canonical mapping from product to a rough size class, used only to pick a
 * sensible alt-text description and to keep the ten renders in
 * public/illustrations/ visually differentiated.
 *
 * Derived from each product's own verified `capacity_wh` (see
 * products.json) — not an invented specification, purely a display
 * grouping. V1's ten products are listed explicitly rather than computed
 * from a threshold so the mapping stays stable if capacities are corrected
 * later.
 */
export type IllustrationSizeClass = "compact" | "mid-size" | "large" | "whole-home backup";

const SIZE_CLASS_BY_ID: Record<string, IllustrationSizeClass> = {
  "bluetti-elite-30-v2": "compact",
  "jackery-explorer-1000-v2": "mid-size",
  "ecoflow-delta-3-classic": "mid-size",
  "anker-solix-c1000-gen-2": "mid-size",
  "bluetti-ac180": "mid-size",
  "anker-solix-s2000": "large",
  "jackery-explorer-2000-v2": "large",
  "anker-solix-c2000-gen-2": "large",
  "ecoflow-delta-pro-3": "whole-home backup",
  "anker-solix-f3800": "whole-home backup",

  // V2 catalog expansion (25 products added after the V1 launch).
  "ecoflow-river-3-plus": "compact",
  "jackery-explorer-300-plus": "compact",
  "bluetti-eb3a": "compact",
  "dji-power-500": "compact",
  "anker-solix-c300": "compact",
  "ecoflow-river-2-pro": "mid-size",
  "jackery-explorer-1000-plus": "mid-size",
  "goal-zero-yeti-700": "mid-size",
  "allpowers-r1500-lite": "mid-size",
  "segway-cube-1000": "mid-size",
  "growatt-infinity-1300": "mid-size",
  "vtoman-flashspeed-1000": "mid-size",
  "ecoflow-delta-2-max": "large",
  "jackery-explorer-2000-plus": "large",
  "bluetti-ac200l": "large",
  "anker-solix-f2000": "large",
  "pecron-e2400lfp": "large",
  "growatt-infinity-1500": "large",
  "vtoman-flashspeed-1500": "large",
  "pecron-e3600lfp": "whole-home backup",
  "oukitel-p5000": "whole-home backup",
  "mango-power-e": "whole-home backup",
  "bluetti-elite-300": "whole-home backup",
  "anker-solix-f3000": "whole-home backup",
  "zendure-superbase-v4600": "whole-home backup",
};

/**
 * Canonical local path for a product's image. Every catalog product id maps
 * to exactly one original render in public/illustrations/ — this is the
 * single source of truth for the path, so no component hardcodes it.
 */
export function getIllustrationPath(product: Product): string {
  return `/illustrations/${product.id}.png`;
}

export function getIllustrationSizeClass(product: Product): IllustrationSizeClass {
  return SIZE_CLASS_BY_ID[product.id] ?? "mid-size";
}

/**
 * Honest alt text: identifies the product but never claims the render is an
 * exact photograph of it.
 */
export function getIllustrationAlt(product: Product): string {
  const sizeClass = getIllustrationSizeClass(product);
  return `Original illustrative render representing a ${sizeClass} portable power station — not an exact photograph of the ${product.brand} ${product.model}.`;
}

export const ILLUSTRATIVE_CAPTION_SHORT = "Illustrative image — not an exact product photograph.";

export const ILLUSTRATIVE_CAPTION_LONG =
  "This original PowerMatchLab illustration represents the product category and is not an exact photograph of the model.";
