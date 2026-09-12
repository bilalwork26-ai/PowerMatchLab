/**
 * Sizing-fit classification: how proportionate a product's capacity and
 * continuous output are relative to what the visitor actually needs,
 * INDEPENDENT of whether it clears the hard pass/fail bar at all (that is
 * `meetsCapacity`/`meetsContinuous` in recommend.ts — a separate concern).
 *
 * Merely clearing the minimum bar does not make a product a good
 * recommendation. A 6,000 Wh station "passes" a 395 Wh CPAP requirement,
 * but presenting it as a top result buries genuinely well-matched, more
 * proportionate options under enormous overkill — the exact bug this
 * module exists to fix. It replaces an implicit `>= 1` comparison that
 * previously had no upper bound at all.
 *
 * ## Why these specific multiples
 *
 * `recommendedMinimumCapacityWh` (the capacity denominator used below)
 * already bakes in a reserve fraction — 20% by default — on top of the
 * raw energy requirement, so a ratio of 1.0 already represents a station
 * sized WITH headroom, not a bare minimum. Building on that:
 *
 * - 1.0x-1.5x the recommended minimum: "best". Up to 50% beyond an
 *   already-reserved target is a normal buying margin — rounding up to
 *   the next available SKU, or minor future growth.
 * - 1.5x-3.0x: "good". Meaningfully more headroom than needed — could be
 *   justified by expansion plans or an occasional second load — but no
 *   longer the tightest match.
 * - beyond 3.0x: "oversized". More than three times an already-reserved
 *   target is disproportionate for the stated need, even though the unit
 *   is fully capable of running it.
 *
 * Continuous output gets a deliberately MUCH WIDER band than capacity, for
 * a concrete reason: capacity correlates roughly linearly with a station's
 * cell count, weight, and footprint, so "extra capacity" has a real
 * carrying cost. Rated output is a fixed inverter spec that comes bundled
 * with whatever capacity tier a station belongs to — even a modest-
 * capacity unit commonly ships with an inverter rated several times past a
 * small continuous load (a CPAP's 35-80W, a single fridge's 100-200W), and
 * that bundling is normal catalog reality, not a shopper overspending.
 * Penalizing it the way capacity excess is penalized would misclassify
 * ordinary, well-fitted products as "oversized" for output alone — this
 * was confirmed empirically: a synthetic 2,400W-rated unit answering a
 * 300W need is unremarkable, not a red flag. The bands are therefore
 * 1.0x-8.0x ("best"), 8.0x-20.0x ("good"), beyond 20.0x ("oversized") —
 * anchored at the bare `requiredContinuousOutputW` (no reserve concept is
 * currently modeled for power the way there is for energy). Output is
 * still a real, if rare, signal: it exists to catch a genuinely extreme
 * mismatch (e.g. a multi-kW inverter for a single-digit-watt load), not to
 * second-guess normal inverter sizing. Capacity remains the dominant axis
 * for the "oversized" classification in practice, since `combinedSizeFit`
 * takes the less-proportionate of the two dimensions.
 *
 * These thresholds are deliberately round, stated numbers rather than a
 * fitted model — there is no authoritative external standard for "how
 * much extra power-station capacity is too much." PowerMatchLab states
 * its own reasoning here instead of pretending otherwise, and this is the
 * ONLY place in the codebase that defines them — every calculator reuses
 * this module rather than re-deriving its own thresholds.
 */

export type SizeFitTier = "best" | "good" | "oversized";

export const CAPACITY_BEST_MAX_RATIO = 1.5;
export const CAPACITY_GOOD_MAX_RATIO = 3.0;
export const OUTPUT_BEST_MAX_RATIO = 8.0;
export const OUTPUT_GOOD_MAX_RATIO = 20.0;

export const SIZE_FIT_TIER_RANK: Record<SizeFitTier, number> = {
  best: 0,
  good: 1,
  oversized: 2,
};

function tierFor(ratio: number, bestMax: number, goodMax: number): SizeFitTier {
  if (!Number.isFinite(ratio) || ratio <= bestMax) return "best";
  if (ratio <= goodMax) return "good";
  return "oversized";
}

/**
 * Classifies a capacity ratio (considered capacity ÷ recommended minimum
 * capacity) into a fit tier. Callers should only invoke this once the
 * capacity requirement is actually met (ratio >= 1) — this function judges
 * proportionality above that bar, it does not decide pass/fail itself.
 */
export function capacityFitTier(capacityRatio: number): SizeFitTier {
  return tierFor(capacityRatio, CAPACITY_BEST_MAX_RATIO, CAPACITY_GOOD_MAX_RATIO);
}

/** Classifies an output ratio (rated output ÷ required continuous output). */
export function outputFitTier(outputRatio: number): SizeFitTier {
  return tierFor(outputRatio, OUTPUT_BEST_MAX_RATIO, OUTPUT_GOOD_MAX_RATIO);
}

/**
 * Combined tier across both dimensions: the LEAST proportionate of the two
 * wins, since a product that is wildly oversized on either capacity or
 * output alone is still an oversized recommendation overall.
 */
export function combinedSizeFit(capacityRatio: number, outputRatio: number): SizeFitTier {
  const capTier = capacityFitTier(capacityRatio);
  const outTier = outputFitTier(outputRatio);
  return SIZE_FIT_TIER_RANK[capTier] >= SIZE_FIT_TIER_RANK[outTier] ? capTier : outTier;
}

/**
 * 0-40 score rewarding closeness to the capacity "best fit" band, decaying
 * smoothly beyond it so that within the "oversized" tier itself, the LEAST
 * oversized product still ranks above the most oversized one rather than
 * all oversized products scoring identically.
 */
export function capacityFitScore(capacityRatio: number): number {
  if (!Number.isFinite(capacityRatio) || capacityRatio <= CAPACITY_BEST_MAX_RATIO) return 40;
  if (capacityRatio <= CAPACITY_GOOD_MAX_RATIO) {
    const span = CAPACITY_GOOD_MAX_RATIO - CAPACITY_BEST_MAX_RATIO;
    return 40 - ((capacityRatio - CAPACITY_BEST_MAX_RATIO) / span) * 15; // 40 -> 25
  }
  return Math.max(0, 25 - (capacityRatio - CAPACITY_GOOD_MAX_RATIO) * 2);
}

/** Same idea as {@link capacityFitScore}, scaled 0-25 to match output's smaller weight in the overall fit score. */
export function outputFitScore(outputRatio: number): number {
  if (!Number.isFinite(outputRatio) || outputRatio <= OUTPUT_BEST_MAX_RATIO) return 25;
  if (outputRatio <= OUTPUT_GOOD_MAX_RATIO) {
    const span = OUTPUT_GOOD_MAX_RATIO - OUTPUT_BEST_MAX_RATIO;
    return 25 - ((outputRatio - OUTPUT_BEST_MAX_RATIO) / span) * 10; // 25 -> 15
  }
  return Math.max(0, 15 - (outputRatio - OUTPUT_GOOD_MAX_RATIO) * 1);
}
