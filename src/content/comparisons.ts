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
  {
    slug: "jackery-explorer-1000-v2-vs-ecoflow-delta-3-classic",
    productIds: ["jackery-explorer-1000-v2", "ecoflow-delta-3-classic"],
    h1: "Jackery Explorer 1000 V2 vs EcoFlow DELTA 3 Classic",
    metaDescription:
      "Jackery Explorer 1000 V2 vs EcoFlow DELTA 3 Classic: capacity, output, surge and solar input compared side by side for U.S. buyers deciding between these two ~1kWh power stations.",
    intro:
      "Both sit in the roughly 1,000-1,070 Wh capacity class and are commonly shortlisted together for refrigerator backup and camping. This comparison is for shoppers who have already narrowed their choice to these two and want the on-file differences the data actually supports — not marketing claims.",
    relatedBestForSlugs: ["best-for-refrigerator-backup"],
    relatedGuideSlug: "power-station-for-refrigerator",
  },
  {
    slug: "bluetti-ac180-vs-jackery-explorer-1000-v2",
    productIds: ["bluetti-ac180", "jackery-explorer-1000-v2"],
    h1: "BLUETTI AC180 vs Jackery Explorer 1000 V2",
    metaDescription:
      "BLUETTI AC180 vs Jackery Explorer 1000 V2: capacity, surge output, weight and solar input compared for U.S. buyers close to a decision between these two mid-size power stations.",
    intro:
      "Both land in the same practical mid-size class — enough capacity for a day of refrigerator backup or a weekend of RV and camping use — and both are frequently cross-shopped by buyers who have already ruled out smaller and larger units. This page compares only what's verified on file for each.",
    relatedBestForSlugs: ["best-for-refrigerator-backup", "best-for-rv"],
    relatedGuideSlug: "power-station-for-refrigerator",
  },
  {
    slug: "bluetti-ac180-vs-ecoflow-delta-3-classic",
    productIds: ["bluetti-ac180", "ecoflow-delta-3-classic"],
    h1: "BLUETTI AC180 vs EcoFlow DELTA 3 Classic",
    metaDescription:
      "BLUETTI AC180 vs EcoFlow DELTA 3 Classic: capacity, continuous output, surge and AC charging speed compared side by side for U.S. refrigerator-backup and home-essentials buyers.",
    intro:
      "Both are marketed for refrigerator backup and home essentials at a similar ~1,024-1,152 Wh capacity, making them a common two-way decision for shoppers sizing a station around a single major appliance rather than a whole house.",
    relatedBestForSlugs: ["best-for-refrigerator-backup"],
    relatedGuideSlug: "can-a-power-station-run-a-refrigerator",
  },
  {
    slug: "ecoflow-delta-2-max-vs-anker-solix-c2000-gen-2",
    productIds: ["ecoflow-delta-2-max", "anker-solix-c2000-gen-2"],
    h1: "EcoFlow DELTA 2 Max vs Anker SOLIX C2000 Gen 2",
    metaDescription:
      "EcoFlow DELTA 2 Max vs Anker SOLIX C2000 Gen 2: both rated at 2,048 Wh — the real differences in output, weight and idle draw compared for U.S. home-backup buyers.",
    intro:
      "Both units share an identical registered capacity of 2,048 Wh, which makes this a genuinely close call decided by output, weight and standby efficiency rather than raw energy storage — exactly the kind of pairing where the spec details below matter more than the headline number.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
  },
  {
    slug: "anker-solix-c2000-gen-2-vs-jackery-explorer-2000-v2",
    productIds: ["anker-solix-c2000-gen-2", "jackery-explorer-2000-v2"],
    h1: "Anker SOLIX C2000 Gen 2 vs Jackery Explorer 2000 V2",
    metaDescription:
      "Anker SOLIX C2000 Gen 2 vs Jackery Explorer 2000 V2: capacity, surge output and weight compared side by side for U.S. buyers deciding between these two ~2kWh home-backup stations.",
    intro:
      "Both sit in the ~2,000-2,050 Wh class positioned for home essentials, RV use and refrigerator backup, and both show up on the same shortlists for buyers who want more runtime than a ~1kWh unit without moving up to a whole-home-class station.",
    relatedBestForSlugs: ["best-for-home-backup", "best-for-rv"],
    relatedGuideSlug: "power-station-for-home-backup",
  },
  {
    slug: "anker-solix-c1000-gen-2-vs-segway-cube-1000",
    productIds: ["anker-solix-c1000-gen-2", "segway-cube-1000"],
    h1: "Anker SOLIX C1000 Gen 2 vs Segway Cube 1000",
    metaDescription:
      "Anker SOLIX C1000 Gen 2 vs Segway Cube 1000: both rated at 1,024 Wh — output, surge and verified specs compared for U.S. buyers weighing an established brand against a newer entrant.",
    intro:
      "Both are registered at an identical 1,024 Wh capacity, but come from very different market positions — Anker SOLIX is an established power-station line, while Segway is a newer entrant to this category. This comparison sticks strictly to verified specs rather than brand reputation.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
  },
  {
    slug: "jackery-explorer-2000-v2-vs-bluetti-ac200l",
    productIds: ["jackery-explorer-2000-v2", "bluetti-ac200l"],
    h1: "Jackery Explorer 2000 V2 vs BLUETTI AC200L",
    metaDescription:
      "Jackery Explorer 2000 V2 vs BLUETTI AC200L: capacity, surge output and weight compared side by side for U.S. buyers deciding between these two ~2kWh home-backup and RV power stations.",
    intro:
      "Both are ~2,040-2,050 Wh units aimed at home backup and RV use, and both are commonly cross-shopped by buyers who have already decided this capacity class fits their needs and want to know which specific unit delivers more for the same rough footprint.",
    relatedBestForSlugs: ["best-for-home-backup", "best-for-rv"],
    relatedGuideSlug: "power-station-for-rv",
  },
  {
    slug: "ecoflow-delta-pro-3-vs-anker-solix-f3800",
    productIds: ["ecoflow-delta-pro-3", "anker-solix-f3800"],
    h1: "EcoFlow DELTA Pro 3 vs Anker SOLIX F3800",
    metaDescription:
      "EcoFlow DELTA Pro 3 vs Anker SOLIX F3800: capacity, output, surge and 240V support compared for U.S. buyers sizing a whole-home backup station.",
    intro:
      "Both are top-tier, whole-home-class stations with 240V output and multi-kW continuous ratings, aimed at buyers who want to run large circuits or several major appliances at once rather than a single essential. This is a decision between two premium options, not a budget comparison.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    studioLinkLabel: "Visualize a whole-home scenario in Power Setup Studio",
  },
  {
    slug: "anker-solix-f3000-vs-pecron-e3600lfp",
    productIds: ["anker-solix-f3000", "pecron-e3600lfp"],
    h1: "Anker SOLIX F3000 vs Pecron E3600LFP",
    metaDescription:
      "Anker SOLIX F3000 vs Pecron E3600LFP: both rated at 3,072 Wh — output, surge and verified specs compared for U.S. buyers sizing a large home-backup station.",
    intro:
      "Both are registered at an identical 3,072 Wh capacity in the large home-backup class, making surge output and continuous rating — not stored energy — the deciding factors for buyers who need to run larger appliances during an extended outage.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getComparisonsForProduct(productId: string): Comparison[] {
  return COMPARISONS.filter((c) => c.productIds.includes(productId));
}
