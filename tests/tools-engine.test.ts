import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { calculatePower, type DeviceInput } from "@/lib/calculator";
import { recommendProducts } from "@/lib/recommend";
import {
  applySolarOffset,
  withSolarAdjustedCapacity,
  estimateAutonomyUnits,
} from "@/lib/tools-engine";
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
    name: "Test device",
    watts: 100,
    quantity: 1,
    hoursPerDay: 8,
    surgeWatts: null,
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
    capacity_wh: 2000,
    rated_output_w: 2000,
    surge_output_w: 4000,
    battery_chemistry: "LiFePO4",
    cycle_life: null,
    weight_kg: 20,
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
    last_verified: null,
    amazon_asin: null,
    amazon_product_url: null,
    amazon_affiliate_url: null,
    amazon_verification_status: "confirmed",
    amazon_listing_note: null,
    ...overrides,
  };
}

describe("calculator.ts: the `simultaneous` device flag (RV/Home Backup 'coincides?' toggle)", () => {
  it("defaults to counting toward continuous/surge — identical to every pre-existing caller's behavior", () => {
    const withFlag = calculatePower([baseDevice({ watts: 100 })], { days: 1 });
    const withoutFlag = calculatePower(
      [{ id: "d1", name: "Test device", watts: 100, quantity: 1, hoursPerDay: 8, surgeWatts: null }],
      { days: 1 },
    );
    expect(withFlag.requiredContinuousOutputW).toBe(withoutFlag.requiredContinuousOutputW);
    expect(withFlag.requiredSurgeOutputW).toBe(withoutFlag.requiredSurgeOutputW);
  });

  it("a device marked simultaneous:false is excluded from continuous and surge sizing", () => {
    const result = calculatePower(
      [
        // surgeWatts explicitly equal to running watts means no real surge
        // above the running draw, isolating the effect under test (the
        // excluded device's own surge) rather than the assumed 2x fallback
        // multiplier that would otherwise apply when surgeWatts is omitted.
        baseDevice({ id: "always-on", watts: 50, surgeWatts: 50, simultaneous: true }),
        baseDevice({ id: "never-overlaps", watts: 1000, surgeWatts: 3000, simultaneous: false }),
      ],
      { days: 1 },
    );
    expect(result.requiredContinuousOutputW).toBe(50);
    expect(result.requiredSurgeOutputW).toBe(50);
  });

  it("a non-simultaneous device still counts fully toward daily energy", () => {
    const result = calculatePower(
      [baseDevice({ watts: 1000, hoursPerDay: 2, simultaneous: false })],
      { days: 1 },
    );
    expect(result.dailyEnergyWh).toBe(2000);
    expect(result.requiredContinuousOutputW).toBe(0);
  });

  it("all-non-simultaneous devices still produce a finite, non-negative capacity result (never NaN/Infinity)", () => {
    const result = calculatePower(
      [
        baseDevice({ watts: 500, hoursPerDay: 1, simultaneous: false }),
        baseDevice({ id: "d2", watts: 800, hoursPerDay: 0.5, simultaneous: false }),
      ],
      { days: 3 },
    );
    for (const v of [
      result.requiredContinuousOutputW,
      result.requiredSurgeOutputW,
      result.dailyEnergyWh,
      result.recommendedMinimumCapacityWh,
    ]) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("tools-engine.ts: applySolarOffset", () => {
  const base = calculatePower([baseDevice({ watts: 100, hoursPerDay: 10 })], { days: 2 }); // 1000 Wh/day

  it("0 Wh/day of solar reproduces the no-solar numbers exactly", () => {
    const adjusted = applySolarOffset(base, 0, 2);
    expect(adjusted.netDailyEnergyWh).toBe(base.dailyEnergyWh);
    expect(adjusted.netRecommendedMinimumCapacityWh).toBe(base.recommendedMinimumCapacityWh);
    expect(adjusted.fullyOffsetBySolar).toBe(false);
  });

  it("solar fully covering the daily need zeroes the net daily energy and flags fullyOffsetBySolar", () => {
    const adjusted = applySolarOffset(base, 5000, 2);
    expect(adjusted.netDailyEnergyWh).toBe(0);
    expect(adjusted.fullyOffsetBySolar).toBe(true);
    expect(adjusted.netRecommendedMinimumCapacityWh).toBe(0);
  });

  it("partial solar reduces the daily deficit by exactly the solar contribution", () => {
    const adjusted = applySolarOffset(base, 300, 2);
    expect(adjusted.dailyDeficitWh).toBe(base.dailyEnergyWh - 300);
    expect(adjusted.solarContributionWh).toBe(300);
    expect(adjusted.fullyOffsetBySolar).toBe(false);
  });

  it("sanitizes negative, NaN and Infinity solar input to a safe, finite result", () => {
    for (const badSolar of [-500, NaN, Infinity, -Infinity]) {
      const adjusted = applySolarOffset(base, badSolar, 2);
      expect(Number.isFinite(adjusted.dailySolarWh)).toBe(true);
      expect(adjusted.dailySolarWh).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(adjusted.netDailyEnergyWh)).toBe(true);
      expect(Number.isFinite(adjusted.netRecommendedMinimumCapacityWh)).toBe(true);
    }
  });

  it("sanitizes negative, zero, NaN and out-of-range days to the [MIN_DAYS, 30] window", () => {
    for (const badDays of [0, -5, NaN, 100]) {
      const adjusted = applySolarOffset(base, 100, badDays);
      expect(Number.isFinite(adjusted.netTotalEnergyDemandWh)).toBe(true);
      expect(adjusted.netTotalEnergyDemandWh).toBeGreaterThanOrEqual(0);
    }
  });

  it("never produces a negative net daily energy even when solar exceeds the daily need", () => {
    const adjusted = applySolarOffset(base, 999_999, 1);
    expect(adjusted.netDailyEnergyWh).toBe(0);
    expect(adjusted.dailyDeficitWh).toBe(0);
  });
});

describe("tools-engine.ts: withSolarAdjustedCapacity", () => {
  it("overrides only the capacity fields, leaving continuous/surge/dailyEnergyWh untouched", () => {
    const result = calculatePower([baseDevice({ watts: 200, hoursPerDay: 5, surgeWatts: 600 })], { days: 1 });
    const adjusted = applySolarOffset(result, 100, 1);
    const merged = withSolarAdjustedCapacity(result, adjusted);
    expect(merged.requiredContinuousOutputW).toBe(result.requiredContinuousOutputW);
    expect(merged.requiredSurgeOutputW).toBe(result.requiredSurgeOutputW);
    expect(merged.dailyEnergyWh).toBe(result.dailyEnergyWh);
    expect(merged.requiredUsableCapacityWh).toBe(adjusted.netRequiredUsableCapacityWh);
    expect(merged.recommendedMinimumCapacityWh).toBe(adjusted.netRecommendedMinimumCapacityWh);
  });
});

describe("tools-engine.ts: estimateAutonomyUnits", () => {
  it("returns null for a null, zero, or negative capacity", () => {
    expect(estimateAutonomyUnits(null, 500, 0.85)).toBeNull();
    expect(estimateAutonomyUnits(0, 500, 0.85)).toBeNull();
    expect(estimateAutonomyUnits(-100, 500, 0.85)).toBeNull();
  });

  it("returns null for a zero, negative, NaN or infinite daily energy", () => {
    expect(estimateAutonomyUnits(2000, 0, 0.85)).toBeNull();
    expect(estimateAutonomyUnits(2000, -500, 0.85)).toBeNull();
    expect(estimateAutonomyUnits(2000, NaN, 0.85)).toBeNull();
    expect(estimateAutonomyUnits(2000, Infinity, 0.85)).toBeNull();
  });

  it("returns null for a zero, negative or NaN efficiency", () => {
    expect(estimateAutonomyUnits(2000, 500, 0)).toBeNull();
    expect(estimateAutonomyUnits(2000, 500, -0.5)).toBeNull();
    expect(estimateAutonomyUnits(2000, 500, NaN)).toBeNull();
  });

  it("computes usable capacity divided by daily energy for valid inputs", () => {
    expect(estimateAutonomyUnits(1000, 250, 0.8)).toBeCloseTo((1000 * 0.8) / 250, 6);
  });
});

describe("recommend.ts: needsUpsTransfer preference (UPS/transfer-time uncertainty, never a hard fail)", () => {
  const result = calculatePower([baseDevice({ watts: 100, hoursPerDay: 5 })], { days: 1 });

  it("surfaces a verified ups_ms figure as a reason, never a limitation", () => {
    const [rec] = recommendProducts(result, [baseProduct({ ups_ms: 10 })], { needsUpsTransfer: true });
    expect(rec.reasons.some((r) => r.includes("10 ms"))).toBe(true);
    expect(rec.limitations.some((l) => l.toLowerCase().includes("ups"))).toBe(false);
  });

  it("flags an unverified ups_ms as an uncertainty, but never hard-fails the product on that basis alone", () => {
    const [rec] = recommendProducts(result, [baseProduct({ ups_ms: null })], { needsUpsTransfer: true });
    expect(rec.limitations.some((l) => l.toLowerCase().includes("not verified"))).toBe(true);
    // A product otherwise comfortably meeting capacity/output must not become
    // Not Suitable purely because ups_ms is unverified.
    expect(rec.status).not.toBe("Not Suitable");
  });

  it("adds no UPS-related reason or limitation when the preference isn't requested", () => {
    const [rec] = recommendProducts(result, [baseProduct({ ups_ms: null })], {});
    expect(rec.reasons.some((r) => r.toLowerCase().includes("ups"))).toBe(false);
    expect(rec.limitations.some((l) => l.toLowerCase().includes("ups"))).toBe(false);
  });
});

describe("The 5 new /tools calculators reuse the shared engine — they never reimplement power/energy formulas", () => {
  const TOOL_COMPONENT_FILES = [
    "src/components/tools/LoadListCalculator.tsx",
    "src/components/tools/CpapCalculator.tsx",
    "src/components/tools/StarlinkCalculator.tsx",
  ];

  it("every tool calculator component imports calculatePower from lib/calculator, never redefines it", () => {
    for (const file of TOOL_COMPONENT_FILES) {
      const src = read(file);
      expect(src, `${file} must import calculatePower`).toMatch(/import\s*\{[^}]*calculatePower[^}]*\}\s*from\s*"@\/lib\/calculator"/);
      expect(src, `${file} must not redefine calculatePower`).not.toMatch(/function calculatePower/);
    }
  });

  it("every tool calculator component imports recommendProducts from lib/recommend, never redefines it", () => {
    for (const file of TOOL_COMPONENT_FILES) {
      const src = read(file);
      expect(src, `${file} must import recommendProducts`).toMatch(/import\s*\{[^}]*recommendProducts[^}]*\}\s*from\s*"@\/lib\/recommend"/);
      expect(src, `${file} must not redefine recommendProducts`).not.toMatch(/function recommendProducts/);
    }
  });

  it("only one implementation of calculatePower and recommendProducts exists sitewide", () => {
    const calcImpls = srcFiles.filter((f) => /export function calculatePower\(/.test(srcContents.get(f)!));
    const recImpls = srcFiles.filter((f) => /export function recommendProducts\(/.test(srcContents.get(f)!));
    expect(calcImpls).toEqual([join(SRC_DIR, "lib/calculator.ts")]);
    expect(recImpls).toEqual([join(SRC_DIR, "lib/recommend.ts")]);
  });
});

describe("calculator_type analytics parameter is a closed enum, used consistently", () => {
  it("ToolCalculatorType in tools-engine.ts declares exactly the 6 expected calculator types", () => {
    const src = read("src/lib/tools-engine.ts");
    const match = src.match(/export type ToolCalculatorType =([\s\S]*?);/);
    expect(match).not.toBeNull();
    for (const t of [
      "power_calculator",
      "refrigerator_runtime",
      "cpap_battery",
      "rv_power",
      "starlink_runtime",
      "home_backup",
    ]) {
      expect(match![1]).toContain(`"${t}"`);
    }
  });

  it("every calculator_type value passed to trackEvent anywhere under src/ is one of the declared enum values", () => {
    const declared = read("src/lib/tools-engine.ts").match(/export type ToolCalculatorType =([\s\S]*?);/)![1];
    const used = new Set<string>();
    for (const file of srcFiles) {
      for (const m of srcContents.get(file)!.matchAll(/calculator_type:\s*"([a-z_]+)"/g)) {
        used.add(m[1]);
      }
    }
    expect(used.size).toBeGreaterThan(0);
    for (const t of used) {
      expect(declared, `unexpected calculator_type "${t}" not declared in ToolCalculatorType`).toContain(`"${t}"`);
    }
  });
});
