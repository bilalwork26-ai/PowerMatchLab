import { describe, expect, it } from "vitest";
import {
  capacityFitScore,
  capacityFitTier,
  combinedSizeFit,
  outputFitScore,
  outputFitTier,
  CAPACITY_BEST_MAX_RATIO,
  CAPACITY_GOOD_MAX_RATIO,
  OUTPUT_BEST_MAX_RATIO,
  OUTPUT_GOOD_MAX_RATIO,
} from "@/lib/size-fit";

describe("size-fit.ts: capacityFitTier boundaries", () => {
  it("is 'best' at and below the best-max ratio", () => {
    expect(capacityFitTier(1.0)).toBe("best");
    expect(capacityFitTier(1.3)).toBe("best");
    expect(capacityFitTier(CAPACITY_BEST_MAX_RATIO)).toBe("best");
  });

  it("is 'good' strictly above best-max and at/below good-max", () => {
    expect(capacityFitTier(CAPACITY_BEST_MAX_RATIO + 0.01)).toBe("good");
    expect(capacityFitTier(2.5)).toBe("good");
    expect(capacityFitTier(CAPACITY_GOOD_MAX_RATIO)).toBe("good");
  });

  it("is 'oversized' strictly above good-max, with no further upper bound", () => {
    expect(capacityFitTier(CAPACITY_GOOD_MAX_RATIO + 0.01)).toBe("oversized");
    expect(capacityFitTier(10)).toBe("oversized");
    expect(capacityFitTier(1000)).toBe("oversized");
  });

  it("treats a ratio below 1.0 (should not occur for a compatible product) as 'best', not a crash", () => {
    expect(capacityFitTier(0.2)).toBe("best");
  });
});

describe("size-fit.ts: outputFitTier boundaries (deliberately wider than capacity)", () => {
  it("is 'best' at and below the best-max ratio", () => {
    expect(outputFitTier(OUTPUT_BEST_MAX_RATIO)).toBe("best");
  });
  it("is 'good' between best-max and good-max", () => {
    expect(outputFitTier(OUTPUT_BEST_MAX_RATIO + 0.01)).toBe("good");
    expect(outputFitTier(OUTPUT_GOOD_MAX_RATIO)).toBe("good");
  });
  it("is 'oversized' beyond good-max", () => {
    expect(outputFitTier(OUTPUT_GOOD_MAX_RATIO + 0.01)).toBe("oversized");
  });
});

describe("size-fit.ts: combinedSizeFit takes the LESS proportionate of the two dimensions", () => {
  it("both best -> best", () => {
    expect(combinedSizeFit(1.1, 1.5)).toBe("best");
  });
  it("capacity oversized alone drags the combined result to oversized", () => {
    expect(combinedSizeFit(10, 1.1)).toBe("oversized");
  });
  it("output oversized alone drags the combined result to oversized", () => {
    expect(combinedSizeFit(1.1, 100)).toBe("oversized");
  });
  it("capacity good + output best -> good (the worse of the two)", () => {
    expect(combinedSizeFit(2.0, 1.0)).toBe("good");
  });
});

describe("size-fit.ts: fit scores reward proportionality and decay smoothly beyond it", () => {
  it("capacityFitScore is at its maximum (40) throughout the best-fit band", () => {
    expect(capacityFitScore(1.0)).toBe(40);
    expect(capacityFitScore(CAPACITY_BEST_MAX_RATIO)).toBe(40);
  });

  it("capacityFitScore strictly decreases as the ratio grows past the best band", () => {
    const atGoodStart = capacityFitScore(CAPACITY_BEST_MAX_RATIO + 0.01);
    const atGoodEnd = capacityFitScore(CAPACITY_GOOD_MAX_RATIO);
    const wayOversized = capacityFitScore(50);
    expect(atGoodStart).toBeLessThan(40);
    expect(atGoodEnd).toBeLessThan(atGoodStart);
    expect(wayOversized).toBeLessThan(atGoodEnd);
  });

  it("capacityFitScore never goes negative, however extreme the ratio", () => {
    expect(capacityFitScore(1000)).toBeGreaterThanOrEqual(0);
    expect(capacityFitScore(Number.MAX_SAFE_INTEGER)).toBeGreaterThanOrEqual(0);
  });

  it("within the oversized tier, a LESS oversized product still scores higher than a MORE oversized one", () => {
    // This is the exact mechanism that keeps a 3,000 Wh unit ranked above a
    // 6,000 Wh unit for the same small requirement, even though both are
    // labeled "Oversized".
    const lessOversized = capacityFitScore(4.0);
    const moreOversized = capacityFitScore(15.0);
    expect(lessOversized).toBeGreaterThan(moreOversized);
  });

  it("outputFitScore mirrors the same shape on its own (wider) scale", () => {
    expect(outputFitScore(1.0)).toBe(25);
    expect(outputFitScore(OUTPUT_BEST_MAX_RATIO)).toBe(25);
    expect(outputFitScore(OUTPUT_GOOD_MAX_RATIO + 5)).toBeLessThan(outputFitScore(OUTPUT_GOOD_MAX_RATIO));
    expect(outputFitScore(10000)).toBeGreaterThanOrEqual(0);
  });

  it("handles NaN/Infinity ratios without producing NaN/Infinity scores", () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      expect(Number.isFinite(capacityFitScore(bad))).toBe(true);
      expect(Number.isFinite(outputFitScore(bad))).toBe(true);
    }
  });
});
