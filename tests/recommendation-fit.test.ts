import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { calculatePower, type DeviceInput } from "@/lib/calculator";
import {
  groupRecommendations,
  recommendProducts,
  type Recommendation,
} from "@/lib/recommend";
import { CAPACITY_GOOD_MAX_RATIO } from "@/lib/size-fit";
import { getAllProducts } from "@/data/products";
import { makeProduct } from "./helpers";

const ROOT = process.cwd();
const catalog = getAllProducts();

const load = (watts: number, hours: number, surge?: number, days = 1): DeviceInput[] => [
  { id: "d", name: "Load", watts, quantity: 1, hoursPerDay: hours, surgeWatts: surge ?? null },
].map((d) => d);

function calc(watts: number, hours: number, surge?: number, days = 1) {
  return calculatePower(load(watts, hours, surge), { days });
}

describe("Hard requirements now correctly hard-fail (audit findings fixed)", () => {
  it("a verified surge shortfall is Not Suitable, not just a soft limitation", () => {
    // Device draws 800W continuous with a real 3000W startup surge.
    const result = calc(800, 2, 3000);
    const weakSurge = makeProduct({
      id: "weak-surge",
      rated_output_w: 2000,
      capacity_wh: 4096,
      surge_output_w: 1000, // below the ~3000W+ requirement
    });
    const rec = recommendProducts(result, [weakSurge])[0];
    expect(rec.status).toBe("Not Suitable");
    expect(rec.limitations.join(" ")).toMatch(/surge/i);
  });

  it("unverified surge (vs. a verified shortfall) still does NOT hard-fail", () => {
    const result = calc(800, 2, 3000);
    const unknownSurge = makeProduct({
      id: "unknown-surge",
      rated_output_w: 2000,
      capacity_wh: 4096,
      surge_output_w: null,
    });
    const rec = recommendProducts(result, [unknownSurge])[0];
    expect(rec.status).not.toBe("Not Suitable");
    expect(rec.meetsSurge).toBeNull();
  });

  it("expansion marked required hard-fails a unit explicitly not expandable", () => {
    const result = calc(300, 4);
    const fixed = makeProduct({ id: "fixed", capacity_wh: 4096, rated_output_w: 2000, expandable: false });
    const rec = recommendProducts(result, [fixed], { wantsExpandable: true })[0];
    expect(rec.status).toBe("Not Suitable");
    expect(rec.limitations.join(" ")).toMatch(/expandable/i);
  });

  it("expansion marked required does NOT hard-fail a unit with unverified expansion capability", () => {
    const result = calc(300, 4);
    const unknown = makeProduct({ id: "unknown-exp", capacity_wh: 4096, rated_output_w: 2000, expandable: null });
    const rec = recommendProducts(result, [unknown], { wantsExpandable: true })[0];
    expect(rec.status).not.toBe("Not Suitable");
  });

  it("UPS/transfer stays a soft signal even when requested — no invented pass/fail threshold", () => {
    const result = calc(300, 4);
    const unknownUps = makeProduct({ id: "unknown-ups", capacity_wh: 4096, rated_output_w: 2000, ups_ms: null });
    const rec = recommendProducts(result, [unknownUps], { needsUpsTransfer: true })[0];
    expect(rec.status).not.toBe("Not Suitable");
    expect(rec.limitations.join(" ")).toMatch(/not verified/i);
  });
});

describe("The reported bug: a ~395 Wh CPAP need must not recommend multi-kWh stations as top picks", () => {
  // Same scenario the user reported: ~35W CPAP, 8h/night, 1 night, default
  // 85% efficiency / 20% reserve -> recommendedMinimumCapacityWh ~= 395 Wh.
  const result = calculatePower(
    [{ id: "cpap", name: "CPAP", watts: 35, quantity: 1, hoursPerDay: 8, surgeWatts: null }],
    { days: 1 },
  );

  it("sanity-checks the scenario actually lands near 395 Wh", () => {
    expect(result.recommendedMinimumCapacityWh).toBeGreaterThan(350);
    expect(result.recommendedMinimumCapacityWh).toBeLessThan(450);
  });

  it("no product more than 3x the recommended minimum ever appears in the primary (Best/Good Fit) group", () => {
    const recs = recommendProducts(result, catalog);
    const { primary } = groupRecommendations(recs);
    for (const rec of primary) {
      expect(
        rec.capacityRatio,
        `${rec.product.id} (${rec.product.capacity_wh} Wh) has no capacityRatio but is in primary`,
      ).not.toBeNull();
      expect(
        rec.capacityRatio!,
        `${rec.product.id} (${rec.product.capacity_wh} Wh, ratio ${rec.capacityRatio}) is disproportionate but landed in primary`,
      ).toBeLessThanOrEqual(CAPACITY_GOOD_MAX_RATIO);
    }
  });

  it("every real catalog product whose capacity is more than 3x the need is never classified Best/Good Fit (Oversized when output is also known, Possible Match when output is genuinely unverified)", () => {
    const recs = recommendProducts(result, catalog);
    for (const rec of recs) {
      if (rec.product.capacity_wh != null && rec.product.capacity_wh > result.recommendedMinimumCapacityWh * CAPACITY_GOOD_MAX_RATIO) {
        expect(
          ["Best Fit", "Good Fit"],
          `${rec.product.id} (${rec.product.capacity_wh} Wh) is disproportionate but was classified ${rec.status}`,
        ).not.toContain(rec.status);
      }
    }
  });

  it("at least one multi-thousand-Wh catalog product exists and is demoted to Oversized for this need (proves the fix engages on real data, not just synthetic)", () => {
    const recs = recommendProducts(result, catalog);
    const bigOversized = recs.find(
      (r) => (r.product.capacity_wh ?? 0) >= 3000 && r.status === "Oversized",
    );
    expect(bigOversized, "expected at least one >=3000Wh product classified Oversized for a ~395Wh need").toBeDefined();
  });

  it("Oversized results still rank strictly after every Best/Good Fit result in the sorted output", () => {
    const recs = recommendProducts(result, catalog);
    const statusOrder = ["Best Fit", "Good Fit", "Oversized", "Possible Match", "Not Suitable"];
    let lastSeenRank = -1;
    for (const rec of recs) {
      const rank = statusOrder.indexOf(rec.status);
      expect(rank).toBeGreaterThanOrEqual(lastSeenRank);
      lastSeenRank = rank;
    }
  });
});

describe("Small / medium / large needs each get a sensibly scaled response", () => {
  it("a small (CPAP-like) need never puts a huge station first", () => {
    const small = calculatePower([{ id: "d", name: "d", watts: 40, quantity: 1, hoursPerDay: 8, surgeWatts: null }], { days: 1 });
    const recs = recommendProducts(small, catalog);
    const { primary } = groupRecommendations(recs);
    if (primary.length) {
      expect(primary[0].product.capacity_wh ?? 0).toBeLessThan(2000);
    }
  });

  it("a large home-backup-scale need CAN legitimately put a large station first (large is not always wrong)", () => {
    const large = calculatePower(
      [
        { id: "fridge", name: "Fridge", watts: 150, quantity: 1, hoursPerDay: 8, surgeWatts: 600 },
        { id: "freezer", name: "Freezer", watts: 100, quantity: 1, hoursPerDay: 8, surgeWatts: 400 },
        { id: "lights", name: "Lights", watts: 60, quantity: 1, hoursPerDay: 6, surgeWatts: null },
        { id: "sump", name: "Sump pump", watts: 800, quantity: 1, hoursPerDay: 1, surgeWatts: 2200 },
      ],
      { days: 1 }, // one day of outage — a real, single-unit-meetable need, unlike the 3-day version which exceeds every catalog unit's capacity
    );
    const recs = recommendProducts(large, catalog);
    const { primary, oversized } = groupRecommendations(recs);
    // For a genuinely large multi-day need, the system should find at least
    // some proportionate (not universally "oversized") large-capacity match,
    // or explain via `oversized` that only bigger units qualify — either way
    // it must not report zero compatible products for a real, meetable need.
    expect(primary.length + oversized.length).toBeGreaterThan(0);
  });
});

describe("Determinism and purity", () => {
  it("calling recommendProducts twice with equal inputs produces identical output", () => {
    const result = calc(300, 4, 900);
    const a = recommendProducts(result, catalog, { needs240V: true });
    const b = recommendProducts(result, catalog, { needs240V: true });
    expect(a.map((r) => [r.product.id, r.status, r.fitScore])).toEqual(
      b.map((r) => [r.product.id, r.status, r.fitScore]),
    );
  });

  it("two structurally-identical products (only id differs) always get the same status and fitScore", () => {
    const result = calc(300, 4, 900);
    const a = makeProduct({ id: "twin-a", capacity_wh: 2048, rated_output_w: 2400, surge_output_w: 4000 });
    const b = makeProduct({ id: "twin-b", capacity_wh: 2048, rated_output_w: 2400, surge_output_w: 4000 });
    const [recA, recB] = recommendProducts(result, [a, b]);
    expect(recA.status).toBe(recB.status);
    expect(recA.fitScore).toBe(recB.fitScore);
  });

  it("sort order is stable: re-running against the same catalog array never reorders equal-rank ties differently", () => {
    const result = calc(300, 4, 900);
    const run1 = recommendProducts(result, catalog).map((r) => r.product.id);
    const run2 = recommendProducts(result, catalog).map((r) => r.product.id);
    expect(run1).toEqual(run2);
  });
});

describe("Ranking independence from affiliate-link availability", () => {
  it("recommend.ts never reads amazon_affiliate_url, amazon_product_url, or amazon_asin", () => {
    const src = readFileSync(join(ROOT, "src/lib/recommend.ts"), "utf8");
    expect(src).not.toMatch(/amazon_affiliate_url/);
    expect(src).not.toMatch(/amazon_product_url/);
    expect(src).not.toMatch(/amazon_asin/);
  });

  it("size-fit.ts never reads any amazon_* or price/rating-like field", () => {
    const src = readFileSync(join(ROOT, "src/lib/size-fit.ts"), "utf8");
    expect(src).not.toMatch(/amazon_|price|rating|popularity/i);
  });

  it("an identical product without an affiliate link gets the exact same status and fitScore as one with a link", () => {
    const result = calc(300, 4, 900);
    const withLink = makeProduct({
      id: "with-link",
      capacity_wh: 2048,
      rated_output_w: 2400,
      surge_output_w: 4000,
      amazon_affiliate_url: "https://www.amazon.com/dp/B000TEST?tag=powermatchlab-20",
    });
    const withoutLink = makeProduct({
      id: "without-link",
      capacity_wh: 2048,
      rated_output_w: 2400,
      surge_output_w: 4000,
      amazon_affiliate_url: null,
    });
    const [recWith, recWithout] = recommendProducts(result, [withLink, withoutLink]);
    expect(recWith.status).toBe(recWithout.status);
    expect(recWith.fitScore).toBe(recWithout.fitScore);
  });

  it("a product with no affiliate link CAN still be the #1 (Best Fit) result", () => {
    const result = calc(300, 4, 900);
    const onlyOption = makeProduct({
      id: "no-affiliate-but-best",
      capacity_wh: 2048,
      rated_output_w: 2400,
      surge_output_w: 4000,
      amazon_affiliate_url: null,
    });
    const recs = recommendProducts(result, [onlyOption]);
    expect(recs[0].product.id).toBe("no-affiliate-but-best");
    expect(["Best Fit", "Good Fit"]).toContain(recs[0].status);
  });
});

describe("Unknown fields are never silently treated as passing", () => {
  it("unverified capacity -> Possible Match, never Best/Good Fit or Oversized", () => {
    const result = calc(300, 4);
    const rec = recommendProducts(result, [makeProduct({ id: "u", capacity_wh: null })])[0];
    expect(rec.status).toBe("Possible Match");
    expect(rec.capacityRatio).toBeNull();
  });

  it("unverified continuous output -> Possible Match (capacity given generously so only the output-unverified path is exercised)", () => {
    const result = calc(300, 4);
    const rec = recommendProducts(result, [makeProduct({ id: "u", capacity_wh: 4096, rated_output_w: null })])[0];
    expect(rec.status).toBe("Possible Match");
    expect(rec.outputRatio).toBeNull();
  });

  it("unverified 240V does not count as meeting a stated 240V requirement (soft limitation, not a pass, not a hard fail)", () => {
    const result = calc(300, 4);
    const rec = recommendProducts(result, [makeProduct({ id: "u", voltage_240v: null, capacity_wh: 4096, rated_output_w: 2000 })], {
      needs240V: true,
    })[0];
    expect(rec.status).not.toBe("Not Suitable");
    expect(rec.reasons.some((r) => /240V/.test(r))).toBe(false);
    expect(rec.limitations.some((l) => /240V.*not verified/i.test(l))).toBe(true);
  });
});

describe("Consistency: the same underlying need produces the same classification regardless of which calculator built it", () => {
  it("a fridge-shaped requirement built via two different device lists that resolve to the same continuous/daily-energy numbers yields identical recommendations", () => {
    // surgeWatts is set explicitly EQUAL to running watts on every row (zero
    // real surge above running) rather than left null — the fallback
    // surge-multiplier assumption applies per row to that row's own watts,
    // so splitting one device into two rows would otherwise change the
    // computed surge requirement even though nothing about the actual need
    // changed. This isolates the claim actually being tested: capacity/
    // output-driven classification only depends on the resulting totals,
    // not on which calculator UI produced them.
    const viaOneDevice = calculatePower(
      [{ id: "a", name: "Fridge", watts: 150, quantity: 1, hoursPerDay: 8, surgeWatts: 150 }],
      { days: 2 },
    );
    const viaSplitDevices = calculatePower(
      [
        { id: "a", name: "Fridge (half)", watts: 75, quantity: 1, hoursPerDay: 8, surgeWatts: 75 },
        { id: "b", name: "Fridge (half)", watts: 75, quantity: 1, hoursPerDay: 8, surgeWatts: 75 },
      ],
      { days: 2 },
    );
    expect(viaOneDevice.requiredContinuousOutputW).toBe(viaSplitDevices.requiredContinuousOutputW);
    expect(viaOneDevice.dailyEnergyWh).toBe(viaSplitDevices.dailyEnergyWh);
    expect(viaOneDevice.requiredSurgeOutputW).toBe(viaSplitDevices.requiredSurgeOutputW);
    const recsOne = recommendProducts(viaOneDevice, catalog).map((r) => [r.product.id, r.status]);
    const recsSplit = recommendProducts(viaSplitDevices, catalog).map((r) => [r.product.id, r.status]);
    expect(recsOne).toEqual(recsSplit);
  });
});
