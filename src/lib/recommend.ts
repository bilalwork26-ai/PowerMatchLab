/**
 * Deterministic, explainable recommendation engine.
 *
 * Given the output of the Power Calculator plus a few stated preferences, it
 * classifies every catalog product and explains why. It never fabricates a
 * score and never silently hides a product that fails a hard requirement — it
 * labels it "Not Suitable" with the reason.
 */

import type { Product, UseCaseKey } from "@/types/product";
import type { CalculatorResult } from "./calculator";
import { type ProductScore, scoreProduct } from "./score";

export type MatchStatus =
  | "Best Match"
  | "Good Match"
  | "Possible Match"
  | "Not Suitable";

export interface RecommendationPreferences {
  useCase?: UseCaseKey | null;
  /** Visitor needs native 120/240V split-phase output. */
  needs240V?: boolean;
  /** Visitor needs an RV TT-30 outlet. */
  needsTT30?: boolean;
  /** Visitor wants to be able to add expansion batteries later. */
  wantsExpandable?: boolean;
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
    "Best Match": 0,
    "Good Match": 1,
    "Possible Match": 2,
    "Not Suitable": 3,
  };

  return recs.sort((a, b) => {
    if (statusRank[a.status] !== statusRank[b.status]) {
      return statusRank[a.status] - statusRank[b.status];
    }
    return b.fitScore - a.fitScore;
  });
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
  if (prefs.wantsExpandable) {
    if (product.expandable === true) {
      reasons.push(
        product.max_expanded_capacity_wh != null
          ? `Expandable up to ${formatWh(product.max_expanded_capacity_wh)}.`
          : "Supports expansion batteries (ceiling not verified).",
      );
    } else if (product.expandable === false) {
      limitations.push("Not expandable — capacity is fixed.");
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

  // ---- Status ---------------------------------------------------------
  const hardFailCapacityOrOutput =
    (product.capacity_wh != null && !meetsCapacity) ||
    (product.rated_output_w != null && !meetsContinuous);

  let status: MatchStatus;
  if (hardFailCapacityOrOutput || hardFailPrefs) {
    status = "Not Suitable";
  } else if (product.capacity_wh == null || product.rated_output_w == null) {
    // Missing the data needed to confirm the core requirements.
    status = "Possible Match";
  } else {
    const comfortable =
      capacityComfort >= 1 &&
      outputComfort >= 1.2 &&
      meetsSurge !== false &&
      (powerMatchScore.overall == null || powerMatchScore.overall >= 55);
    const workable =
      meetsCapacity &&
      meetsContinuous &&
      outputComfort >= 1.05 &&
      meetsSurge !== false;

    if (comfortable) status = "Best Match";
    else if (workable) status = "Good Match";
    else status = "Possible Match";
  }

  // ---- Fit score for intra-band ordering ------------------------------
  const fitScore = computeFitScore({
    capacityComfort,
    outputComfort,
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
  };
}

function computeFitScore(args: {
  capacityComfort: number;
  outputComfort: number;
  meetsSurge: boolean | null;
  powerMatchOverall: number | null;
  prefs: RecommendationPreferences;
  product: Product;
}): number {
  const { capacityComfort, outputComfort, meetsSurge, powerMatchOverall, prefs, product } =
    args;
  let score = 0;
  // Reward being close to (not wildly above) the recommended minimum.
  score += Math.max(0, 40 - Math.abs(1 - Math.min(capacityComfort, 3)) * 20);
  score += Math.min(25, outputComfort * 12);
  if (meetsSurge === true) score += 10;
  if (meetsSurge === null) score += 4;
  if (powerMatchOverall != null) score += powerMatchOverall * 0.2;
  if (prefs.prioritisePortability && product.weight_kg != null) {
    score += Math.max(0, 15 - product.weight_kg * 0.4);
  }
  return Math.round(score);
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
