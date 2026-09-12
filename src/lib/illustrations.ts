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

  // V2 catalog expansion (remaining products after cleanup).
  "anker-solix-c300": "compact",
  "ecoflow-river-2-pro": "mid-size",
  "goal-zero-yeti-700": "mid-size",
  "segway-cube-1000": "mid-size",
  "vtoman-flashspeed-1000": "mid-size",
  "ecoflow-delta-2-max": "large",
  "jackery-explorer-2000-plus": "large",
  "bluetti-ac200l": "large",
  "pecron-e2400lfp": "large",
  "pecron-e3600lfp": "whole-home backup",
  "bluetti-elite-300": "whole-home backup",
  "anker-solix-f3000": "whole-home backup",

  // Milestone 4 catalog expansion (2026-09-11).
  "anker-solix-c800x": "mid-size",
  "ecoflow-river-3-plus": "compact",
  "jackery-explorer-300-plus": "compact",
  "bluetti-ac70": "mid-size",

  // 40-product catalog build-out, pending Amazon/SiteStripe verification (2026-09-11).
  "jackery-explorer-500-v2": "compact",
  "dji-power-500": "compact",
  "goal-zero-yeti-1500-6th-gen": "mid-size",
  "ecoflow-delta-3-plus": "mid-size",
  "bluetti-elite-100-v2": "mid-size",
  "dji-power-1000-v2": "mid-size",
  "dji-power-2000": "large",
  "jackery-explorer-3000-v2": "large",
  "growatt-helios-3600": "whole-home backup",
  "mango-power-e": "whole-home backup",
  "bluetti-apex-300": "whole-home backup",
  "jackery-explorer-5000-plus": "whole-home backup",
  "ecoflow-delta-pro-ultra": "whole-home backup",

  // 10-product catalog expansion, site-owner-supplied editorial illustrations (2026-09-12).
  "ecoflow-river-3": "compact",
  "goal-zero-yeti-300": "compact",
  "bluetti-elite-200-v2": "large",
  "ecoflow-delta-3-max": "large",
  "ecoflow-delta-3-max-plus": "large",
  "anker-solix-f2000": "large",
  "jackery-homepower-3000": "whole-home backup",
  "ecoflow-delta-3-ultra-plus": "whole-home backup",
  "bluetti-elite-400": "whole-home backup",
  "jackery-homepower-3600-plus": "whole-home backup",
};

/**
 * Product ids whose render is a generated placeholder (brand/model text on a
 * neutral card, with "ILLUSTRATIVE PLACEHOLDER" baked into the image) rather
 * than a real render. Purely a UI-labeling flag — both kinds of file are
 * equally real, unique-per-product, and never claim to be a photograph;
 * this just lets the interface say "placeholder" explicitly for the ones
 * that are. Empty since 2026-09-11: the 17 products that used to be here
 * (the "40-product catalog build-out" cohort) each received an
 * independently-produced editorial illustration (see
 * EDITORIAL_ILLUSTRATION_IDS below) supplied by the site owner, replacing
 * their generated placeholder file. No catalog product is a placeholder
 * anymore — kept as a live Set (not deleted) so the labeling mechanism is
 * still there if a future product ever needs it again.
 */
const PLACEHOLDER_RENDER_IDS = new Set<string>([]);

export function isPlaceholderIllustration(product: Product): boolean {
  return PLACEHOLDER_RENDER_IDS.has(product.id);
}

/**
 * Product ids whose /illustrations/<id>.png is an independently-produced
 * editorial illustration supplied directly by the site owner — distinct
 * both from the V1/V2 cohort's original PowerMatchLab renders and from a
 * generated placeholder. Two batches so far: 2026-09-11 (package
 * "powermatchlab-illustrations", 17 files) and 2026-09-12 (package
 * "powermatchlab-10-product-images", 10 files, background-removed from
 * opaque studio-background source renders — see
 * tests/illustration-integrity.test.ts for the transparency regression
 * coverage). Per the site owner's own integration instructions: these are
 * explicitly NOT official manufacturer photographs and must never be
 * captioned as one, but each one is a real, brand/model-specific artwork
 * (not a generic size-class stand-in) unique to its product id.
 */
const EDITORIAL_ILLUSTRATION_IDS = new Set<string>([
  "anker-solix-c800x",
  "bluetti-ac70",
  "bluetti-apex-300",
  "bluetti-elite-100-v2",
  "dji-power-1000-v2",
  "dji-power-2000",
  "dji-power-500",
  "ecoflow-delta-3-plus",
  "ecoflow-delta-pro-ultra",
  "ecoflow-river-3-plus",
  "goal-zero-yeti-1500-6th-gen",
  "growatt-helios-3600",
  "jackery-explorer-300-plus",
  "jackery-explorer-3000-v2",
  "jackery-explorer-500-v2",
  "jackery-explorer-5000-plus",
  "mango-power-e",

  // 10-product catalog expansion, site-owner-supplied editorial illustrations (2026-09-12).
  "bluetti-elite-200-v2",
  "ecoflow-river-3",
  "jackery-homepower-3000",
  "ecoflow-delta-3-max",
  "ecoflow-delta-3-max-plus",
  "ecoflow-delta-3-ultra-plus",
  "bluetti-elite-400",
  "goal-zero-yeti-300",
  "anker-solix-f2000",
  "jackery-homepower-3600-plus",
]);

export function isEditorialIllustration(product: Product): boolean {
  return EDITORIAL_ILLUSTRATION_IDS.has(product.id);
}

/**
 * Every catalog product has its own dedicated file in public/illustrations/
 * — one product, one file, never shared. Products v1/v2 (2026-09-05 and
 * earlier) each got an original 3D-style render representing their size
 * class; the 17-product "40-product catalog build-out" cohort each got a
 * brand/model-specific editorial illustration supplied by the site owner
 * (see EDITORIAL_ILLUSTRATION_IDS above), after briefly using a generated
 * "illustrative placeholder" (an on-brand card with brand/model text and an
 * explicit "ILLUSTRATIVE PLACEHOLDER" label baked in — see
 * scripts/gen-illustration-placeholder.py — no product currently uses one).
 * Whichever kind, the file is unique to that product id; two different
 * products never point at the same specific illustration.
 * tests/illustration-integrity.test.ts enforces both the existence and the
 * uniqueness of every path this function returns.
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
  if (isPlaceholderIllustration(product)) {
    return `Illustrative placeholder for the ${product.brand} ${product.model} (${sizeClass} class) — brand and model name only, not a photograph or a rendering of the actual product design.`;
  }
  if (isEditorialIllustration(product)) {
    return `Independent editorial illustration of the ${product.brand} ${product.model} — not an official manufacturer photograph.`;
  }
  return `Original illustrative render representing a ${sizeClass} portable power station — not an exact photograph of the ${product.brand} ${product.model}.`;
}

export function getIllustrationCaption(product: Product): string {
  if (isPlaceholderIllustration(product)) {
    return "Illustrative placeholder — not a photograph of this product.";
  }
  if (isEditorialIllustration(product)) {
    return "Independent editorial illustration — not an official product photo.";
  }
  return ILLUSTRATIVE_CAPTION_SHORT;
}

export const ILLUSTRATIVE_CAPTION_SHORT = "Illustrative image — not an exact product photograph.";

export const ILLUSTRATIVE_CAPTION_LONG =
  "This original PowerMatchLab illustration represents the product category and is not an exact photograph of the model.";
