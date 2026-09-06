/**
 * Editorial, manually-curated direct model comparisons.
 *
 * Deliberately NOT auto-generated from every catalog pairing — each entry is
 * a hand-picked, high-intent comparison. Specs are never copied into this
 * file: the page reads them live from `products.json` via `productIds`.
 */

export interface Comparison {
  slug: string;
  productIds: [string, string];
  h1: string;
  metaDescription: string;
  intro: string;
  /** Best-For pages to link to from this comparison (at most one fridge + one RV page, by convention). */
  relatedBestForSlugs: string[];
  /** The primary sizing guide to link to (see content/guides.ts). */
  relatedGuideSlug: string;
  /** Label for a Power Setup Studio link, shown only when it helps visualize the scenario. */
  studioLinkLabel?: string;
}

export const COMPARISONS: Comparison[] = [
  {
    slug: "ecoflow-delta-3-classic-vs-anker-solix-c1000-gen-2",
    productIds: ["ecoflow-delta-3-classic", "anker-solix-c1000-gen-2"],
    h1: "EcoFlow DELTA 3 Classic vs Anker SOLIX C1000 Gen 2",
    metaDescription:
      "EcoFlow DELTA 3 Classic vs Anker SOLIX C1000 Gen 2: capacity, output, charging, ports and PowerMatchLab's editorial score compared side by side, for U.S. buyers close to a decision.",
    intro:
      "Both are 1,024 Wh LiFePO4 power stations aimed at similar portable-power needs, including refrigerator backup, RV trips and home essentials. This comparison is for shoppers who have already narrowed their choice to these two models and want the real differences the data supports — not marketing claims.",
    relatedBestForSlugs: ["best-for-refrigerator-backup", "best-for-rv"],
    relatedGuideSlug: "power-station-for-refrigerator",
    studioLinkLabel: "Visualize the Home Backup scenario in Power Setup Studio",
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getComparisonsForProduct(productId: string): Comparison[] {
  return COMPARISONS.filter((c) => c.productIds.includes(productId));
}
