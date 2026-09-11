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
  "anker-solix-c800-plus": "mid-size",
  "ecoflow-river-3-plus": "compact",
  "jackery-explorer-300-plus": "compact",
  "bluetti-ac70": "mid-size",
};

/**
 * Product ids whose render is a generated placeholder (brand/model text on a
 * neutral card, with "ILLUSTRATIVE PLACEHOLDER" baked into the image) rather
 * than an original 3D-style render. Purely a UI-labeling flag — both kinds
 * of file are equally real, unique-per-product, and never claim to be a
 * photograph; this just lets the interface say "placeholder" explicitly for
 * the ones that are.
 */
const PLACEHOLDER_RENDER_IDS = new Set<string>([
  "anker-solix-c800-plus",
  "ecoflow-river-3-plus",
  "jackery-explorer-300-plus",
  "bluetti-ac70",
]);

export function isPlaceholderIllustration(product: Product): boolean {
  return PLACEHOLDER_RENDER_IDS.has(product.id);
}

/**
 * Every catalog product has its own dedicated file in public/illustrations/
 * — one product, one file, never shared. Products v1/v2 (2026-09-05 and
 * earlier) each got an original 3D-style render; products added from
 * 2026-09-11 onward (this session has no image-generation capability) get a
 * generated "illustrative placeholder" instead — a neutral, on-brand card
 * with the product's own brand/model text baked in and an explicit
 * "ILLUSTRATIVE PLACEHOLDER" label in the image itself (see
 * scripts/gen-illustration-placeholder.py). Either way the file is unique to
 * that product id; two different products never point at the same specific
 * illustration. tests/illustration-integrity.test.ts enforces both the
 * existence and the uniqueness of every path this function returns.
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
  return `Original illustrative render representing a ${sizeClass} portable power station — not an exact photograph of the ${product.brand} ${product.model}.`;
}

export function getIllustrationCaption(product: Product): string {
  return isPlaceholderIllustration(product)
    ? "Illustrative placeholder — not a photograph of this product."
    : ILLUSTRATIVE_CAPTION_SHORT;
}

export const ILLUSTRATIVE_CAPTION_SHORT = "Illustrative image — not an exact product photograph.";

export const ILLUSTRATIVE_CAPTION_LONG =
  "This original PowerMatchLab illustration represents the product category and is not an exact photograph of the model.";
