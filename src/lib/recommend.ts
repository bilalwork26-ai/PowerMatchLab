/**
 * Deterministic, explainable recommendation engine.
 *
 * Given the output of the Power Calculator plus a few stated preferences, it
 * classifies every catalog product in two separate steps:
 *
 * 1. COMPATIBILITY — does it meet every verifiable hard requirement
 *    (capacity, continuous output, surge when a real spike is expected,
 *    240V/TT-30/expansion when the visitor marks them required)? A product
 *    that fails any of these is never hidden — it is labeled "Not Suitable"
 *    with the exact reason.
 * 2. FIT — among compatible products, how PROPORTIONATE is it to the
 *    stated need? Clearing the minimum bar is not enough to be a good
 *    recommendation: see size-fit.ts for the "Best Fit / Good Fit /
 *    Oversized" classification that prevents a 6,000 Wh station from
 *    outranking a well-matched 800 Wh one for a 400 Wh requirement.
 *
 * It never fabricates a score, never lets affiliate-link availability
 * influence ranking, and never treats an unverified field as a pass.
 */

import type { Product, UseCaseKey } from "@/types/product";
import type { CalculatorResult } from "./calculator";
import { type ProductScore, scoreProduct } from "./score";
import { capacityFitScore, combinedSizeFit, outputFitScore } from "./size-fit";

/**
 * Best Fit / Good Fit / Oversized are all COMPATIBLE (every hard
 * requirement is met) — they differ only in how proportionate the product
 * is to the stated need, per size-fit.ts. Possible Match means core
 * capacity/output data is unverified, so compatibility itself cannot be
 * confirmed either way. Not Suitable means a verified hard requirement
 * failed, with the reason always stated.
 */
export type MatchStatus =
  | "Best Fit"
  | "Good Fit"
  | "Oversized"
  | "Possible Match"
  | "Not Suitable";

export interface RecommendationPreferences {
  useCase?: UseCaseKey | null;
  /** Visitor needs native 120/240V split-phase output. */
  needs240V?: boolean;
  /** Visitor needs an RV TT-30 outlet. */
  needsTT30?: boolean;
  /**
   * Visitor requires the ability to add expansion batteries later. Unlike
   * needsUpsTransfer below, this has a clean binary answer in the catalog
   * (`expandable: true | false | null`), so when set it is a HARD
   * requirement: a unit explicitly marked non-expandable is Not Suitable,
   * not just penalized.
   */
  wantsExpandable?: boolean;
  /**
   * Visitor wants a fast automatic transfer switch / UPS-style behavior.
   * There is no editorially-established "fast enough" threshold in
   * milliseconds, so this never hard-fails a product — it only surfaces the
   * unit's own verified `ups_ms` figure as a reason, or flags the
   * uncertainty when it is not verified, so the visitor can judge it
   * themselves against their own equipment's tolerance.
   */
  needsUpsTransfer?: boolean;
  /** Visitor prioritises low weight / carryability. */
  prioritisePortability?: boolean;
  /** Allow counting expansion capacity toward the capacity requirement. */
  allowExpansionForCapacity?: boolean;
}

export interface Recommendation {
  product: Product;
  status: MatchStatus;
  /** 0-100 fit score used purely for ranking within a status band. */
  fitScore: number;
  reasons: string[];
  limitations: string[];
  powerMatchScore: ProductScore;
  /** Effective capacity considered (nameplate, or expanded when permitted). */
  consideredCapacityWh: number | null;
  meetsContinuous: boolean;
  meetsCapacity: boolean;
  meetsSurge: boolean | null; // null when surge data missing
  /**
   * consideredCapacityWh ÷ recommendedMinimumCapacityWh, null when capacity
   * is unverified. Exposed so the UI can explain the exact proportion
   * ("2.6x your recommended minimum") rather than just naming a tier.
   */
  capacityRatio: number | null;
  /** rated_output_w ÷ requiredContinuousOutputW, null when output is unverified. */
  outputRatio: number | null;
}

const USE_CASE_TAGS: Record<UseCaseKey, string[]> = {
  camping: ["camping", "day trips", "road trips", "outdoors"],
  rv: ["rv", "rv use", "rv electronics"],
  "refrigerator-backup": [
    "refrigerator backup",
    "refrigerator and freezer backup",
    "fridge",
  ],
  "home-backup": [
    "home backup",
    "home essentials",
    "home emergency backup",
    "extended home essentials",
    "whole-home backup",
    "ups backup",
    "emergency home essentials",
  ],
};

function matchesUseCase(product: Product, useCase: UseCaseKey): boolean {
  const wanted = USE_CASE_TAGS[useCase];
  return product.best_for.some((tag) =>
    wanted.some((w) => tag.toLowerCase().includes(w)),
  );
}

export function recommendProducts(
  result: CalculatorResult,
  catalog: Product[],
  prefs: RecommendationPreferences = {},
): Recommendation[] {
  const recs = catalog.map((product) =>
    evaluateProduct(product, result, catalog, prefs),
  );

  const statusRank: Record<MatchStatus, number> = {
    "Best Fit": 0,
    "Good Fit": 1,
    "Oversized": 2,
    "Possible Match": 3,
    "Not Suitable": 4,
  };

  return recs.sort((a, b) => {
    if (statusRank[a.status] !== statusRank[b.status]) {
      return statusRank[a.status] - statusRank[b.status];
    }
    return b.fitScore - a.fitScore;
  });
}

export interface RecommendationGroups {
  /** Best Fit + Good Fit — the small set of genuinely proportionate options to show first. */
  primary: Recommendation[];
  /** Compatible but disproportionately large — shown separately, never mixed into primary. */
  oversized: Recommendation[];
  /** Core capacity/output data unverified — compatibility itself can't be confirmed. */
  possible: Recommendation[];
  /** Fails a verified hard requirement — always kept accessible with the exact reason. */
  notSuitable: Recommendation[];
}

/**
 * Single source of truth for grouping a sorted `Recommendation[]` into the
 * sections every calculator UI renders (primary results up front, oversized
 * alternatives and unverified/incompatible products tucked into secondary,
 * disclosed sections). Previously each of the Power Calculator, the /tools
 * results block, and Power Setup Studio re-implemented this filtering
 * independently — centralizing it here means they can never drift apart,
 * and a product's status is only ever interpreted in one place.
 */
export function groupRecommendations(recs: Recommendation[]): RecommendationGroups {
  return {
    primary: recs.filter((r) => r.status === "Best Fit" || r.status === "Good Fit"),
    oversized: recs.filter((r) => r.status === "Oversized"),
    possible: recs.filter((r) => r.status === "Possible Match"),
    notSuitable: recs.filter((r) => r.status === "Not Suitable"),
  };
}

function evaluateProduct(
  product: Product,
  result: CalculatorResult,
  catalog: Product[],
  prefs: RecommendationPreferences,
): Recommendation {
  const reasons: string[] = [];
  const limitations: string[] = [];

  const powerMatchScore = scoreProduct(product, catalog);

  // ---- Capacity -----------------------------------------------------------
  const nameplate = product.capacity_wh;
  const useExpansion =
    Boolean(prefs.allowExpansionForCapacity) &&
    product.expandable === true &&
    product.max_expanded_capacity_wh != null;
  const consideredCapacityWh = useExpansion
    ? product.max_expanded_capacity_wh
    : nameplate;

  let meetsCapacity = false;
  let capacityComfort = 0; // ratio vs recommended minimum
  if (consideredCapacityWh != null) {
    meetsCapacity = consideredCapacityWh >= result.requiredUsableCapacityWh;
    capacityComfort =
      result.recommendedMinimumCapacityWh > 0
        ? consideredCapacityWh / result.recommendedMinimumCapacityWh
        : 1;

    if (consideredCapacityWh >= result.recommendedMinimumCapacityWh) {
      reasons.push(
        `Capacity ${formatWh(consideredCapacityWh)}${
          useExpansion ? " (with expansion)" : ""
        } covers your recommended minimum of ${formatWh(
          result.recommendedMinimumCapacityWh,
        )}.`,
      );
    } else if (meetsCapacity) {
      limitations.push(
        `Capacity ${formatWh(consideredCapacityWh)} covers the raw ${formatWh(
          result.requiredUsableCapacityWh,
        )} you need but leaves little reserve (recommended minimum ${formatWh(
          result.recommendedMinimumCapacityWh,
        )}).`,
      );
    } else {
      limitations.push(
        `Capacity ${formatWh(consideredCapacityWh)} is below the ${formatWh(
          result.requiredUsableCapacityWh,
        )} of usable energy your devices need.`,
      );
    }
  } else {
    limitations.push("Battery capacity is not verified for this unit.");
  }

  // ---- Continuous output ------------------------------------------------
  let meetsContinuous = false;
  let outputComfort = 0;
  if (product.rated_output_w != null) {
    meetsContinuous = product.rated_output_w >= result.requiredContinuousOutputW;
    outputComfort =
      result.requiredContinuousOutputW > 0
        ? product.rated_output_w / result.requiredContinuousOutputW
        : 1;
    if (meetsContinuous) {
      reasons.push(
        `Rated output ${formatW(product.rated_output_w)} handles your ${formatW(
          result.requiredContinuousOutputW,
        )} continuous load.`,
      );
    } else {
      limitations.push(
        `Rated output ${formatW(
          product.rated_output_w,
        )} is below your ${formatW(
          result.requiredContinuousOutputW,
        )} continuous load — some devices could not run at the same time.`,
      );
    }
  } else {
    limitations.push("Rated continuous output is not verified for this unit.");
  }

  // ---- Surge ----------------------------------------------------------
  // A verified surge rating that falls short of the estimated startup spike
  // is a real, checkable hard requirement (the unit could fail to start a
  // motor-driven device) — it hard-fails below, exactly like capacity and
  // continuous output. Only when the spec is unverified does it remain a
  // soft "cannot confirm" limitation, since there is nothing to check.
  let meetsSurge: boolean | null = null;
  if (result.requiredSurgeOutputW > result.requiredContinuousOutputW) {
    if (product.surge_output_w != null) {
      meetsSurge = product.surge_output_w >= result.requiredSurgeOutputW;
      if (meetsSurge) {
        reasons.push(
          `Surge rating ${formatW(product.surge_output_w)} covers the estimated ${formatW(
            result.requiredSurgeOutputW,
          )} startup spike.`,
        );
      } else {
        limitations.push(
          `Surge rating ${formatW(
            product.surge_output_w,
          )} may not cover the estimated ${formatW(
            result.requiredSurgeOutputW,
          )} startup spike from motor-driven devices.`,
        );
      }
    } else {
      limitations.push(
        `Surge rating is not verified, so we cannot confirm it covers the estimated ${formatW(
          result.requiredSurgeOutputW,
        )} startup spike.`,
      );
    }
  }

  // ---- Voltage / port preferences -------------------------------------
  let hardFailPrefs = false;
  if (prefs.needs240V) {
    if (product.voltage_240v === true) {
      reasons.push("Provides native 120/240V split-phase output.");
    } else if (product.voltage_240v === false) {
      limitations.push("No native 240V output, which you marked as required.");
      hardFailPrefs = true;
    } else {
      limitations.push("240V capability is not verified for this unit.");
    }
  }
  if (prefs.needsTT30) {
    if (product.rv_tt30 === true) {
      reasons.push("Has a native RV TT-30 (30A) outlet.");
    } else if (product.rv_tt30 === false) {
      limitations.push("No native TT-30 outlet, which you marked as required.");
      hardFailPrefs = true;
    } else {
      limitations.push("TT-30 outlet is not verified for this unit.");
    }
  }
  if (prefs.needsUpsTransfer) {
    if (product.ups_ms != null) {
      reasons.push(`UPS/transfer time is ${formatMs(product.ups_ms)} (manufacturer-published).`);
    } else {
      limitations.push(
        "UPS/transfer time is not verified for this unit — confirm it separately if your equipment needs a fast automatic switchover.",
      );
    }
  }
  if (prefs.wantsExpandable) {
    if (product.expandable === true) {
      reasons.push(
        product.max_expanded_capacity_wh != null
          ? `Expandable up to ${formatWh(product.max_expanded_capacity_wh)}.`
          : "Supports expansion batteries (ceiling not verified).",
      );
    } else if (product.expandable === false) {
      limitations.push("Not expandable, which you marked as required — capacity is fixed.");
      hardFailPrefs = true;
    } else {
      limitations.push("Expansion capability is not verified for this unit.");
    }
  }

  // ---- Portability preference ---------------------------------------
  if (prefs.prioritisePortability) {
    if (product.weight_kg != null) {
      if (product.weight_kg <= 12) {
        reasons.push(`Relatively easy to carry at ${formatKg(product.weight_kg)}.`);
      } else if (product.weight_kg >= 25) {
        limitations.push(
          `Heavy at ${formatKg(product.weight_kg)} — not a grab-and-go unit.`,
        );
      }
    } else {
      limitations.push("Weight is not verified for this unit.");
    }
  }

  // ---- Use-case fit ------------------------------------------------
  if (prefs.useCase) {
    if (matchesUseCase(product, prefs.useCase)) {
      reasons.push(
        `Manufacturer positions it for ${humanUseCase(prefs.useCase)}.`,
      );
    }
  }

  // ---- Status: compatibility first, then proportionality -------------
  // A verified insufficient surge rating is a real, checkable hard
  // requirement (see the Surge section above) — it hard-fails alongside
  // capacity and continuous output, not just capacity/output.
  const hardFailCapacityOrOutput =
    (product.capacity_wh != null && !meetsCapacity) ||
    (product.rated_output_w != null && !meetsContinuous) ||
    meetsSurge === false;

  const capacityRatio = consideredCapacityWh != null ? capacityComfort : null;
  const outputRatio = product.rated_output_w != null ? outputComfort : null;

  // A load whose startup surge genuinely exceeds its continuous draw (a
  // compressor, a motor) needs a CONFIRMED surge rating before a unit can be
  // called compatible — an unverified one is a real unknown, not a soft
  // footnote, for exactly this kind of load. Never let capacity/output alone
  // earn a Best/Good Fit label while the one spec that actually determines
  // "will it even start" is unconfirmed.
  const surgeUnverifiedButRelevant =
    meetsSurge === null && result.requiredSurgeOutputW > result.requiredContinuousOutputW;

  let status: MatchStatus;
  if (hardFailCapacityOrOutput || hardFailPrefs) {
    status = "Not Suitable";
  } else if (capacityRatio == null || outputRatio == null || surgeUnverifiedButRelevant) {
    // Missing the data needed to confirm compatibility AND proportionality.
    status = "Possible Match";
  } else {
    // Everything above this point is COMPATIBLE (meetsCapacity,
    // meetsContinuous, meetsSurge !== false, no hard-failed preference) —
    // size-fit.ts now decides how PROPORTIONATE it is, replacing the old
    // `>= 1` cliff that let arbitrarily oversized units claim "Best Match".
    const fit = combinedSizeFit(capacityRatio, outputRatio);
    status = fit === "best" ? "Best Fit" : fit === "good" ? "Good Fit" : "Oversized";
  }

  // ---- Fit score for intra-band ordering ------------------------------
  const fitScore = computeFitScore({
    capacityRatio,
    outputRatio,
    meetsSurge,
    powerMatchOverall: powerMatchScore.overall,
    prefs,
    product,
  });

  return {
    product,
    status,
    fitScore,
    reasons,
    limitations,
    powerMatchScore,
    consideredCapacityWh: consideredCapacityWh ?? null,
    meetsContinuous,
    meetsCapacity,
    meetsSurge,
    capacityRatio,
    outputRatio,
  };
}

/**
 * Ranking signal used only to order products WITHIN the same status —
 * never to decide status itself. Dominated by proportionality
 * (capacity/output fit, see size-fit.ts), with small tie-break
 * contributions from verified surge headroom, the catalog-relative
 * PowerMatch Score (a secondary signal, not a gate), and portability when
 * the visitor asked for it. Deliberately excludes anything not in
 * products.json — no price, popularity, rating, or affiliate-link
 * availability ever contributes here.
 */
function computeFitScore(args: {
  capacityRatio: number | null;
  outputRatio: number | null;
  meetsSurge: boolean | null;
  powerMatchOverall: number | null;
  prefs: RecommendationPreferences;
  product: Product;
}): number {
  const { capacityRatio, outputRatio, meetsSurge, powerMatchOverall, prefs, product } = args;
  let score = 0;
  score += capacityRatio != null ? capacityFitScore(capacityRatio) : 20; // neutral mid-value when unverified
  score += outputRatio != null ? outputFitScore(outputRatio) : 12;
  if (meetsSurge === true) score += 10;
  if (meetsSurge === null) score += 4;
  if (powerMatchOverall != null) score += powerMatchOverall * 0.15;
  if (prefs.prioritisePortability && product.weight_kg != null) {
    score += Math.max(0, 15 - product.weight_kg * 0.4);
  }
  if (prefs.wantsExpandable && product.expandable === true) score += 5;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function humanUseCase(useCase: UseCaseKey): string {
  switch (useCase) {
    case "camping":
      return "camping and outdoor use";
    case "rv":
      return "RV use";
    case "refrigerator-backup":
      return "refrigerator and freezer backup";
    case "home-backup":
      return "home backup";
  }
}

// Local light formatters (kept independent of React display helpers).
function formatWh(v: number): string {
  return `${Math.round(v).toLocaleString("en-US")} Wh`;
}
function formatW(v: number): string {
  return `${Math.round(v).toLocaleString("en-US")} W`;
}
function formatKg(v: number): string {
  return `${v.toFixed(1)} kg`;
}
function formatMs(v: number): string {
  return `${Math.round(v).toLocaleString("en-US")} ms`;
}
