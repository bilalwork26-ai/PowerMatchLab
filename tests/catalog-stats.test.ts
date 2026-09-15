import { describe, expect, it } from "vitest";
import { computeCatalogStats, buildCatalogCsv, CSV_COLUMNS } from "@/lib/catalog-stats";
import { getAllProducts } from "@/data/products";
import type { Product } from "@/types/product";

function fixtureProduct(overrides: Partial<Product>): Product {
  return {
    id: "fixture",
    brand: "FixtureBrand",
    model: "Fixture Model",
    market: "US",
    category: "portable-power-station",
    capacity_wh: null,
    rated_output_w: null,
    surge_output_w: null,
    battery_chemistry: null,
    cycle_life: null,
    weight_kg: null,
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
    official_source_url: null,
    last_verified: null,
    amazon_asin: null,
    amazon_product_url: null,
    amazon_affiliate_url: null,
    amazon_verification_status: "confirmed",
    amazon_listing_note: null,
    ...overrides,
  };
}

describe("computeCatalogStats: median/min/max are computed only from known values", () => {
  it("odd-length known set: median is the middle value, unknowns excluded entirely", () => {
    const products = [
      fixtureProduct({ id: "a", capacity_wh: 1000 }),
      fixtureProduct({ id: "b", capacity_wh: 2000 }),
      fixtureProduct({ id: "c", capacity_wh: 3000 }),
      fixtureProduct({ id: "d", capacity_wh: null }), // unknown, must not become 0
    ];
    const stats = computeCatalogStats(products);
    const capacity = stats.numericFields.find((f) => f.field === "capacity_wh")!;
    expect(capacity.knownCount).toBe(3);
    expect(capacity.unknownCount).toBe(1);
    expect(capacity.unknownPct).toBe(25);
    expect(capacity.min).toBe(1000);
    expect(capacity.max).toBe(3000);
    expect(capacity.median).toBe(2000);
  });

  it("even-length known set: median is the average of the two middle values", () => {
    const products = [
      fixtureProduct({ id: "a", capacity_wh: 1000 }),
      fixtureProduct({ id: "b", capacity_wh: 2000 }),
      fixtureProduct({ id: "c", capacity_wh: 3000 }),
      fixtureProduct({ id: "d", capacity_wh: 4000 }),
    ];
    const stats = computeCatalogStats(products);
    const capacity = stats.numericFields.find((f) => f.field === "capacity_wh")!;
    expect(capacity.median).toBe(2500);
  });

  it("all-unknown field: min/max/median are null, not 0 or NaN", () => {
    const products = [
      fixtureProduct({ id: "a", surge_output_w: null }),
      fixtureProduct({ id: "b", surge_output_w: null }),
    ];
    const stats = computeCatalogStats(products);
    const surge = stats.numericFields.find((f) => f.field === "surge_output_w")!;
    expect(surge.min).toBeNull();
    expect(surge.max).toBeNull();
    expect(surge.median).toBeNull();
    expect(surge.unknownPct).toBe(100);
  });

  it("battery chemistry buckets sum to knownCount, and unknowns are reported separately", () => {
    const products = [
      fixtureProduct({ id: "a", battery_chemistry: "LiFePO4" }),
      fixtureProduct({ id: "b", battery_chemistry: "LiFePO4" }),
      fixtureProduct({ id: "c", battery_chemistry: "NMC" }),
      fixtureProduct({ id: "d", battery_chemistry: null }),
    ];
    const stats = computeCatalogStats(products);
    const chem = stats.categoricalFields[0];
    const bucketSum = chem.buckets.reduce((sum, b) => sum + b.count, 0);
    expect(bucketSum).toBe(3);
    expect(chem.unknownCount).toBe(1);
    expect(chem.buckets.find((b) => b.value === "LiFePO4")?.count).toBe(2);
  });

  it("dataCurrentThrough is the latest last_verified date, oldestVerifiedDate the earliest", () => {
    const products = [
      fixtureProduct({ id: "a", last_verified: "2026-01-15" }),
      fixtureProduct({ id: "b", last_verified: "2026-06-01" }),
      fixtureProduct({ id: "c", last_verified: null }),
    ];
    const stats = computeCatalogStats(products);
    expect(stats.dataCurrentThrough).toBe("2026-06-01");
    expect(stats.oldestVerifiedDate).toBe("2026-01-15");
  });

  it("brands list is deduplicated with a real count per brand", () => {
    const products = [
      fixtureProduct({ id: "a", brand: "Acme" }),
      fixtureProduct({ id: "b", brand: "Acme" }),
      fixtureProduct({ id: "c", brand: "Zenith" }),
    ];
    const stats = computeCatalogStats(products);
    expect(stats.brands).toHaveLength(2);
    expect(stats.brands.find((b) => b.name === "Acme")?.count).toBe(2);
  });
});

describe("computeCatalogStats against the real catalog", () => {
  it("productCount matches getAllProducts().length, and every numeric field's knownCount never exceeds it", () => {
    const products = getAllProducts();
    const stats = computeCatalogStats(products);
    expect(stats.productCount).toBe(products.length);
    for (const f of stats.numericFields) {
      expect(f.knownCount).toBeLessThanOrEqual(stats.productCount);
      expect(f.knownCount + f.unknownCount).toBe(stats.productCount);
    }
  });
});

describe("buildCatalogCsv: never carries affiliate/Amazon fields or internal notes", () => {
  it("CSV_COLUMNS excludes every amazon_* field and pros/cons", () => {
    const keys = CSV_COLUMNS.map((c) => c.key as string);
    for (const forbidden of [
      "amazon_asin",
      "amazon_product_url",
      "amazon_affiliate_url",
      "amazon_verification_status",
      "amazon_listing_note",
      "pros",
      "cons",
    ]) {
      expect(keys, `CSV must not include ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("the generated CSV text contains no amazon.com URL, ASIN-shaped token, or affiliate tag anywhere", () => {
    const csv = buildCatalogCsv(getAllProducts());
    expect(csv).not.toMatch(/amazon\.com/i);
    expect(csv).not.toMatch(/amzn\.to/i);
    expect(csv).not.toMatch(/tag=powermatchlab/i);
    // ASIN shape: exactly 10 uppercase alphanumeric chars starting with B —
    // real product ids/models in this catalog never happen to match this.
    expect(csv).not.toMatch(/\bB[0-9A-Z]{9}\b/);
  });

  it("row count equals product count plus one header row", () => {
    const products = getAllProducts();
    const csv = buildCatalogCsv(products);
    const lines = csv.trim().split("\r\n");
    expect(lines.length).toBe(products.length + 1);
    expect(lines[0]).toBe(CSV_COLUMNS.map((c) => c.header).join(","));
  });

  it("a value containing a comma is quoted so the CSV stays well-formed", () => {
    const csv = buildCatalogCsv([
      fixtureProduct({ id: "x", dimensions: "12 in, 8 in, 6 in" }),
    ]);
    expect(csv).toContain('"12 in, 8 in, 6 in"');
  });
});
