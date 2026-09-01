/**
 * PowerMatch Score.
 *
 * An EDITORIAL / CALCULATED assessment, not a manufacturer claim and not a
 * measured test result. Scores are normalised relative to the products
 * currently in the PowerMatchLab catalog, so they answer "how does this unit
 * compare with the others we list" — not "how good is it in absolute terms".
 *
 * A dimension is only scored when the underlying data exists for that product.
 * If too few dimensions can be scored, no overall score is shown at all
 * (we never invent a number to fill a chart).
 */

import type { Product } from "@/types/product";

export type ScoreDimensionKey =
  | "capacityValue"
  | "outputPerformance"
  | "portability"
  | "chargingSpeed"
  | "expandability";

export interface ScoreDimensionConfig {
  key: ScoreDimensionKey;
  label: string;
  weight: number;
  /** How the raw metric is described to the visitor. */
  basis: string;
}

/**
 * Configurable scoring model.
 *
 * Noise Level and Value for Money are intentionally ABSENT: the catalog carries
 * no noise measurements and no verified prices, so scoring them would require
 * inventing data.
 */
export const SCORE_MODEL: ScoreDimensionConfig[] = [
  {
    key: "capacityValue",
    label: "Capacity",
    weight: 1,
    basis: "Nameplate usable energy (Wh) versus the rest of the catalog.",
  },
  {
    key: "outputPerformance",
    label: "Output Performance",
    weight: 1,
    basis: "Rated continuous watts, with a bonus for verified surge headroom.",
  },
  {
    key: "portability",
    label: "Portability",
    weight: 1,
    basis: "Energy carried per kilogram (Wh/kg); lighter-per-Wh scores higher.",
  },
  {
    key: "chargingSpeed",
    label: "Charging Speed",
    weight: 1,
    basis: "Maximum AC (wall) charging input in watts.",
  },
  {
    key: "expandability",
    label: "Expandability",
    weight: 1,
    basis: "Whether extra battery capacity can be added, and how much.",
  },
];

/** Minimum number of scored dimensions required before we publish an overall score. */
export const MIN_DIMENSIONS_FOR_OVERALL = 3;

export interface DimensionScore {
  key: ScoreDimensionKey;
  label: string;
  basis: string;
  score: number; // 0-100
}

export interface ProductScore {
  productId: string;
  dimensions: DimensionScore[];
  /** null when fewer than MIN_DIMENSIONS_FOR_OVERALL dimensions could be scored. */
  overall: number | null;
  scoredCount: number;
  totalDimensions: number;
  /** Human-readable one-liner for the overall band. */
  band: ScoreBand | null;
}

export type ScoreBand = "Excellent" | "Great" | "Good" | "Fair" | "Limited";

export function scoreBand(overall: number): ScoreBand {
  if (overall >= 85) return "Excellent";
  if (overall >= 70) return "Great";
  if (overall >= 55) return "Good";
  if (overall >= 40) return "Fair";
  return "Limited";
}

interface Range {
  min: number;
  max: number;
}

function rangeOf(values: number[]): Range | null {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length < 2) return null;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (min === max) return null;
  return { min, max };
}

function normalise(value: number, range: Range, invert = false): number {
  const t = (value - range.min) / (range.max - range.min);
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = invert ? 1 - clamped : clamped;
  // Compress into a 30-100 band so the weakest catalog entry is not shown as 0.
  return Math.round(30 + scaled * 70);
}

interface CatalogRanges {
  capacity: Range | null;
  output: Range | null;
  whPerKg: Range | null;
  acCharging: Range | null;
  expandedCapacity: Range | null;
}

export function buildCatalogRanges(catalog: Product[]): CatalogRanges {
  return {
    capacity: rangeOf(catalog.map((p) => p.capacity_wh ?? NaN)),
    output: rangeOf(catalog.map((p) => p.rated_output_w ?? NaN)),
    whPerKg: rangeOf(
      catalog.map((p) =>
        p.capacity_wh != null && p.weight_kg ? p.capacity_wh / p.weight_kg : NaN,
      ),
    ),
    acCharging: rangeOf(catalog.map((p) => p.ac_charging_w ?? NaN)),
    expandedCapacity: rangeOf(
      catalog.map((p) => p.max_expanded_capacity_wh ?? NaN),
    ),
  };
}

export function scoreProduct(product: Product, catalog: Product[]): ProductScore {
  const ranges = buildCatalogRanges(catalog);
  const dimensions: DimensionScore[] = [];

  const push = (key: ScoreDimensionKey, score: number) => {
    const cfg = SCORE_MODEL.find((d) => d.key === key)!;
    dimensions.push({ key, label: cfg.label, basis: cfg.basis, score });
  };

  // Capacity value
  if (product.capacity_wh != null && ranges.capacity) {
    push("capacityValue", normalise(product.capacity_wh, ranges.capacity));
  }

  // Output performance (continuous, with a small verified-surge bonus)
  if (product.rated_output_w != null && ranges.output) {
    let s = normalise(product.rated_output_w, ranges.output);
    if (
      product.surge_output_w != null &&
      product.rated_output_w > 0 &&
      product.surge_output_w / product.rated_output_w >= 1.8
    ) {
      s = Math.min(100, s + 5);
    }
    push("outputPerformance", s);
  }

  // Portability (Wh per kg — higher is better)
  if (product.capacity_wh != null && product.weight_kg && ranges.whPerKg) {
    push(
      "portability",
      normalise(product.capacity_wh / product.weight_kg, ranges.whPerKg),
    );
  }

  // Charging speed (AC input watts)
  if (product.ac_charging_w != null && ranges.acCharging) {
    push("chargingSpeed", normalise(product.ac_charging_w, ranges.acCharging));
  }

  // Expandability. An expandable unit always ranks above a non-expandable one on
  // this dimension, regardless of how modest its expansion ceiling is.
  if (product.expandable != null) {
    if (product.expandable && product.max_expanded_capacity_wh != null && ranges.expandedCapacity) {
      const scaled = normalise(
        product.max_expanded_capacity_wh,
        ranges.expandedCapacity,
      );
      push("expandability", Math.max(55, scaled));
    } else if (product.expandable) {
      push("expandability", 70); // expandable but ceiling unverified
    } else {
      push("expandability", 30); // explicitly not expandable
    }
  }

  const scoredCount = dimensions.length;
  let overall: number | null = null;
  let band: ScoreBand | null = null;

  if (scoredCount >= MIN_DIMENSIONS_FOR_OVERALL) {
    const weightFor = (k: ScoreDimensionKey) =>
      SCORE_MODEL.find((d) => d.key === k)?.weight ?? 1;
    const totalWeight = dimensions.reduce((sum, d) => sum + weightFor(d.key), 0);
    const weighted = dimensions.reduce(
      (sum, d) => sum + d.score * weightFor(d.key),
      0,
    );
    overall = Math.round(weighted / totalWeight);
    band = scoreBand(overall);
  }

  return {
    productId: product.id,
    dimensions,
    overall,
    scoredCount,
    totalDimensions: SCORE_MODEL.length,
    band,
  };
}

export function scoreCatalog(catalog: Product[]): Map<string, ProductScore> {
  return new Map(catalog.map((p) => [p.id, scoreProduct(p, catalog)]));
}
