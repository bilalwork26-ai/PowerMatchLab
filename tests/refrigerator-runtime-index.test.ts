import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { calculatePower, MIN_DAYS, type DeviceInput } from "@/lib/calculator";
import {
  deriveWattsAndHoursFromDailyEnergy,
  kwhToWh,
  estimateDailySolarWh,
} from "@/lib/tools-engine";
import {
  encodeLoadListShareState,
  decodeLoadListShareState,
  type LoadListShareState,
} from "@/lib/tools-share-state";
import { buildRuntimeIndexCsv } from "@/lib/csv-export";
import { sortRuntimeIndexRows, filterRuntimeIndexRows } from "@/lib/runtime-index-sort";
import { recommendProducts, type Recommendation } from "@/lib/recommend";
import { getAllProducts } from "@/data/products";
import { getTool } from "@/content/tools";
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

// ---------------------------------------------------------------------------
// 1. kWh <-> Wh conversion
// ---------------------------------------------------------------------------
describe("kwhToWh: exact unit conversion", () => {
  it("converts a positive kWh figure to Wh (×1000)", () => {
    expect(kwhToWh(1.2)).toBe(1200);
    expect(kwhToWh(0.5)).toBe(500);
  });
  it("returns 0 for zero, negative, NaN or infinite input — never a negative or NaN Wh value", () => {
    for (const bad of [0, -5, NaN, -Infinity]) {
      expect(kwhToWh(bad)).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Daily-energy mode vs. watts × hours/day
// ---------------------------------------------------------------------------
describe("deriveWattsAndHoursFromDailyEnergy: daily-Wh/kWh entry reproduces identical engine results", () => {
  it("a directly-entered daily Wh figure produces the exact same dailyEnergyWh as an equivalent watts × 24h device", () => {
    const dailyWh = 1200;
    const { watts, hoursPerDay } = deriveWattsAndHoursFromDailyEnergy(dailyWh);
    expect(hoursPerDay).toBe(24);
    expect(watts * hoursPerDay).toBe(dailyWh);

    const result = calculatePower([baseDevice({ watts, hoursPerDay, surgeWatts: null })], { days: 1 });
    expect(result.dailyEnergyWh).toBe(dailyWh);
  });

  it("a daily kWh figure (converted via kwhToWh first) also reproduces the exact dailyEnergyWh", () => {
    const dailyKwh = 1.2; // = 1200 Wh, ENERGY STAR-style annual/365 figure
    const { watts, hoursPerDay } = deriveWattsAndHoursFromDailyEnergy(kwhToWh(dailyKwh));
    const result = calculatePower([baseDevice({ watts, hoursPerDay, surgeWatts: null })], { days: 1 });
    expect(result.dailyEnergyWh).toBe(1200);
  });

  it("zero, negative or NaN daily energy derives to zero watts, never NaN", () => {
    for (const bad of [0, -100, NaN]) {
      const { watts, hoursPerDay } = deriveWattsAndHoursFromDailyEnergy(bad);
      expect(watts).toBe(0);
      expect(hoursPerDay).toBe(24);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Duration in hours vs. days (MIN_DAYS)
// ---------------------------------------------------------------------------
describe("Outage duration: hours and whole days both produce a valid, finite calculation", () => {
  it("MIN_DAYS represents exactly one hour", () => {
    expect(MIN_DAYS).toBeCloseTo(1 / 24, 10);
  });

  it("a 6-hour outage (0.25 days) is accepted, not silently rounded up to a full day", () => {
    const sixHoursAsDays = 6 / 24;
    const result = calculatePower([baseDevice()], { days: sixHoursAsDays });
    const oneDay = calculatePower([baseDevice()], { days: 1 });
    // A 6-hour target demands a quarter of the total energy a full-day target does.
    expect(result.totalEnergyDemandWh).toBeCloseTo(oneDay.totalEnergyDemandWh / 4, 0);
    expect(result.totalEnergyDemandWh).toBeLessThan(oneDay.totalEnergyDemandWh);
  });

  it("a sub-hour or zero/negative days value clamps up to MIN_DAYS, never to 0 or NaN", () => {
    for (const bad of [0, -5, 0.0001]) {
      const result = calculatePower([baseDevice()], { days: bad });
      expect(Number.isFinite(result.totalEnergyDemandWh)).toBe(true);
      expect(result.totalEnergyDemandWh).toBeGreaterThan(0);
    }
  });

  it("the refrigerator tool page offers an hours-based duration input, not just whole days", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("allowHoursDuration");
    expect(src).toContain('durationUnit === "hours"');
  });
});

// ---------------------------------------------------------------------------
// 4. Reserve and efficiency assumptions still apply under daily-energy mode
// ---------------------------------------------------------------------------
describe("Reserve and efficiency assumptions apply identically regardless of entry mode", () => {
  it("recommendedMinimumCapacityWh scales with efficiency and reserve the same way for a derived (daily-energy-mode) device as a directly-entered one", () => {
    const { watts, hoursPerDay } = deriveWattsAndHoursFromDailyEnergy(1200);
    const derived = calculatePower([baseDevice({ watts, hoursPerDay, surgeWatts: null })], { days: 1 }, {
      systemEfficiency: 0.8,
      reserveFraction: 0.25,
    });
    const direct = calculatePower([baseDevice({ watts: 150, hoursPerDay: 8, surgeWatts: null })], { days: 1 }, {
      systemEfficiency: 0.8,
      reserveFraction: 0.25,
    });
    expect(derived.dailyEnergyWh).toBe(direct.dailyEnergyWh);
    expect(derived.recommendedMinimumCapacityWh).toBe(direct.recommendedMinimumCapacityWh);
  });
});

// ---------------------------------------------------------------------------
// 5 & 6. Known vs. unverified surge — reuses recommend.ts, verified through the Runtime Index/CSV surface
// ---------------------------------------------------------------------------
describe("Runtime Index surface reflects known vs. unverified surge exactly as recommend.ts classifies it", () => {
  const result = calculatePower([baseDevice()], { days: 1 }); // requires a real surge (baseDevice has surgeWatts 600)

  it("a product with a verified surge rating meeting the requirement is never described as unverified in the CSV export", () => {
    const withSurge = baseProduct({ surge_output_w: 5000 });
    const recs = recommendProducts(result, [withSurge]);
    const csv = buildRuntimeIndexCsv(recs, new Map([[withSurge.id, 2]]), csvMeta(result));
    const dataLine = csv.split("\r\n").find((l) => l.includes(withSurge.model))!;
    expect(dataLine).toContain(",Yes,"); // "Surge verified?" column
  });

  it("a product with no surge_output_w at all is exported as Not verified, never a fabricated number", () => {
    const noSurge = baseProduct({ id: "no-surge", surge_output_w: null });
    const recs = recommendProducts(result, [noSurge]);
    const csv = buildRuntimeIndexCsv(recs, new Map([[noSurge.id, 2]]), csvMeta(result));
    const dataLine = csv.split("\r\n").find((l) => l.includes(noSurge.model))!;
    expect(dataLine).toContain("Not verified");
  });
});

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
// 7. Refrigerator + freezer combined
// ---------------------------------------------------------------------------
describe("Refrigerator + freezer combined load", () => {
  it("sums continuous watts and takes the larger single surge delta, not both surges stacked", () => {
    const result = calculatePower(
      [
        baseDevice({ id: "fridge", watts: 150, surgeWatts: 600 }),
        baseDevice({ id: "freezer", name: "Freezer", watts: 100, surgeWatts: 400 }),
      ],
      { days: 1 },
    );
    expect(result.requiredContinuousOutputW).toBe(250);
    // Largest surge delta: freezer's 400-100=300 vs fridge's 600-150=450 -> 450 is bigger, so total = 250 + 450 = 700
    expect(result.requiredSurgeOutputW).toBe(700);
  });
});

// ---------------------------------------------------------------------------
// 8, 9, 10. Solar: partial / full / zero — already covered exhaustively in
// tests/tools-engine.test.ts (applySolarOffset). Confirming no duplicate
// re-implementation exists in the new solar-estimator helper.
// ---------------------------------------------------------------------------
describe("estimateDailySolarWh: panel-spec estimator only pre-fills the existing solar field, never a second solar model", () => {
  it("computes panelWatts × peakSunHours × realizationFraction", () => {
    expect(estimateDailySolarWh({ panelWatts: 100, peakSunHours: 4, realizationFraction: 0.7 })).toBeCloseTo(280, 6);
  });
  it("zero panel watts or zero sun hours yields zero, never NaN", () => {
    expect(estimateDailySolarWh({ panelWatts: 0, peakSunHours: 4, realizationFraction: 0.7 })).toBe(0);
    expect(estimateDailySolarWh({ panelWatts: 100, peakSunHours: 0, realizationFraction: 0.7 })).toBe(0);
  });
  it("clamps a negative or >1 realization fraction into [0,1], and NaN/negative panel/sun-hour inputs to 0", () => {
    expect(estimateDailySolarWh({ panelWatts: 100, peakSunHours: 4, realizationFraction: 5 })).toBeCloseTo(400, 6);
    expect(estimateDailySolarWh({ panelWatts: -50, peakSunHours: 4, realizationFraction: 0.7 })).toBe(0);
    expect(estimateDailySolarWh({ panelWatts: 100, peakSunHours: NaN, realizationFraction: 0.7 })).toBe(0);
  });
  it("the estimator only ever calls applySolarOffset's own dailySolarWh field — it does not introduce a parallel solar-adjustment path", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain("setDailySolarWh(Math.round(estimated))");
  });
});

// ---------------------------------------------------------------------------
// 11. Extreme/invalid numeric input, generally
// ---------------------------------------------------------------------------
describe("Extreme and invalid numeric input never produces NaN/Infinity anywhere in the new modules", () => {
  it("calculatePower stays finite for an absurdly large watts/quantity/hours combination", () => {
    const result = calculatePower(
      [baseDevice({ watts: 1e9, quantity: 1e6, hoursPerDay: 1e6, surgeWatts: 1e9 })],
      { days: 1e9 },
    );
    for (const v of [
      result.dailyEnergyWh,
      result.recommendedMinimumCapacityWh,
      result.requiredContinuousOutputW,
      result.requiredSurgeOutputW,
    ]) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });

  it("buildRuntimeIndexCsv never throws for an empty recommendation list", () => {
    const result = calculatePower([baseDevice()], { days: 1 });
    expect(() => buildRuntimeIndexCsv([], new Map(), csvMeta(result))).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 12, 13, 14. Shareable URL state: valid, tampered, and exact restoration
// ---------------------------------------------------------------------------
describe("Shareable URL state: encode -> decode round-trip", () => {
  const state: LoadListShareState = {
    devices: [
      { id: "x", name: "Household refrigerator", watts: 150, quantity: 1, hoursPerDay: 8, surgeWatts: 600, simultaneous: true },
    ],
    days: 2,
    dailySolarWh: 300,
    efficiencyPct: 80,
    reservePct: 25,
    prefs: { wantsExpandable: true, prioritisePortability: false },
  };
  const prefsConfig = { wantsExpandable: true, prioritisePortability: true };

  it("a valid encoded URL restores every field exactly", () => {
    const query = encodeLoadListShareState(state, "refrigerator_runtime", prefsConfig);
    const decoded = decodeLoadListShareState(new URLSearchParams(query), "refrigerator_runtime", () => "restored-id");
    expect(decoded).not.toBeNull();
    expect(decoded!.days).toBe(2);
    expect(decoded!.dailySolarWh).toBe(300);
    expect(decoded!.efficiencyPct).toBe(80);
    expect(decoded!.reservePct).toBe(25);
    expect(decoded!.prefs.wantsExpandable).toBe(true);
    expect(decoded!.devices).toHaveLength(1);
    expect(decoded!.devices[0]).toMatchObject({
      name: "Household refrigerator",
      watts: 150,
      quantity: 1,
      hoursPerDay: 8,
      surgeWatts: 600,
      simultaneous: true,
    });
  });

  it("a link for a different tool (mismatched t= tag) is rejected — no cross-tool state leakage", () => {
    const query = encodeLoadListShareState(state, "refrigerator_runtime", prefsConfig);
    const decoded = decodeLoadListShareState(new URLSearchParams(query), "rv_power", () => "id");
    expect(decoded).toBeNull();
  });

  it("a URL with no recognized params at all yields null (fall back to normal seeded defaults)", () => {
    const decoded = decodeLoadListShareState(new URLSearchParams("foo=bar"), "refrigerator_runtime", () => "id");
    expect(decoded).toBeNull();
  });

  it("malformed JSON in the l= param never throws — it just yields zero restored devices", () => {
    const params = new URLSearchParams("t=refrigerator_runtime&l=not-json&d=2");
    const decoded = decodeLoadListShareState(params, "refrigerator_runtime", () => "id");
    expect(decoded).not.toBeNull();
    expect(decoded!.devices).toEqual([]);
  });

  it("an oversized device array is capped, never rendering an unbounded table", () => {
    const tooMany = Array.from({ length: 500 }, (_, i) => ["Load " + i, 10, 1, 1, null, true]);
    const params = new URLSearchParams(`t=refrigerator_runtime&l=${encodeURIComponent(JSON.stringify(tooMany))}`);
    const decoded = decodeLoadListShareState(params, "refrigerator_runtime", () => "id");
    expect(decoded!.devices.length).toBeLessThanOrEqual(20);
  });

  it("out-of-range numeric values (huge watts, negative days, >100% efficiency) are clamped into the same safe bounds the UI sliders enforce, never passed through raw", () => {
    const params = new URLSearchParams(
      `t=refrigerator_runtime&d=-99&e=999&r=-50&l=${encodeURIComponent(JSON.stringify([["X", 999999999, 1, 1, null, true]]))}`,
    );
    const decoded = decodeLoadListShareState(params, "refrigerator_runtime", () => "id");
    expect(decoded!.days).toBeGreaterThanOrEqual(MIN_DAYS);
    expect(decoded!.efficiencyPct).toBeLessThanOrEqual(95);
    expect(decoded!.reservePct).toBeGreaterThanOrEqual(0);
    expect(decoded!.devices[0].watts).toBeLessThanOrEqual(100_000);
  });

  it("a non-array l= value (e.g. a JSON object) yields zero restored devices, never a crash", () => {
    const params = new URLSearchParams(`t=refrigerator_runtime&l=${encodeURIComponent(JSON.stringify({ not: "an array" }))}`);
    const decoded = decodeLoadListShareState(params, "refrigerator_runtime", () => "id");
    expect(decoded!.devices).toEqual([]);
  });

  it("preferences not exposed by a tool's own prefsConfig are never encoded into its URL", () => {
    const query = encodeLoadListShareState(
      { ...state, prefs: { needsTT30: true } },
      "refrigerator_runtime",
      { wantsExpandable: true }, // refrigerator's real config never exposes needsTT30
    );
    expect(query).not.toContain("ptt30");
  });
});

// ---------------------------------------------------------------------------
// 15. Clean canonical — sharing never pollutes the indexed URL
// ---------------------------------------------------------------------------
describe("Canonical stays clean regardless of any shared-link query parameters", () => {
  it("generateMetadata for /tools/[slug] never reads searchParams — canonical is built from the static path alone", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    const metaFnMatch = src.match(/export async function generateMetadata\(([\s\S]*?)\n\}/);
    expect(metaFnMatch).not.toBeNull();
    expect(metaFnMatch![0]).not.toContain("searchParams");
  });

  it("pageMetadata's canonical always derives from the path argument, never from a query string", () => {
    const src = read("src/lib/seo.ts");
    const start = src.indexOf("export function pageMetadata(");
    expect(start).toBeGreaterThanOrEqual(0);
    const nextExport = src.indexOf("\nexport function", start + 1);
    const body = nextExport === -1 ? src.slice(start) : src.slice(start, nextExport);
    expect(body).not.toContain("searchParams");
    expect(body).toContain("absoluteUrl(path)");
  });
});

// ---------------------------------------------------------------------------
// 16 & 17. Deterministic classification + null critical data
// ---------------------------------------------------------------------------
describe("Runtime Index sort: deterministic and never crashes on null/unverified fields", () => {
  function rec(id: string, overrides: Partial<Product>): Recommendation {
    const result = calculatePower([baseDevice()], { days: 1 });
    return recommendProducts(result, [baseProduct({ id, ...overrides })])[0];
  }

  it("sorting by any key is stable and idempotent — sorting an already-sorted list twice gives the same order", () => {
    const rows = [
      rec("a", { capacity_wh: 2000 }),
      rec("b", { capacity_wh: null }),
      rec("c", { capacity_wh: 1000 }),
    ];
    const autonomy = new Map<string, number | null>([["a", 5], ["b", null], ["c", 2]]);
    const once = sortRuntimeIndexRows(rows, autonomy, "capacity", "desc");
    const twice = sortRuntimeIndexRows(once, autonomy, "capacity", "desc");
    expect(once.map((r) => r.product.id)).toEqual(twice.map((r) => r.product.id));
  });

  it("a product with a null capacity always sorts to the end, in either direction", () => {
    const rows = [rec("known", { capacity_wh: 500 }), rec("unknown", { capacity_wh: null })];
    const autonomy = new Map<string, number | null>([["known", 1], ["unknown", null]]);
    expect(sortRuntimeIndexRows(rows, autonomy, "capacity", "asc").at(-1)!.product.id).toBe("unknown");
    expect(sortRuntimeIndexRows(rows, autonomy, "capacity", "desc").at(-1)!.product.id).toBe("unknown");
  });

  it("filtering by a status with zero matches returns an empty array, not an error", () => {
    const rows = [rec("a", { capacity_wh: 5000, rated_output_w: 5000 })];
    expect(filterRuntimeIndexRows(rows, "Not Suitable")).toEqual([]);
  });

  it("filtering by 'all' returns every row unchanged", () => {
    const rows = [rec("a", {}), rec("b", {})];
    expect(filterRuntimeIndexRows(rows, "all")).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// 18. CSV export correctness
// ---------------------------------------------------------------------------
describe("buildRuntimeIndexCsv: correct, escaped, and free of invented data", () => {
  const result = calculatePower([baseDevice()], { days: 1 });

  it("escapes a comma, quote, and newline in a product name correctly per RFC 4180", () => {
    const weird = baseProduct({ id: "weird", brand: 'Bra"nd, Inc', model: "Model\nLine2" });
    const recs = recommendProducts(result, [weird]);
    const csv = buildRuntimeIndexCsv(recs, new Map([[weird.id, 1]]), csvMeta(result));
    expect(csv).toContain('"Bra""nd, Inc"');
    expect(csv).toContain('"Model\nLine2"');
  });

  it("includes a header row with the expected columns and one data row per product", () => {
    const p1 = baseProduct({ id: "p1" });
    const p2 = baseProduct({ id: "p2", model: "Second Model" });
    const recs = recommendProducts(result, [p1, p2]);
    const csv = buildRuntimeIndexCsv(recs, new Map([[p1.id, 1], [p2.id, 2]]), csvMeta(result));
    expect(csv).toContain("Brand,Model,Status");
    const dataLines = csv.split("\r\n").filter((l) => l.includes("Test Model") || l.includes("Second Model"));
    expect(dataLines).toHaveLength(2);
  });

  it("a product with no capacity/output data at all exports 'Not verified' rather than 0 or a blank cell", () => {
    const blank = baseProduct({ id: "blank", capacity_wh: null, rated_output_w: null, surge_output_w: null, weight_kg: null, solar_input_w: null });
    const recs = recommendProducts(result, [blank]);
    const csv = buildRuntimeIndexCsv(recs, new Map([[blank.id, null]]), csvMeta(result));
    const line = csv.split("\r\n").find((l) => l.includes(blank.model))!;
    expect(line).toContain("Not verified");
    expect(line).not.toMatch(/,0,/);
  });

  it("never contains a manual price field or a currency literal in the source module", () => {
    const src = read("src/lib/csv-export.ts");
    expect(src).not.toMatch(/\bprice\w*\s*[:=]/i);
    expect(src).not.toMatch(/[$]\d/);
  });
});

// ---------------------------------------------------------------------------
// 19 & 20. Amazon link integrity + no manual prices in the new UI
// ---------------------------------------------------------------------------
describe("New Runtime Index surfaces never bypass the affiliate-only CTA rule or invent prices", () => {
  it("RuntimeIndexTable renders AmazonCta, never a raw amazon_product_url or a manually-built href", () => {
    const src = read("src/components/tools/RuntimeIndexTable.tsx");
    expect(src).toContain("<AmazonCta");
    expect(src).not.toContain("amazon_product_url");
    expect(src).not.toMatch(/href=\{.*amazon/i);
  });

  it("neither RuntimeIndexTable nor csv-export.ts references a manual price field", () => {
    for (const file of ["src/components/tools/RuntimeIndexTable.tsx", "src/lib/csv-export.ts", "src/lib/runtime-index-sort.ts"]) {
      const src = read(file);
      expect(src, `${file} should not reference a price field`).not.toMatch(/\bprice\w*\s*[:=]/i);
    }
  });

  it("PrintSummary contains no price or discount language", () => {
    const src = read("src/components/tools/PrintSummary.tsx");
    expect(src).not.toMatch(/\bprice\b/i);
    expect(src).not.toMatch(/discount|% off/i);
  });
});

// ---------------------------------------------------------------------------
// 21. Dynamically-derived catalog — never a hardcoded 39
// ---------------------------------------------------------------------------
describe("The Runtime Index and tool page derive the catalog count dynamically, never hardcode it", () => {
  it("the tool page's catalog-size line is computed from catalog.length, not a literal number", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    expect(src).toContain("all {catalog.length} products");
    expect(src).not.toMatch(/all 39 products/);
  });

  it("RuntimeIndexTable receives catalogCount as a prop rather than hardcoding a figure", () => {
    const src = read("src/components/tools/RuntimeIndexTable.tsx");
    expect(src).toContain("catalogCount");
    expect(src).not.toMatch(/\b39\b/);
  });

  it("sanity: the real catalog today has more than one product (the dynamic count is meaningful)", () => {
    expect(getAllProducts().length).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// 22. Basic accessibility of the new controls and table
// ---------------------------------------------------------------------------
describe("Runtime Index table and controls: basic accessibility", () => {
  it("the table has a caption describing its purpose for screen-reader users", () => {
    const src = read("src/components/tools/RuntimeIndexTable.tsx");
    expect(src).toContain("<caption");
  });

  it("every sortable column header uses a real <button>, not a <div onClick> (keyboard-operable by default)", () => {
    const src = read("src/components/tools/RuntimeIndexTable.tsx");
    expect(src).toContain('<button\n                    type="button"\n                    onClick={() => toggleSort(col.key)}');
  });

  it("status is never conveyed by color alone — the status text itself is always rendered alongside its color class", () => {
    const src = read("src/components/tools/RuntimeIndexTable.tsx");
    expect(src).toContain("{rec.status}");
  });

  it("the daily-energy and hours-duration inputs carry an aria-label or an associated <label>", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain('aria-label="Daily energy"');
    expect(src).toContain('aria-label="Outage duration in hours"');
  });

  it("aria-sort is set on sortable column headers, reflecting the active sort", () => {
    const src = read("src/components/tools/RuntimeIndexTable.tsx");
    expect(src).toContain("aria-sort=");
  });
});

// ---------------------------------------------------------------------------
// 23. No regression of the mobile horizontal-overflow fix from the prior sprint
// ---------------------------------------------------------------------------
describe("No regression of the SEO-sprint mobile overflow fix", () => {
  it("the /tools/[slug] grid item that wraps the calculator still has min-w-0", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    expect(src).toContain('<div className="min-w-0">');
  });

  it("RuntimeIndexTable's own wide table is contained in its own overflow-x-auto wrapper, exactly like the existing device-load table", () => {
    const src = read("src/components/tools/RuntimeIndexTable.tsx");
    expect(src).toContain("overflow-x-auto");
  });
});

// ---------------------------------------------------------------------------
// Refrigerator tool content sanity (ENERGY STAR/DOE sources, real catalog use)
// ---------------------------------------------------------------------------
describe("Refrigerator tool: real official sources, unchanged title/meta/slug", () => {
  it("cites ENERGY STAR and U.S. Department of Energy with real URLs already used elsewhere on the site", () => {
    const tool = getTool("refrigerator-runtime-calculator")!;
    const urls = tool.sources.filter((s): s is { label: string; url: string } => typeof s !== "string").map((s) => s.url);
    expect(urls).toContain("https://www.energystar.gov/products/refrigerators");
    expect(urls.some((u) => u.includes("energy.gov"))).toBe(true);
  });

  it("the tool's title, metaDescription and slug are exactly what they were before this round (measurement-window protection)", () => {
    const tool = getTool("refrigerator-runtime-calculator")!;
    expect(tool.title).toBe("Refrigerator & Freezer Runtime Calculator");
    expect(tool.slug).toBe("refrigerator-runtime-calculator");
    expect(tool.metaDescription).toBe(
      "Calculate the battery capacity and continuous output you need to keep a refrigerator or freezer running during a power outage, with your own watts, hours and solar input.",
    );
  });
});
