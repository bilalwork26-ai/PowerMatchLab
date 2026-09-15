import type { Product } from "@/types/product";

/**
 * Programmatic aggregates for the /research dataset report. Every number
 * here is computed from the live `products.json` catalog at request/build
 * time — nothing in this module is a hand-typed figure, so it can never go
 * stale the way a manually-written statistic would after the catalog
 * changes. Unknown (`null`) values are excluded from a distribution's
 * median/min/max rather than treated as zero, and reported separately as
 * "unknown %".
 */

export interface NumericFieldStats {
  field: string;
  label: string;
  unit: string;
  knownCount: number;
  unknownCount: number;
  unknownPct: number;
  min: number | null;
  max: number | null;
  median: number | null;
}

export interface CategoricalBucket {
  value: string;
  count: number;
  pct: number;
}

export interface CategoricalFieldStats {
  field: string;
  label: string;
  knownCount: number;
  unknownCount: number;
  unknownPct: number;
  buckets: CategoricalBucket[];
}

export interface CatalogStats {
  productCount: number;
  brands: { name: string; count: number }[];
  numericFields: NumericFieldStats[];
  categoricalFields: CategoricalFieldStats[];
  /** Latest last_verified date across the whole catalog — the dataset's real "current through" date. */
  dataCurrentThrough: string | null;
  /** Oldest last_verified date across the whole catalog. */
  oldestVerifiedDate: string | null;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function numericFieldStats(
  products: Product[],
  field: keyof Product,
  label: string,
  unit: string,
): NumericFieldStats {
  const known = products
    .map((p) => p[field])
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const unknownCount = products.length - known.length;
  return {
    field: String(field),
    label,
    unit,
    knownCount: known.length,
    unknownCount,
    unknownPct: products.length > 0 ? Math.round((unknownCount / products.length) * 1000) / 10 : 0,
    min: known.length ? Math.min(...known) : null,
    max: known.length ? Math.max(...known) : null,
    median: median(known),
  };
}

function categoricalFieldStats(
  products: Product[],
  field: keyof Product,
  label: string,
): CategoricalFieldStats {
  const known = products
    .map((p) => p[field])
    .filter((v): v is string => typeof v === "string" && v.trim() !== "");
  const unknownCount = products.length - known.length;
  const counts = new Map<string, number>();
  for (const v of known) counts.set(v, (counts.get(v) ?? 0) + 1);
  const buckets: CategoricalBucket[] = [...counts.entries()]
    .map(([value, count]) => ({
      value,
      count,
      pct: Math.round((count / products.length) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count);
  return {
    field: String(field),
    label,
    knownCount: known.length,
    unknownCount,
    unknownPct: products.length > 0 ? Math.round((unknownCount / products.length) * 1000) / 10 : 0,
    buckets,
  };
}

export function computeCatalogStats(products: Product[]): CatalogStats {
  const brandCounts = new Map<string, number>();
  for (const p of products) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const brands = [...brandCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const verifiedDates = products
    .map((p) => p.last_verified)
    .filter((d): d is string => Boolean(d))
    .sort();

  return {
    productCount: products.length,
    brands,
    numericFields: [
      numericFieldStats(products, "capacity_wh", "Battery capacity", "Wh"),
      numericFieldStats(products, "rated_output_w", "Continuous output", "W"),
      numericFieldStats(products, "surge_output_w", "Surge output", "W"),
      numericFieldStats(products, "weight_kg", "Weight", "kg"),
      numericFieldStats(products, "solar_input_w", "Max solar input", "W"),
    ],
    categoricalFields: [categoricalFieldStats(products, "battery_chemistry", "Battery chemistry")],
    dataCurrentThrough: verifiedDates.length ? verifiedDates[verifiedDates.length - 1] : null,
    oldestVerifiedDate: verifiedDates.length ? verifiedDates[0] : null,
  };
}

/**
 * Fields safe to redistribute in the public CSV: manufacturer-published
 * specifications only. Deliberately excludes every amazon_* field
 * (affiliate URL, product URL, ASIN, verification status, listing note),
 * and excludes pros/cons as editorial judgment rather than raw spec data.
 */
export const CSV_COLUMNS: { key: keyof Product; header: string }[] = [
  { key: "id", header: "id" },
  { key: "brand", header: "brand" },
  { key: "model", header: "model" },
  { key: "capacity_wh", header: "capacity_wh" },
  { key: "rated_output_w", header: "rated_output_w" },
  { key: "surge_output_w", header: "surge_output_w" },
  { key: "battery_chemistry", header: "battery_chemistry" },
  { key: "cycle_life", header: "cycle_life" },
  { key: "weight_kg", header: "weight_kg" },
  { key: "dimensions", header: "dimensions" },
  { key: "solar_input_w", header: "solar_input_w" },
  { key: "ac_charging_w", header: "ac_charging_w" },
  { key: "charging_time", header: "charging_time" },
  { key: "ac_outlets", header: "ac_outlets" },
  { key: "usb_c", header: "usb_c" },
  { key: "usb_a", header: "usb_a" },
  { key: "dc_output", header: "dc_output" },
  { key: "rv_tt30", header: "rv_tt30" },
  { key: "voltage_240v", header: "voltage_240v" },
  { key: "ups_ms", header: "ups_ms" },
  { key: "expandable", header: "expandable" },
  { key: "max_expanded_capacity_wh", header: "max_expanded_capacity_wh" },
  { key: "wifi", header: "wifi" },
  { key: "bluetooth", header: "bluetooth" },
  { key: "warranty", header: "warranty" },
  { key: "idle_consumption_w", header: "idle_consumption_w" },
  { key: "official_source", header: "official_source" },
  { key: "official_source_url", header: "official_source_url" },
  { key: "last_verified", header: "last_verified" },
];

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return csvEscape(value.join("; "));
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** Builds the exact CSV text served by /research/.../catalog.csv — same column set the page's own citation refers to. */
export function buildCatalogCsv(products: Product[]): string {
  const header = CSV_COLUMNS.map((c) => c.header).join(",");
  const rows = products.map((p) => CSV_COLUMNS.map((c) => csvEscape(p[c.key])).join(","));
  return [header, ...rows].join("\r\n") + "\r\n";
}
