/**
 * Regression tests for an independent code review of PR #44 (the
 * Refrigerator Backup Runtime Index). Four real issues were found and fixed:
 *
 * 1. The daily-energy entry mode could be fed an ANNUAL kWh/year figure
 *    (what a US EnergyGuide label actually shows) as if it were daily,
 *    producing an absurd ~365x overstatement — fixed by adding a distinct
 *    "kWh/year" unit that divides by 365 (see dailyEnergyUnitToWh). A
 *    related state bug let a mode switch show a blank field while the
 *    engine kept using a hidden, un-displayed watts/hoursPerDay pair.
 * 2. The panel-spec solar estimator produced ONE daily-Wh figure applied
 *    uniformly to every product, regardless of each product's own,
 *    possibly much smaller, solar_input_w charging limit — fixed by
 *    capping the estimate per product (estimateProductDailySolarWh) and by
 *    excluding that uncapped global figure from classification.
 * 3. calculatePower's MIN_DAYS floor let 0/negative/NaN/Infinite duration
 *    silently size for ONE HOUR instead of the engine's original safe
 *    default of one day — fixed with sanitizeAutonomyDays, which still
 *    clamps a genuinely short but POSITIVE duration up to MIN_DAYS.
 * 4. PrintSummary received `new Date()` computed directly during a
 *    Server/Client-shared component's render, which could hydration-
 *    mismatch (and print the wrong date) on a statically-generated page —
 *    fixed by resolving it client-side in a useEffect.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { calculatePower, MIN_DAYS, sanitizeAutonomyDays, type DeviceInput } from "@/lib/calculator";
import {
  dailyEnergyUnitToWh,
  estimateProductDailySolarWh,
  estimateDailySolarWh,
  applySolarOffset,
  withSolarAdjustedCapacity,
} from "@/lib/tools-engine";
import { buildRuntimeIndexCsv } from "@/lib/csv-export";
import { recommendProducts } from "@/lib/recommend";
import type { Product } from "@/types/product";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}
const srcFiles = walk(SRC_DIR);
const srcContents = new Map(srcFiles.map((f) => [f, readFileSync(f, "utf8")]));
function read(rel: string): string {
  return srcContents.get(join(ROOT, rel))!;
}

function baseDevice(overrides: Partial<DeviceInput> = {}): DeviceInput {
  return {
    id: "d1",
    name: "Household refrigerator",
    watts: 150,
    quantity: 1,
    hoursPerDay: 8,
    surgeWatts: 600,
    simultaneous: true,
    ...overrides,
  };
}

function baseProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "test-product",
    brand: "TestBrand",
    model: "Test Model",
    market: "US",
    category: "portable-power-station",
    capacity_wh: 1000,
    rated_output_w: 1000,
    surge_output_w: 2000,
    battery_chemistry: "LiFePO4",
    cycle_life: null,
    weight_kg: 12,
    dimensions: null,
    solar_input_w: null,
    ac_charging_w: null,
    charging_time: null,
    ac_outlets: null,
    usb_c: null,
    usb_a: null,
    dc_output: null,
    rv_tt30: null,
    voltage_240v: null,
    ups_ms: null,
    expandable: null,
    max_expanded_capacity_wh: null,
    wifi: null,
    bluetooth: null,
    warranty: null,
    idle_consumption_w: null,
    best_for: [],
    pros: [],
    cons: [],
    official_source: null,
    last_verified: "2026-01-01",
    amazon_asin: null,
    amazon_product_url: null,
    amazon_affiliate_url: null,
    amazon_verification_status: "confirmed",
    amazon_listing_note: null,
    ...overrides,
  };
}

function csvMeta(result: ReturnType<typeof calculatePower>) {
  return {
    toolTitle: "Refrigerator & Freezer Runtime Calculator",
    generatedAtIso: "2026-01-01T00:00:00.000Z",
    siteUrl: "https://www.powermatchlab.com/tools/refrigerator-runtime-calculator",
    formulaText: "test formula",
    dailyEnergyWh: result.dailyEnergyWh,
    recommendedCapacityWh: result.recommendedMinimumCapacityWh,
    requiredContinuousOutputW: result.requiredContinuousOutputW,
    requiredSurgeOutputW: result.requiredSurgeOutputW,
    days: 1,
    efficiencyPct: 85,
    reservePct: 20,
    autonomyUnitPlural: "days",
  };
}

// ---------------------------------------------------------------------------
// Issue 1: EnergyGuide annual kWh vs. daily kWh/Wh confusion
// ---------------------------------------------------------------------------
describe("dailyEnergyUnitToWh: EnergyGuide annual kWh/year is never treated as a daily figure", () => {
  it("438 kWh/year converts to exactly 1200 Wh/day", () => {
    expect(dailyEnergyUnitToWh(438, "kWhYear")).toBeCloseTo(1200, 6);
  });

  it("converts correctly between all three supported units", () => {
    expect(dailyEnergyUnitToWh(1200, "Wh")).toBe(1200);
    expect(dailyEnergyUnitToWh(1.2, "kWh")).toBe(1200);
    expect(dailyEnergyUnitToWh(438, "kWhYear")).toBeCloseTo(1200, 6);
  });

  it("a kWh/year figure is NOT the same as an equal-valued kWh/day figure — the two units must diverge by ~365x", () => {
    const asAnnual = dailyEnergyUnitToWh(438, "kWhYear");
    const asDaily = dailyEnergyUnitToWh(438, "kWh");
    expect(asDaily / asAnnual).toBeCloseTo(365, 0);
  });

  it("zero, negative, NaN and infinite input all yield 0 Wh/day, for every unit, never NaN or a negative value", () => {
    for (const unit of ["Wh", "kWh", "kWhYear"] as const) {
      for (const bad of [0, -100, NaN, Infinity, -Infinity]) {
        const wh = dailyEnergyUnitToWh(bad, unit);
        expect(Number.isFinite(wh)).toBe(true);
        expect(wh).toBe(0);
      }
    }
  });

  it("an extremely large but finite kWh/year figure still produces a finite Wh/day result", () => {
    expect(Number.isFinite(dailyEnergyUnitToWh(1e9, "kWhYear"))).toBe(true);
  });

  it("the unit dropdown offers Wh/day, kWh/day AND kWh/year, with EnergyGuide called out for the annual option", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain('<option value="Wh">Wh/day</option>');
    expect(src).toContain('<option value="kWh">kWh/day</option>');
    expect(src).toContain('<option value="kWhYear">kWh/year (EnergyGuide label)</option>');
  });

  it("the daily-energy mode explains that a US EnergyGuide label shows ANNUAL consumption, not daily", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src.toLowerCase()).toContain("states annual");
    expect(src).toContain("kWh/year");
  });
});

describe("Mode-switch state bug: the daily-energy field never shows blank while a hidden value still drives the calculation", () => {
  it("LoadListCalculator derives a fallback display value from the row's live watts x hoursPerDay when no explicit daily-energy entry exists yet", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("rowDailyWh");
    expect(src).toContain("formatDailyWhForUnit(rowDailyWh(row)");
  });

  it("switching only the unit dropdown re-expresses the same underlying value rather than reinterpreting the same digits under a new unit", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("changeDailyEnergyUnit");
    expect(src).toContain("onChange={(e) => changeDailyEnergyUnit(row, e.target.value as DailyEnergyUnit)}");
  });

  it("changeDailyEnergyUnit's own conversion math: 1200 Wh -> kWh shows 1.2, not 1200", () => {
    // Exercises the exact function body pattern used by changeDailyEnergyUnit
    // (dailyEnergyUnitToWh to normalize, then re-express in the new unit) —
    // a full component render isn't available in this test environment
    // (no @testing-library/react dependency; see the sibling test files'
    // source-scanning convention), so the conversion itself is verified here
    // as a pure function and the wiring is verified by source above.
    const currentDailyWh = dailyEnergyUnitToWh(1200, "Wh");
    expect(currentDailyWh).toBe(1200);
    const asKwh = Math.round((currentDailyWh / 1000) * 100) / 100;
    expect(asKwh).toBe(1.2);
  });
});

describe("Print/CSV report shows the original entered unit and figure alongside the derived daily Wh (daily-energy mode)", () => {
  it("PrintSummary's inputsSummary line includes both the original unit+figure and the derived Wh/day value", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("entered as ${dailyEntry.raw} ${unitLabel} → ${rowDailyWh(d).toLocaleString(\"en-US\")} Wh/day derived");
  });
});

// ---------------------------------------------------------------------------
// Issue 2: per-product solar capping (a shared panel spec is not a shared
// daily contribution — every product's own solar_input_w limits it)
// ---------------------------------------------------------------------------
describe("estimateProductDailySolarWh: a panel-spec estimate is capped to EACH product's own solar input rating", () => {
  it("a 1,000 W panel charges a 100 W-input station at only 100 W-equivalent, and a 1,000 W-input station at the full 1,000 W", () => {
    const smallPort = estimateProductDailySolarWh({
      panelWatts: 1000,
      peakSunHours: 5,
      realizationFraction: 0.7,
      productSolarInputW: 100,
    });
    const bigPort = estimateProductDailySolarWh({
      panelWatts: 1000,
      peakSunHours: 5,
      realizationFraction: 0.7,
      productSolarInputW: 1000,
    });
    expect(smallPort).toBeCloseTo(100 * 5 * 0.7, 6);
    expect(bigPort).toBeCloseTo(1000 * 5 * 0.7, 6);
    expect(bigPort).toBeGreaterThan(smallPort! * 5);
  });

  it("a panel SMALLER than the product's own rating is not artificially capped down further — the panel itself is the limit", () => {
    const result = estimateProductDailySolarWh({
      panelWatts: 200,
      peakSunHours: 5,
      realizationFraction: 0.7,
      productSolarInputW: 1000,
    });
    expect(result).toBeCloseTo(200 * 5 * 0.7, 6);
  });

  it("an unverified solar_input_w (null) returns null — it is NEVER assumed to accept the full panel wattage", () => {
    expect(
      estimateProductDailySolarWh({
        panelWatts: 1000,
        peakSunHours: 5,
        realizationFraction: 0.7,
        productSolarInputW: null,
      }),
    ).toBeNull();
  });

  it("matches estimateDailySolarWh exactly once capped to the smaller of panel watts and the product's rating", () => {
    const capped = estimateProductDailySolarWh({
      panelWatts: 500,
      peakSunHours: 4,
      realizationFraction: 0.65,
      productSolarInputW: 300,
    });
    const direct = estimateDailySolarWh({ panelWatts: 300, peakSunHours: 4, realizationFraction: 0.65 });
    expect(capped).toBeCloseTo(direct, 6);
  });

  it("500 W panel against a 200 W-input, 500 W-input, and 1,000 W-input product each produce a different, correctly-capped daily figure", () => {
    const at200 = estimateProductDailySolarWh({ panelWatts: 500, peakSunHours: 5, realizationFraction: 0.7, productSolarInputW: 200 });
    const at500 = estimateProductDailySolarWh({ panelWatts: 500, peakSunHours: 5, realizationFraction: 0.7, productSolarInputW: 500 });
    const at1000 = estimateProductDailySolarWh({ panelWatts: 500, peakSunHours: 5, realizationFraction: 0.7, productSolarInputW: 1000 });
    expect(at200).toBeCloseTo(200 * 5 * 0.7, 6);
    expect(at500).toBeCloseTo(500 * 5 * 0.7, 6);
    expect(at1000).toBeCloseTo(500 * 5 * 0.7, 6); // capped by the 500 W panel itself, not the 1,000 W port
    expect(at500).toBe(at1000);
    expect(at200).toBeLessThan(at500!);
  });

  it("zero solar (no panel wattage) yields zero for any product, verified or not", () => {
    expect(estimateProductDailySolarWh({ panelWatts: 0, peakSunHours: 5, realizationFraction: 0.7, productSolarInputW: 200 })).toBe(0);
  });
});

describe("Per-product solar results reach the Runtime Index table and CSV — never one global figure for every product", () => {
  it("LoadListCalculator computes autonomyByProductId per product via estimateProductDailySolarWh when the panel-spec estimator was used", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain('solarSource === "panel-spec"');
    expect(src).toContain("estimateProductDailySolarWh({");
    expect(src).toContain("productSolarInputW: rec.product.solar_input_w");
  });

  it("RuntimeIndexTable and csv-export accept a solarCoveredProductIds set and show an honest message instead of a bare not-verified fallback", () => {
    const table = read("src/components/tools/RuntimeIndexTable.tsx");
    const csv = read("src/lib/csv-export.ts");
    expect(table).toContain("solarCoveredProductIds");
    expect(table).toContain("SOLAR_MAY_COVER_LOAD_MESSAGE");
    expect(csv).toContain("solarCoveredProductIds");
    expect(csv).toContain("SOLAR_MAY_COVER_LOAD_MESSAGE");
  });

  it("buildRuntimeIndexCsv shows the honest solar-covers-load message for a product in the set, and Not verified for one that isn't", () => {
    const result = calculatePower([baseDevice()], { days: 1 });
    const covered = baseProduct({ id: "covered" });
    const notCovered = baseProduct({ id: "not-covered", model: "Other Model" });
    const recs = recommendProducts(result, [covered, notCovered]);
    const csv = buildRuntimeIndexCsv(
      recs,
      new Map([
        ["covered", null],
        ["not-covered", null],
      ]),
      csvMeta(result),
      new Set(["covered"]),
    );
    const coveredLine = csv.split("\r\n").find((l) => l.includes(covered.model))!;
    const notCoveredLine = csv.split("\r\n").find((l) => l.includes(notCovered.model))!;
    expect(coveredLine).toContain("Estimated solar production may cover the stated daily load");
    expect(notCoveredLine).toContain("Not verified");
    expect(notCoveredLine).not.toContain("may cover the stated daily load");
  });

  it("buildRuntimeIndexCsv defaults to an empty solarCoveredProductIds set when the argument is omitted — existing callers/tests are unaffected", () => {
    const result = calculatePower([baseDevice()], { days: 1 });
    const p = baseProduct();
    const recs = recommendProducts(result, [p]);
    expect(() => buildRuntimeIndexCsv(recs, new Map([[p.id, null]]), csvMeta(result))).not.toThrow();
  });
});

describe("Solar credit NEVER changes product classification — battery-only, always, for every solar source (2nd review round)", () => {
  it("real computation: recommendProducts on the raw result vs. on a hypothetically solar-adjusted one gives DIFFERENT classifications — proving solar credit really would move products between statuses if it were ever applied", () => {
    // This demonstrates the bug this fix prevents: if the component DID feed
    // a solar-adjusted result into recommendProducts (which it no longer
    // does — see the source-scan tests below), a product that hard-fails
    // capacity battery-only could flip to a compatible status purely from
    // an unverifiable, non-product-specific solar figure.
    const device = baseDevice({ watts: 200, hoursPerDay: 10, surgeWatts: null }); // 2000 Wh/day
    const result = calculatePower([device], { days: 1 }); // requiredUsableCapacityWh ~2353 Wh at default 85% efficiency
    const solarAdjusted = withSolarAdjustedCapacity(result, applySolarOffset(result, 500, 1)); // 500 Wh/day solar credit
    // 2000 Wh is below the battery-only requirement but above the
    // solar-adjusted one — chosen deliberately to straddle both.
    const product = baseProduct({ id: "borderline", capacity_wh: 2000, rated_output_w: 250 });

    const batteryOnlyRec = recommendProducts(result, [product])[0];
    const wouldBeSolarAdjustedRec = recommendProducts(solarAdjusted, [product])[0];
    expect(batteryOnlyRec.status).toBe("Not Suitable");
    expect(wouldBeSolarAdjustedRec.status).not.toBe("Not Suitable");
    expect(batteryOnlyRec.status).not.toBe(wouldBeSolarAdjustedRec.status);
  });

  it("recommendProducts is called with the plain battery-only `result` — never a solar-adjusted one — as the ONLY call site in LoadListCalculator.tsx", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    const calls = [...src.matchAll(/recommendProducts\(([a-zA-Z]+),/g)].map((m) => m[1]);
    expect(calls.length).toBeGreaterThan(0);
    for (const arg of calls) {
      expect(arg).toBe("result");
    }
  });

  it("withSolarAdjustedCapacity and the old solarForGlobalUse/effectiveResult indirection no longer exist anywhere in LoadListCalculator.tsx", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).not.toContain("withSolarAdjustedCapacity");
    expect(src).not.toContain("solarForGlobalUse");
    expect(src).not.toContain("effectiveResult");
  });

  it("a manually-typed solar figure resets solarSource back to \"manual\" (still tracked for the Runtime Index table's per-product display, though it no longer has any bearing on classification)", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toMatch(/setDailySolarWh\(Math\.max\(0, Number\(e\.target\.value\) \|\| 0\)\);\s*setSolarSource\("manual"\);/);
  });

  it("the manual solar-entry field discloses that its single figure is applied uniformly and may not transfer to a different station's port", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src.toLowerCase()).toContain("applied the same way to every product below");
  });

  it("the manual-solar info callout explicitly states classification and per-product autonomy are unaffected, and points to the panel-spec estimator for a per-product comparison", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("This manual solar figure is shown only as an aggregate");
    expect(src.replace(/\s+/g, " ").toLowerCase()).toContain("use the panel-spec estimator above instead");
  });

  it("the panel-spec info callout explicitly states the capacity and classification are calculated without solar credit", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("the capacity and\n                classification above are calculated WITHOUT solar credit");
  });

  it("the panel-spec estimator's own explanatory copy distinguishes panel wattage, the station's own solar input rating, estimated production, and remaining deficit", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("panel&rsquo;s nameplate wattage");
    expect(src).toContain("solar input\n                rating");
  });

  it("the headline capacity label discloses \"battery only, no solar credit\" whenever a nonzero solar figure is present", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("Recommended minimum capacity (battery only, no solar credit)");
  });

  it("formulaText never subtracts a solar term — it must always match the battery-only headline number exactly", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).not.toMatch(/formulaText = `[^`]*solar/);
  });
});

describe("Manual solar never applies a per-product 'covers the load' claim — only the panel-spec path can honestly make a per-product claim", () => {
  it("real computation: solarCoveredProductIds-equivalent logic only ever adds a product when its OWN capped solar contribution is computed — a manual/global fullyOffsetBySolar flag is a different, aggregate-only concept", () => {
    const result = calculatePower([baseDevice({ watts: 50, hoursPerDay: 2 })], { days: 1 }); // 100 Wh/day
    const solar = applySolarOffset(result, 500, 1);
    expect(solar.fullyOffsetBySolar).toBe(true); // the aggregate fact still exists...
    // ...but per-product coverage must come only from a per-product capped
    // calculation, never from this aggregate flag:
    const perProductCoverage = estimateProductDailySolarWh({
      panelWatts: 0, // no panel spec in the manual scenario
      peakSunHours: 0,
      realizationFraction: 0,
      productSolarInputW: 200,
    });
    expect(perProductCoverage).toBe(0); // never inherits the aggregate "fully offset" fact
  });

  it("LoadListCalculator's solarCoveredProductIds is gated on solarSource === \"panel-spec\" and never reads solar.fullyOffsetBySolar", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).not.toContain("solar?.fullyOffsetBySolar");
    expect(src).not.toContain("Manual/global figure fully covers the load");
    expect(src).toMatch(/solarCoveredProductIds = useMemo\(\(\) => \{\s*const covered = new Set<string>\(\);\s*if \(!solarEnabled \|\| dailySolarWh <= 0 \|\| solarSource !== "panel-spec"\) return covered;/);
  });
});

// ---------------------------------------------------------------------------
// Issue 3: invalid duration must fall back to 1 DAY, never silently to 1 hour
// ---------------------------------------------------------------------------
describe("sanitizeAutonomyDays: invalid input falls back to a full day, valid short input floors at one hour", () => {
  it("6 hours (0.25 days) is accepted exactly, not rounded to a full day", () => {
    expect(sanitizeAutonomyDays(6 / 24)).toBeCloseTo(0.25, 10);
  });

  it("exactly one hour equals MIN_DAYS", () => {
    expect(sanitizeAutonomyDays(1 / 24)).toBeCloseTo(MIN_DAYS, 10);
  });

  it("a positive value under one hour is floored UP to MIN_DAYS (one hour), not rejected as invalid", () => {
    expect(sanitizeAutonomyDays(0.0001)).toBeCloseTo(MIN_DAYS, 10);
    expect(sanitizeAutonomyDays(0.0001)).not.toBeCloseTo(1, 1);
  });

  it("zero, negative, NaN and Infinity all fall back to ONE FULL DAY — never to MIN_DAYS (one hour)", () => {
    for (const bad of [0, -1, -100, NaN, Infinity, -Infinity]) {
      const days = sanitizeAutonomyDays(bad);
      expect(days).toBe(1);
      expect(days).not.toBeCloseTo(MIN_DAYS, 5);
    }
  });

  it("a value above the 30-day ceiling is clamped down to 30, not rejected", () => {
    expect(sanitizeAutonomyDays(100)).toBe(30);
  });

  it("calculatePower uses this exact fallback: an invalid days input sizes for a full day's energy, not one hour's", () => {
    const device = baseDevice({ watts: 100, hoursPerDay: 10, surgeWatts: null }); // 1000 Wh/day
    const invalidDaysResult = calculatePower([device], { days: 0 });
    const oneDayResult = calculatePower([device], { days: 1 });
    const oneHourResult = calculatePower([device], { days: 1 / 24 });
    expect(invalidDaysResult.totalEnergyDemandWh).toBe(oneDayResult.totalEnergyDemandWh);
    expect(invalidDaysResult.totalEnergyDemandWh).not.toBe(oneHourResult.totalEnergyDemandWh);
    expect(invalidDaysResult.totalEnergyDemandWh).toBeGreaterThan(oneHourResult.totalEnergyDemandWh * 20);
  });

  it("applySolarOffset (tools-engine.ts) reuses sanitizeAutonomyDays rather than its own duplicate day-clamping logic", () => {
    const src = read("src/lib/tools-engine.ts");
    expect(src).toContain("sanitizeAutonomyDays(days)");
    expect(src).not.toMatch(/function sanitizeDays/);
  });

  it("the shareable-URL codec's day field also falls back to 1 (not MIN_DAYS) for an invalid or non-positive value", () => {
    const src = read("src/lib/tools-share-state.ts");
    expect(src).toContain("sanitizeAutonomyDays(Number(rawDays))");
  });
});

describe("RV, Home Backup, CPAP, Starlink and Power Setup Studio call the exact same calculatePower — the MIN_DAYS fix cannot behave differently per tool", () => {
  it("only one implementation of calculatePower exists sitewide, and it is the one just verified above", () => {
    const impls = srcFiles.filter((f) => /export function calculatePower\(/.test(srcContents.get(f)!));
    expect(impls).toEqual([join(SRC_DIR, "lib/calculator.ts")]);
  });

  it("none of the other tool/calculator components redefine their own day-sanitizing logic", () => {
    for (const file of [
      "src/components/tools/LoadListCalculator.tsx",
      "src/components/tools/CpapCalculator.tsx",
      "src/components/tools/StarlinkCalculator.tsx",
    ]) {
      const src = read(file);
      expect(src, `${file} must not redefine its own day clamp`).not.toMatch(/function sanitizeDays/);
      expect(src, `${file} must not redefine its own day clamp`).not.toMatch(/function sanitizeAutonomyDays/);
    }
  });
});

// ---------------------------------------------------------------------------
// Issue 4: PrintSummary's generated date must never be computed inline
// during a render that runs on both server and client (hydration mismatch
// risk on a statically-generated page, and prints the wrong/build date).
// ---------------------------------------------------------------------------
describe("PrintSummary's generatedAt date is resolved client-side only, avoiding a hydration mismatch", () => {
  it("PrintSummary's generatedAt prop accepts Date | null, and renders a safe placeholder before it resolves", () => {
    const src = read("src/components/tools/PrintSummary.tsx");
    expect(src).toContain("generatedAt: Date | null");
    expect(src).toContain('generatedAt\n          ? generatedAt.toLocaleDateString');
  });

  it("LoadListCalculator never passes a freshly-constructed Date directly as the generatedAt prop", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).not.toContain("generatedAt={new Date()}");
    expect(src).toContain("generatedAt={generatedAt}");
  });

  it("LoadListCalculator resolves generatedAt in a useEffect (client-only, post-mount), not during the render body", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("const [generatedAt, setGeneratedAt] = useState<Date | null>(null);");
    expect(src).toMatch(/useEffect\(\(\) => \{\s*setGeneratedAt\(new Date\(\)\);\s*\}, \[\]\);/);
  });

  it("the CSV download's own generatedAtIso timestamp is computed inside the click handler, not during render — a different, already-safe pattern (never runs during SSR/hydration)", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("generatedAtIso: new Date().toISOString()");
    // Confirm it's inside handleCsvDownload, not the top-level render body.
    const handlerStart = src.indexOf("const handleCsvDownload = () => {");
    const isoCallIndex = src.indexOf("generatedAtIso: new Date().toISOString()");
    const handlerEnd = src.indexOf("\n  };", handlerStart);
    expect(isoCallIndex).toBeGreaterThan(handlerStart);
    expect(isoCallIndex).toBeLessThan(handlerEnd);
  });
});
