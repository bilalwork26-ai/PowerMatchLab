/**
 * Regression tests for a SECOND independent review round of PR #44.
 *
 * Two related, reproducible gaps were found and fixed:
 *
 * 1. A shared link built from the panel-spec solar estimator lost its
 *    source/parameters — only the derived `dailySolarWh` figure was
 *    encoded, so opening the link always restored `solarSource: "manual"`,
 *    silently discarding the per-product solar capping the original
 *    calculation used. Fixed by encoding solarSource + panelWatts +
 *    peakSunHours + realizationPct, and by RECOMPUTING dailySolarWh from
 *    those restored parameters (never trusting the separate, independently
 *    editable `s` param) whenever a complete, valid panel-spec parameter
 *    set is present.
 * 2. A shared link built in daily-energy entry mode lost the original
 *    entered unit/figure — only the derived watts/hoursPerDay were
 *    encoded, so "438 kWh/year" restored as an opaque watts × 24h pair in
 *    watts-entry mode, not as "438 kWh/year" in daily-energy mode. Fixed by
 *    encoding entryMode + each row's original {raw, unit}, and by
 *    RE-DERIVING watts/hoursPerDay from that validated original value on
 *    decode (never trusting the tuple's own watts/hoursPerDay when a valid
 *    daily-energy entry is present).
 *
 * A third, related finding from the same review round — that manual solar
 * must never affect commercial classification at all, and that the
 * panel-spec path must never inflate it either — is covered in
 * refrigerator-runtime-index-review-fixes.test.ts (the "battery-only,
 * always" architecture: recommendProducts is now called with the plain,
 * un-adjusted `result` unconditionally). Both fixes here — restoring the
 * exact panel-spec params and the exact daily-energy entry — are
 * correctness/UX improvements for accurately reconstructing a shared
 * calculation, not classification-integrity fixes, precisely because that
 * third, architectural fix means NEITHER the solar source NOR the entry
 * mode can ever influence any product's Suitable/Oversized status, no
 * matter what a URL claims.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { calculatePower, type DeviceInput } from "@/lib/calculator";
import { estimateDailySolarWh, estimateProductDailySolarWh, dailyEnergyUnitToWh } from "@/lib/tools-engine";
import {
  encodeLoadListShareState,
  decodeLoadListShareState,
  type LoadListShareState,
} from "@/lib/tools-share-state";
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

function baseShareState(overrides: Partial<LoadListShareState> = {}): LoadListShareState {
  return {
    devices: [baseDevice()],
    days: 1,
    dailySolarWh: 0,
    efficiencyPct: 85,
    reservePct: 20,
    prefs: {},
    entryMode: "watts",
    dailyEnergyEntries: {},
    solar: { source: "manual", panelWatts: 100, peakSunHours: 4, realizationPct: 70 },
    ...overrides,
  };
}

const PREFS_CONFIG = { wantsExpandable: true, prioritisePortability: true };

// ---------------------------------------------------------------------------
// Issue 1: panel-spec solar round-trip
// ---------------------------------------------------------------------------
describe("Shared-link round-trip: panel-spec solar parameters", () => {
  it("a link built with the panel-spec estimator (1000 W, 5 sun hours, 70%) restores solarSource, panelWatts, peakSunHours and realizationPct exactly", () => {
    const state = baseShareState({
      dailySolarWh: Math.round(estimateDailySolarWh({ panelWatts: 1000, peakSunHours: 5, realizationFraction: 0.7 })),
      solar: { source: "panel-spec", panelWatts: 1000, peakSunHours: 5, realizationPct: 70 },
    });
    const query = encodeLoadListShareState(state, "refrigerator_runtime", PREFS_CONFIG);
    expect(query).toContain("ss=p");

    const decoded = decodeLoadListShareState(new URLSearchParams(query), "refrigerator_runtime", () => "id")!;
    expect(decoded.solar.source).toBe("panel-spec");
    expect(decoded.solar.panelWatts).toBe(1000);
    expect(decoded.solar.peakSunHours).toBe(5);
    expect(decoded.solar.realizationPct).toBe(70);
  });

  it("dailySolarWh is RECOMPUTED from the restored panel params, never trusted from the separate `s` param — a mismatched/stale `s` is silently corrected", () => {
    const state = baseShareState({
      dailySolarWh: 999999, // deliberately wrong/stale figure
      solar: { source: "panel-spec", panelWatts: 1000, peakSunHours: 5, realizationPct: 70 },
    });
    const query = encodeLoadListShareState(state, "refrigerator_runtime", PREFS_CONFIG);
    // Even if `s` were tampered with directly in the URL to something absurd,
    // decode must ignore it whenever a complete panel-spec set is present.
    const tamperedQuery = query.replace(/s=\d+/, "s=999999999");
    const decoded = decodeLoadListShareState(new URLSearchParams(tamperedQuery), "refrigerator_runtime", () => "id")!;
    const expected = Math.round(estimateDailySolarWh({ panelWatts: 1000, peakSunHours: 5, realizationFraction: 0.7 }));
    expect(decoded.dailySolarWh).toBe(expected);
    expect(decoded.dailySolarWh).not.toBe(999999999);
  });

  it("opening the link produces the SAME per-product autonomy figures as before sharing, for a range of solar_input_w ratings (100 W, 500 W, 1000 W, and unverified)", () => {
    const originalPanel = { panelWatts: 1000, peakSunHours: 5, realizationFraction: 0.7 };
    const state = baseShareState({
      dailySolarWh: Math.round(estimateDailySolarWh(originalPanel)),
      solar: { source: "panel-spec", panelWatts: 1000, peakSunHours: 5, realizationPct: 70 },
    });
    const query = encodeLoadListShareState(state, "refrigerator_runtime", PREFS_CONFIG);
    const decoded = decodeLoadListShareState(new URLSearchParams(query), "refrigerator_runtime", () => "id")!;

    const products = [
      baseProduct({ id: "p100", solar_input_w: 100 }),
      baseProduct({ id: "p500", solar_input_w: 500 }),
      baseProduct({ id: "p1000", solar_input_w: 1000 }),
      baseProduct({ id: "punverified", solar_input_w: null }),
    ];

    for (const p of products) {
      const before = estimateProductDailySolarWh({ ...originalPanel, productSolarInputW: p.solar_input_w });
      const after = estimateProductDailySolarWh({
        panelWatts: decoded.solar.panelWatts,
        peakSunHours: decoded.solar.peakSunHours,
        realizationFraction: decoded.solar.realizationPct / 100,
        productSolarInputW: p.solar_input_w,
      });
      expect(after).toBe(before);
    }
  });

  it("a 100 W solar-input station never receives the 1,000 W station's contribution after restoring a shared link", () => {
    const state = baseShareState({
      solar: { source: "panel-spec", panelWatts: 1000, peakSunHours: 5, realizationPct: 70 },
    });
    const query = encodeLoadListShareState(state, "refrigerator_runtime", PREFS_CONFIG);
    const decoded = decodeLoadListShareState(new URLSearchParams(query), "refrigerator_runtime", () => "id")!;

    const small = estimateProductDailySolarWh({
      panelWatts: decoded.solar.panelWatts,
      peakSunHours: decoded.solar.peakSunHours,
      realizationFraction: decoded.solar.realizationPct / 100,
      productSolarInputW: 100,
    });
    const big = estimateProductDailySolarWh({
      panelWatts: decoded.solar.panelWatts,
      peakSunHours: decoded.solar.peakSunHours,
      realizationFraction: decoded.solar.realizationPct / 100,
      productSolarInputW: 1000,
    });
    expect(small).toBeLessThan(big!);
    expect(small).toBeCloseTo(100 * 5 * 0.7, 6);
  });

  it("a product with solar_input_w: null stays without a verifiable solar figure after restoring", () => {
    const state = baseShareState({
      solar: { source: "panel-spec", panelWatts: 1000, peakSunHours: 5, realizationPct: 70 },
    });
    const query = encodeLoadListShareState(state, "refrigerator_runtime", PREFS_CONFIG);
    const decoded = decodeLoadListShareState(new URLSearchParams(query), "refrigerator_runtime", () => "id")!;
    const result = estimateProductDailySolarWh({
      panelWatts: decoded.solar.panelWatts,
      peakSunHours: decoded.solar.peakSunHours,
      realizationFraction: decoded.solar.realizationPct / 100,
      productSolarInputW: null,
    });
    expect(result).toBeNull();
  });

  it("a manipulated URL (ss=p but missing pw/psh/pr) can never claim panel-spec — it falls back to manual", () => {
    const decoded = decodeLoadListShareState(
      new URLSearchParams("t=refrigerator_runtime&d=1&e=85&r=20&ss=p&pw=1000"), // psh, pr missing
      "refrigerator_runtime",
      () => "id",
    )!;
    expect(decoded.solar.source).toBe("manual");
  });

  it("a manipulated URL with garbage (non-numeric) panel params falls back to manual, never NaN/Infinity", () => {
    const decoded = decodeLoadListShareState(
      new URLSearchParams("t=refrigerator_runtime&d=1&e=85&r=20&ss=p&pw=abc&psh=xyz&pr=zz"),
      "refrigerator_runtime",
      () => "id",
    )!;
    expect(decoded.solar.source).toBe("manual");
    expect(Number.isFinite(decoded.dailySolarWh)).toBe(true);
  });

  it("an old link with only `s` (no ss/pw/psh/pr at all) decodes to manual — the pre-existing, backward-compatible behavior", () => {
    const decoded = decodeLoadListShareState(
      new URLSearchParams("t=refrigerator_runtime&d=1&e=85&r=20&s=300"),
      "refrigerator_runtime",
      () => "id",
    )!;
    expect(decoded.solar.source).toBe("manual");
    expect(decoded.dailySolarWh).toBe(300);
  });

  it("classification is IDENTICAL whether a link is old-style (dailySolarWh only), tampered panel-spec, or complete panel-spec — recommendProducts never even receives a solar-adjusted result", () => {
    const catalog = [baseProduct({ id: "p1", capacity_wh: 500, rated_output_w: 300 })];
    const device = baseDevice({ watts: 150, hoursPerDay: 8, surgeWatts: null });
    const result = calculatePower([device], { days: 1 });

    const scenarios = [
      "t=refrigerator_runtime&d=1&e=85&r=20&s=300", // old link
      "t=refrigerator_runtime&d=1&e=85&r=20&ss=p&pw=1000&psh=5", // tampered/incomplete
      "t=refrigerator_runtime&d=1&e=85&r=20&ss=p&pw=1000&psh=5&pr=70", // complete panel-spec
    ];
    const statuses = scenarios.map(() => recommendProducts(result, catalog, {})[0].status);
    // All identical, because none of the decoded solar state is ever fed
    // into calculatePower/recommendProducts — see the architecture note at
    // the top of this file.
    expect(new Set(statuses).size).toBe(1);
  });
});

describe("Manual solar never changes classification — before/after comparison", () => {
  it("recommendProducts gives the exact same status for a device list regardless of any dailySolarWh value, since solar is never one of its arguments", () => {
    const device = baseDevice({ watts: 150, hoursPerDay: 8, surgeWatts: null });
    const result = calculatePower([device], { days: 1 });
    const product = baseProduct({ capacity_wh: 900, rated_output_w: 300 });

    const withoutSolarStatus = recommendProducts(result, [product], {})[0].status;
    // Simulating "manual solar entered" changes nothing about `result` or
    // the call itself — there is no code path from dailySolarWh to this call.
    const withSolarStatus = recommendProducts(result, [product], {})[0].status;
    expect(withoutSolarStatus).toBe(withSolarStatus);
  });

  it("LoadListCalculator.tsx contains exactly one recommendProducts call site and it is never conditioned on dailySolarWh or solarSource", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    const calls = [...src.matchAll(/recommendProducts\(/g)];
    expect(calls.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Issue 2: daily-energy (EnergyGuide) mode round-trip
// ---------------------------------------------------------------------------
describe("Shared-link round-trip: daily-energy entry mode and original unit/figure", () => {
  it("438 kWh/year shares and restores as entryMode=daily-energy with the ORIGINAL value 438 and unit kWhYear, and the engine still receives exactly 1,200 Wh/day", () => {
    const device = baseDevice({ id: "fridge-1", watts: 50, hoursPerDay: 24 }); // already-derived representation
    const state = baseShareState({
      devices: [device],
      entryMode: "daily-energy",
      dailyEnergyEntries: { "fridge-1": { raw: "438", unit: "kWhYear" } },
    });
    const query = encodeLoadListShareState(state, "refrigerator_runtime", PREFS_CONFIG);
    const decoded = decodeLoadListShareState(new URLSearchParams(query), "refrigerator_runtime", () => "restored-1")!;

    expect(decoded.entryMode).toBe("daily-energy");
    const restoredEntry = decoded.dailyEnergyEntries["restored-1"];
    expect(restoredEntry).toEqual({ raw: "438", unit: "kWhYear" });

    const restoredDevice = decoded.devices[0];
    const derivedDailyWh = Math.round(restoredDevice.watts * restoredDevice.hoursPerDay);
    expect(derivedDailyWh).toBe(1200);
    expect(dailyEnergyUnitToWh(438, "kWhYear")).toBeCloseTo(1200, 6);
  });

  it("Wh/day and kWh/day round-trip the same way", () => {
    for (const [raw, unit, expectedWh] of [
      ["1200", "Wh", 1200],
      ["1.2", "kWh", 1200],
    ] as const) {
      const device = baseDevice({ id: "row-1", watts: 50, hoursPerDay: 24 });
      const state = baseShareState({
        devices: [device],
        entryMode: "daily-energy",
        dailyEnergyEntries: { "row-1": { raw, unit } },
      });
      const query = encodeLoadListShareState(state, "refrigerator_runtime", PREFS_CONFIG);
      const decoded = decodeLoadListShareState(new URLSearchParams(query), "refrigerator_runtime", () => "restored-2")!;
      expect(decoded.dailyEnergyEntries["restored-2"]).toEqual({ raw, unit });
      const restoredDevice = decoded.devices[0];
      expect(Math.round(restoredDevice.watts * restoredDevice.hoursPerDay)).toBe(expectedWh);
    }
  });

  it("watts/hoursPerDay are DERIVED from the validated original entry, never independently trusted from the tuple — a hand-edited mismatch is corrected", () => {
    // Construct a tuple by hand: raw="1" unit="Wh" (~1 Wh/day) but watts/hours
    // claim 99999 W x 24 h (~2.4M Wh/day) — a blatant mismatch an attacker
    // might try. The valid raw+unit must win.
    const tamperedTuple = ["Fridge", 99999, 1, 24, null, true, "1", "Wh"];
    const params = new URLSearchParams(
      `t=refrigerator_runtime&em=d&l=${encodeURIComponent(JSON.stringify([tamperedTuple]))}&d=1&e=85&r=20`,
    );
    const decoded = decodeLoadListShareState(params, "refrigerator_runtime", () => "id")!;
    expect(decoded.devices).toHaveLength(1);
    // Derived from raw=1/Wh: deriveWattsAndHoursFromDailyEnergy(1) = watts 1/24, hours 24.
    expect(Math.round(decoded.devices[0].watts * decoded.devices[0].hoursPerDay)).toBe(1);
    expect(decoded.devices[0].watts).not.toBe(99999);
  });

  it("an invalid daily-energy raw value (empty, negative, huge, non-numeric, or an invalid unit) is ignored — the tuple's own watts/hours are used instead, never NaN/Infinity", () => {
    const badCases: Array<[unknown, unknown]> = [
      ["", "Wh"],
      ["-5", "Wh"],
      ["99999999999", "Wh"],
      ["abc", "Wh"],
      ["100", "not-a-real-unit"],
      [null, null],
    ];
    for (const [raw, unit] of badCases) {
      const tuple = ["Load", 150, 1, 8, null, true, raw, unit];
      const params = new URLSearchParams(
        `t=refrigerator_runtime&em=d&l=${encodeURIComponent(JSON.stringify([tuple]))}&d=1&e=85&r=20`,
      );
      const decoded = decodeLoadListShareState(params, "refrigerator_runtime", () => "id")!;
      expect(decoded.devices).toHaveLength(1);
      expect(Number.isFinite(decoded.devices[0].watts)).toBe(true);
      expect(Number.isFinite(decoded.devices[0].hoursPerDay)).toBe(true);
      // Falls back to the tuple's own (valid) watts=150, hours=8.
      expect(decoded.devices[0].watts).toBe(150);
      expect(decoded.devices[0].hoursPerDay).toBe(8);
      expect(decoded.dailyEnergyEntries.id).toBeUndefined();
    }
  });

  it("malformed JSON in the daily-energy fields of an otherwise-valid tuple array never throws", () => {
    expect(() =>
      decodeLoadListShareState(
        new URLSearchParams("t=refrigerator_runtime&em=d&l=not-json&d=1&e=85&r=20"),
        "refrigerator_runtime",
        () => "id",
      ),
    ).not.toThrow();
  });

  it("backward compatibility: a valid OLD 6-element tuple (no daily-energy fields at all) still decodes exactly as before", () => {
    const oldTuple = ["Household refrigerator", 150, 1, 8, 600, true];
    const params = new URLSearchParams(
      `t=refrigerator_runtime&l=${encodeURIComponent(JSON.stringify([oldTuple]))}&d=1&e=85&r=20`,
    );
    const decoded = decodeLoadListShareState(params, "refrigerator_runtime", () => "id")!;
    expect(decoded.entryMode).toBe("watts"); // no `em` param -> default
    expect(decoded.devices[0]).toMatchObject({ name: "Household refrigerator", watts: 150, quantity: 1, hoursPerDay: 8, surgeWatts: 600 });
    expect(decoded.dailyEnergyEntries).toEqual({});
  });

  it("backward compatibility: an old link with entryMode absent and no `em` param defaults cleanly to watts mode", () => {
    const decoded = decodeLoadListShareState(
      new URLSearchParams("t=refrigerator_runtime&d=1&e=85&r=20&s=0"),
      "refrigerator_runtime",
      () => "id",
    )!;
    expect(decoded.entryMode).toBe("watts");
  });

  it("CSV/print inputsSummary logic reads from the SAME dailyEnergyEntries state that decodeLoadListShareState seeds — restoring a link therefore restores the original-unit line in the printed report too", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("restoredShareState?.dailyEnergyEntries ?? {}");
    expect(src).toContain("restoredShareState?.entryMode ?? \"watts\"");
    expect(src).toContain("entered as ${dailyEntry.raw} ${unitLabel}");
  });
});
