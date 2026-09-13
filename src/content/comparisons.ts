/**
 * Editorial, manually-curated direct model comparisons.
 *
 * Deliberately NOT auto-generated from every catalog pairing — each entry is
 * a hand-picked, high-intent comparison. Specs are never copied into this
 * file: the page reads them live from `products.json` via `productIds`.
 *
 * Most entries compare exactly two models; a curated subset compares three
 * when three models are genuinely and simultaneously cross-shopped (see the
 * 2026-09 editorial-comparisons expansion). `productIds` is intentionally a
 * plain array rather than a fixed-length tuple so both shapes type-check —
 * `tests/comparisons.test.ts` enforces the 2-or-3 constraint at the data
 * level instead.
 */

/**
 * Editorial grouping used only to organize the /compare index page into
 * recognizable buying categories. This is a curation label, not a derived
 * spec — it never feeds the comparison table or any calculation.
 */
export type IndexCategory =
  | "same-family"
  | "~1000wh"
  | "~2000wh"
  | "high-capacity-home-backup"
  | "portability-camping"
  | "cross-brand";

export interface Comparison {
  slug: string;
  productIds: string[];
  h1: string;
  metaDescription: string;
  intro: string;
  /** Best-For pages to link to from this comparison (at most one fridge + one RV page, by convention). */
  relatedBestForSlugs: string[];
  /** The primary sizing guide to link to (see content/guides.ts). */
  relatedGuideSlug: string;
  /** Label for a Power Setup Studio link, shown only when it helps visualize the scenario. */
  studioLinkLabel?: string;
  /** Which /compare index section this comparison is grouped under. */
  indexCategory: IndexCategory;
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
    indexCategory: "~1000wh",
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
    indexCategory: "~1000wh",
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
    indexCategory: "~1000wh",
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
    indexCategory: "cross-brand",
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
    indexCategory: "~2000wh",
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
    indexCategory: "~2000wh",
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
    indexCategory: "cross-brand",
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
    indexCategory: "~2000wh",
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
    indexCategory: "high-capacity-home-backup",
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
    indexCategory: "high-capacity-home-backup",
  },
  {
    slug: "ecoflow-delta-3-max-vs-ecoflow-delta-3-max-plus-vs-ecoflow-delta-3-ultra-plus",
    productIds: ["ecoflow-delta-3-max", "ecoflow-delta-3-max-plus", "ecoflow-delta-3-ultra-plus"],
    h1: "EcoFlow DELTA 3 Max vs DELTA 3 Max Plus vs DELTA 3 Ultra Plus",
    metaDescription:
      "EcoFlow DELTA 3 Max vs DELTA 3 Max Plus vs DELTA 3 Ultra Plus: capacity, output, solar input and expandability compared across EcoFlow's DELTA 3 lineup for U.S. home-backup buyers.",
    intro:
      "All three are EcoFlow DELTA 3-series stations built on the same battery platform, which turns this into a within-family sizing decision rather than a brand comparison. This page is for shoppers who have already decided on the DELTA 3 line and want to know exactly what changes — and what doesn't — as you move up from Max to Max Plus to Ultra Plus.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    indexCategory: "same-family",
  },
  {
    slug: "jackery-homepower-3000-vs-jackery-homepower-3600-plus",
    productIds: ["jackery-homepower-3000", "jackery-homepower-3600-plus"],
    h1: "Jackery HomePower 3000 vs HomePower 3600 Plus",
    metaDescription:
      "Jackery HomePower 3000 vs HomePower 3600 Plus: capacity, continuous output and expandable storage compared for U.S. buyers sizing Jackery's whole-home HomePower line.",
    intro:
      "Both units belong to Jackery's newer HomePower line, aimed squarely at whole-home backup rather than portable use. The decision between them comes down to how much stored energy and continuous output your specific circuits need, not a difference in brand or build philosophy.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    indexCategory: "same-family",
  },
  {
    slug: "bluetti-elite-200-v2-vs-bluetti-elite-300-vs-bluetti-elite-400",
    productIds: ["bluetti-elite-200-v2", "bluetti-elite-300", "bluetti-elite-400"],
    h1: "BLUETTI Elite 200 V2 vs Elite 300 vs Elite 400",
    metaDescription:
      "BLUETTI Elite 200 V2 vs Elite 300 vs Elite 400: capacity, output and expandability compared across BLUETTI's Elite lineup for U.S. home-backup buyers.",
    intro:
      "These three models form BLUETTI's current Elite series at three different capacity points. Because they share a product family, the meaningful differences are in stored energy, continuous output and expansion headroom — not battery chemistry or core feature set — making this a sizing decision more than a brand one.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    indexCategory: "same-family",
  },
  {
    slug: "anker-solix-f2000-vs-anker-solix-f3000-vs-anker-solix-f3800",
    productIds: ["anker-solix-f2000", "anker-solix-f3000", "anker-solix-f3800"],
    h1: "Anker SOLIX F2000 (PowerHouse 767) vs F3000 vs F3800",
    metaDescription:
      "Anker SOLIX F2000 (PowerHouse 767) vs F3000 vs F3800: capacity, continuous output, surge and 240V support compared across Anker's F-series for U.S. whole-home backup buyers.",
    intro:
      "The F2000, F3000 and F3800 are Anker's SOLIX F-series stations, positioned for home backup rather than portable use. This comparison is for buyers who have already chosen the F-series and need to decide how much capacity and continuous output actually matches their circuits, rather than which brand to trust.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    indexCategory: "same-family",
  },
  {
    slug: "ecoflow-delta-2-max-vs-ecoflow-delta-3-max",
    productIds: ["ecoflow-delta-2-max", "ecoflow-delta-3-max"],
    h1: "EcoFlow DELTA 2 Max vs DELTA 3 Max",
    metaDescription:
      "EcoFlow DELTA 2 Max vs DELTA 3 Max: two generations of EcoFlow's ~2,000 Wh line compared on output, charging speed and expandability for U.S. buyers.",
    intro:
      "The DELTA 2 Max and DELTA 3 Max sit in the same capacity class but represent two different generations of EcoFlow's mid-size line. This page is for buyers deciding whether the newer generation's changes are worth it over the earlier model, based only on what's verified for each.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    indexCategory: "same-family",
  },
  {
    slug: "jackery-explorer-2000-v2-vs-jackery-homepower-3000",
    productIds: ["jackery-explorer-2000-v2", "jackery-homepower-3000"],
    h1: "Jackery Explorer 2000 V2 vs HomePower 3000",
    metaDescription:
      "Jackery Explorer 2000 V2 vs HomePower 3000: capacity, output and portability compared for U.S. buyers deciding between Jackery's portable Explorer line and its whole-home HomePower line.",
    intro:
      "Both are Jackery products, but they come from two different lines built for different jobs: the Explorer 2000 V2 for portable and RV use, the HomePower 3000 for stationary whole-home backup. This comparison is for buyers weighing those two use cases against each other within one brand.",
    relatedBestForSlugs: ["best-for-rv", "best-for-home-backup"],
    relatedGuideSlug: "power-station-for-rv",
    indexCategory: "~2000wh",
  },
  {
    slug: "anker-solix-c2000-gen-2-vs-anker-solix-f2000",
    productIds: ["anker-solix-c2000-gen-2", "anker-solix-f2000"],
    h1: "Anker SOLIX C2000 Gen 2 vs F2000 (PowerHouse 767)",
    metaDescription:
      "Anker SOLIX C2000 Gen 2 vs F2000 (PowerHouse 767): capacity, continuous output and portability compared for U.S. buyers choosing between Anker's portable C-series and home-backup F-series.",
    intro:
      "The C2000 Gen 2 and F2000 both carry the Anker SOLIX name but target different jobs — the C2000 Gen 2 leans portable, the F2000 leans stationary home backup. This page compares the verified specs for buyers deciding which of Anker's own lines actually fits their situation.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    indexCategory: "~2000wh",
  },
  {
    slug: "bluetti-ac200l-vs-bluetti-elite-200-v2",
    productIds: ["bluetti-ac200l", "bluetti-elite-200-v2"],
    h1: "BLUETTI AC200L vs Elite 200 V2",
    metaDescription:
      "BLUETTI AC200L vs Elite 200 V2: capacity, output, solar input and ports compared for U.S. buyers deciding between BLUETTI's established AC line and its newer Elite line.",
    intro:
      "The AC200L is BLUETTI's longer-standing ~2kWh model, while the Elite 200 V2 is a newer line at a similar capacity point. This comparison is for buyers who have narrowed their choice to BLUETTI and want to know what actually changed between the two lines, not which one is simply newer.",
    relatedBestForSlugs: ["best-for-rv", "best-for-home-backup"],
    relatedGuideSlug: "power-station-for-rv",
    indexCategory: "~2000wh",
  },
  {
    slug: "goal-zero-yeti-300-vs-goal-zero-yeti-700",
    productIds: ["goal-zero-yeti-300", "goal-zero-yeti-700"],
    h1: "Goal Zero Yeti 300 vs Yeti 700",
    metaDescription:
      "Goal Zero Yeti 300 vs Yeti 700: capacity, weight and portability compared for U.S. campers deciding how much power they actually need to carry.",
    intro:
      "Both belong to Goal Zero's compact Yeti line, but sit at meaningfully different capacity and weight points. This comparison is for campers and weekend-trip buyers deciding whether the smaller Yeti 300 covers their needs or the larger Yeti 700's extra capacity is worth the added weight.",
    relatedBestForSlugs: ["best-for-camping"],
    relatedGuideSlug: "power-station-for-camping",
    indexCategory: "portability-camping",
  },
  {
    slug: "ecoflow-river-3-vs-bluetti-elite-30-v2",
    productIds: ["ecoflow-river-3", "bluetti-elite-30-v2"],
    h1: "EcoFlow RIVER 3 vs BLUETTI Elite 30 V2",
    metaDescription:
      "EcoFlow RIVER 3 vs BLUETTI Elite 30 V2: capacity, weight and charging speed compared for U.S. buyers choosing a compact, cross-brand power station for camping and everyday carry.",
    intro:
      "Both are small, sub-300 Wh stations from different brands, aimed at buyers who want something light enough to carry daily rather than a home-backup unit. This page sticks to the verified specs that actually distinguish two compact stations at a similar capacity point.",
    relatedBestForSlugs: ["best-for-camping"],
    relatedGuideSlug: "power-station-for-camping",
    indexCategory: "portability-camping",
  },
  {
    slug: "anker-solix-c1000-gen-2-vs-ecoflow-delta-3-classic-vs-jackery-explorer-1000-v2",
    productIds: ["anker-solix-c1000-gen-2", "ecoflow-delta-3-classic", "jackery-explorer-1000-v2"],
    h1: "Anker SOLIX C1000 Gen 2 vs EcoFlow DELTA 3 Classic vs Jackery Explorer 1000 V2",
    metaDescription:
      "Anker SOLIX C1000 Gen 2 vs EcoFlow DELTA 3 Classic vs Jackery Explorer 1000 V2: a three-way, ~1,000 Wh cross-brand comparison for U.S. refrigerator-backup and camping buyers.",
    intro:
      "These three ~1,000 Wh stations from three different brands are the most commonly cross-shopped set at this capacity point. Rather than repeat the same three two-way comparisons separately, this page puts all three side by side so buyers who haven't picked a brand yet can see every verified difference at once.",
    relatedBestForSlugs: ["best-for-refrigerator-backup"],
    relatedGuideSlug: "power-station-for-refrigerator",
    indexCategory: "~1000wh",
  },
  {
    slug: "anker-solix-c2000-gen-2-vs-ecoflow-delta-2-max-vs-jackery-explorer-2000-v2",
    productIds: ["anker-solix-c2000-gen-2", "ecoflow-delta-2-max", "jackery-explorer-2000-v2"],
    h1: "Anker SOLIX C2000 Gen 2 vs EcoFlow DELTA 2 Max vs Jackery Explorer 2000 V2",
    metaDescription:
      "Anker SOLIX C2000 Gen 2 vs EcoFlow DELTA 2 Max vs Jackery Explorer 2000 V2: a three-way, ~2,000 Wh cross-brand comparison for U.S. home-backup buyers.",
    intro:
      "These three ~2,000 Wh stations from three different brands routinely show up on the same shortlists. This page compares all three together — rather than as separate two-way pages — for buyers who are still deciding between brands at this specific capacity class.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    indexCategory: "~2000wh",
  },
  {
    slug: "anker-solix-f3000-vs-bluetti-elite-300-vs-pecron-e3600lfp",
    productIds: ["anker-solix-f3000", "bluetti-elite-300", "pecron-e3600lfp"],
    h1: "Anker SOLIX F3000 vs BLUETTI Elite 300 vs Pecron E3600LFP",
    metaDescription:
      "Anker SOLIX F3000 vs BLUETTI Elite 300 vs Pecron E3600LFP: capacity, output and surge compared across three large, cross-brand home-backup stations for U.S. buyers.",
    intro:
      "All three are large-capacity stations aimed at extended home backup, from three different manufacturers. This page is for buyers who have decided they need this capacity class and want to compare across brands rather than assuming any one name is the safer choice.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    indexCategory: "high-capacity-home-backup",
  },
  {
    slug: "jackery-explorer-5000-plus-vs-ecoflow-delta-pro-ultra",
    productIds: ["jackery-explorer-5000-plus", "ecoflow-delta-pro-ultra"],
    h1: "Jackery Explorer 5000 Plus vs EcoFlow DELTA Pro Ultra",
    metaDescription:
      "Jackery Explorer 5000 Plus vs EcoFlow DELTA Pro Ultra: capacity, output and expandability compared between two of the largest cross-brand home-backup stations for U.S. buyers.",
    intro:
      "These are two of the highest-capacity stations in the current catalog, both positioned as whole-home backup systems rather than portable units. This comparison is for buyers who need this scale of capacity and are deciding between two different manufacturers' flagship approaches.",
    relatedBestForSlugs: ["best-for-home-backup"],
    relatedGuideSlug: "power-station-for-home-backup",
    studioLinkLabel: "Visualize a whole-home scenario in Power Setup Studio",
    indexCategory: "high-capacity-home-backup",
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getComparisonsForProduct(productId: string): Comparison[] {
  return COMPARISONS.filter((c) => c.productIds.includes(productId));
}
