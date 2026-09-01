import { describe, expect, it } from "vitest";
import { scoreProduct, MIN_DIMENSIONS_FOR_OVERALL } from "@/lib/score";
import { getAllProducts } from "@/data/products";
import { makeProduct } from "./helpers";

const catalog = getAllProducts();

describe("scoreProduct — dimension gating", () => {
  it("never scores Noise Level or Value for Money (no data in the catalog)", () => {
    for (const p of catalog) {
      const s = scoreProduct(p, catalog);
      const keys = s.dimensions.map((d) => d.key);
      expect(keys).not.toContain("noiseLevel");
      expect(keys).not.toContain("valueForMoney");
    }
  });

  it("does not score portability when weight is unknown", () => {
    const p = makeProduct({ id: "no-weight", weight_kg: null });
    const s = scoreProduct(p, [p, ...catalog]);
    expect(s.dimensions.find((d) => d.key === "portability")).toBeUndefined();
  });

  it("withholds an overall score when fewer than the minimum dimensions are scorable", () => {
    const bare = makeProduct({
      id: "bare",
      capacity_wh: 1000,
      rated_output_w: null,
      weight_kg: null,
      ac_charging_w: null,
      expandable: null,
    });
    const s = scoreProduct(bare, [bare, makeProduct({ id: "other" })]);
    expect(s.scoredCount).toBeLessThan(MIN_DIMENSIONS_FOR_OVERALL);
    expect(s.overall).toBeNull();
    expect(s.band).toBeNull();
  });
});

describe("scoreProduct — normalisation", () => {
  it("keeps dimension scores within the 30-100 compressed band", () => {
    for (const p of catalog) {
      for (const d of scoreProduct(p, catalog).dimensions) {
        expect(d.score).toBeGreaterThanOrEqual(30);
        expect(d.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("scores an explicitly non-expandable unit below an expandable one", () => {
    const fixed = makeProduct({ id: "fixed", expandable: false });
    const expandable = makeProduct({
      id: "exp",
      expandable: true,
      max_expanded_capacity_wh: 6000,
    });
    const pool = [fixed, expandable, ...catalog];
    const fixedScore = scoreProduct(fixed, pool).dimensions.find(
      (d) => d.key === "expandability",
    )!.score;
    const expScore = scoreProduct(expandable, pool).dimensions.find(
      (d) => d.key === "expandability",
    )!.score;
    expect(expScore).toBeGreaterThan(fixedScore);
  });

  it("produces a higher overall for a strictly better unit", () => {
    const weak = makeProduct({
      id: "weak",
      capacity_wh: 300,
      rated_output_w: 600,
      weight_kg: 20,
      ac_charging_w: 200,
      expandable: false,
    });
    const strong = makeProduct({
      id: "strong",
      capacity_wh: 4000,
      rated_output_w: 4000,
      weight_kg: 15,
      ac_charging_w: 1800,
      expandable: true,
      max_expanded_capacity_wh: 20000,
    });
    const pool = [weak, strong];
    const ws = scoreProduct(weak, pool).overall ?? 0;
    const ss = scoreProduct(strong, pool).overall ?? 0;
    expect(ss).toBeGreaterThan(ws);
  });
});
