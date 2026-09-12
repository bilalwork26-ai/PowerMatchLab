/**
 * Head-to-head model comparison logic.
 *
 * Every verdict here is derived from the same `COMPARE_ROWS` priority tags
 * and `rowWinner()` tally already used by the general /compare page — never a
 * bespoke scoring formula. When neither product has a distinguishing,
 * on-file value for a category's relevant fields, the verdict is "no clear
 * winner" rather than a coin-flip pick from an arbitrary tie-break.
 */

import type { Product } from "@/types/product";
import { productDisplayName } from "@/data/products";
import { COMPARE_ROWS, rowWinner, type CompareRow } from "./compare-rows";
import { getApplianceExample } from "./appliances";
import { estimateRuntimeHours } from "./runtime";
import { RUNTIME_EFFICIENCY } from "./assumptions";
import type { Comparison, IndexCategory } from "@/content/comparisons";

export interface UseCaseVerdict {
  key: string;
  label: string;
  /** Winning product id, or null when the data on file doesn't distinguish them. */
  winnerId: string | null;
  /** Row labels actually used to decide this verdict — shown for transparency. */
  criteria: string[];
  /** How many of `criteria` had a value on file for both products. */
  comparableCount: number;
  /**
   * Set only when a multi-criterion category has exactly one decisive,
   * comparable row: names that specific edge without inflating it into an
   * overall category win (a single field is not "winning a use case").
   */
  note: string | null;
}

/**
 * Which existing COMPARE_ROWS rows decide each use case. These mirror the
 * `priorityFor` tags already defined on those rows (the same fields the
 * general /compare page highlights for a given use case).
 *
 * A category with a single rowKey (e.g. "Solar charging") IS the criterion —
 * it may declare a winner directly from that one row. A category with
 * several rowKeys needs at least two decisive, comparable rows before it may
 * declare an overall winner; with exactly one, the category verdict stays
 * "no clear overall winner" and a `note` names the single edge instead.
 */
const VERDICT_CONFIG: { key: string; label: string; rowKeys: string[] }[] = [
  {
    key: "refrigerator-backup",
    label: "Refrigerator backup",
    rowKeys: ["surge_output_w", "capacity_wh", "idle_consumption_w", "solar_input_w"],
  },
  {
    key: "rv",
    label: "RV / van life",
    rowKeys: ["rv_tt30", "rated_output_w", "surge_output_w", "expandable"],
  },
  {
    key: "camping",
    label: "Camping",
    rowKeys: ["weight_kg", "wh_per_kg", "idle_consumption_w", "solar_input_w"],
  },
  {
    key: "home-backup",
    label: "Home outage essentials",
    rowKeys: ["ups_ms", "rated_output_w", "capacity_wh", "expandable", "voltage_240v"],
  },
  {
    key: "solar-charging",
    label: "Solar charging",
    rowKeys: ["solar_input_w"],
  },
  {
    key: "portability",
    label: "Portability",
    rowKeys: ["wh_per_kg", "weight_kg"],
  },
];

/** True when every product has a non-null value for this row (a null field is neither a win nor a loss). */
export function isComparable(row: CompareRow, products: Product[]): boolean {
  return products.every((p) => row.numeric(p) != null);
}

export interface CapacityParity {
  comparable: boolean;
  equal: boolean;
  display: string;
}

/** Whether every product's registered capacity is comparable, and if so, whether they all tie. */
export function capacityParity(products: Product[]): CapacityParity {
  const row = COMPARE_ROWS.find((r) => r.key === "capacity_wh")!;
  const comparable = isComparable(row, products);
  const values = products.map((p) => row.numeric(p));
  return {
    comparable,
    equal: comparable && new Set(values).size === 1,
    display: row.display(products[0]),
  };
}

export function evaluateUseCases(products: Product[]): UseCaseVerdict[] {
  return VERDICT_CONFIG.map(({ key, label, rowKeys }) => {
    const rows = COMPARE_ROWS.filter((r) => rowKeys.includes(r.key));
    const isSingleCriterionCategory = rows.length === 1;

    const comparableRows = rows.filter((r) => isComparable(r, products));
    const decisive = comparableRows
      .map((row) => ({ row, result: rowWinner(row, products) }))
      .filter((d) => !d.result.tie && d.result.winnerIds.length === 1);

    const tally: Record<string, number> = {};
    for (const p of products) tally[p.id] = 0;
    for (const d of decisive) tally[d.result.winnerIds[0]] += 1;

    let winnerId: string | null = null;
    let note: string | null = null;

    if (isSingleCriterionCategory || decisive.length >= 2) {
      // Either this category's entire criterion is one row (legitimately
      // decidable from it alone), or at least two independent rows agree —
      // enough signal for an overall verdict. A unique highest tally wins;
      // any tie for the top spot (including an all-zero tally) means no
      // clear overall winner among however many products are compared.
      const maxTally = Math.max(...products.map((p) => tally[p.id]));
      const topIds = products.filter((p) => tally[p.id] === maxTally).map((p) => p.id);
      winnerId = maxTally > 0 && topIds.length === 1 ? topIds[0] : null;
    } else if (decisive.length === 1) {
      // Exactly one decisive row in a multi-criterion category: real, but not
      // enough to call the whole category. Name the specific edge instead.
      const { row, result } = decisive[0];
      const edgeWinner = products.find((p) => p.id === result.winnerIds[0])!;
      const otherLabels = rows
        .filter((r) => r.key !== row.key && !isComparable(r, products))
        .map((r) => r.label);
      note =
        `${productDisplayName(edgeWinner)} has the higher ${row.label.toLowerCase()} ` +
        "among the data available" +
        (otherLabels.length
          ? `, but ${otherLabels.join(" and ").toLowerCase()} ${
              otherLabels.length > 1 ? "are" : "is"
            } not verified for one or more of these units.`
          : ".");
    }
    // decisive.length === 0: no note, no winner — nothing distinguishes them.

    return {
      key,
      label,
      winnerId,
      criteria: rows.map((r) => r.label),
      comparableCount: comparableRows.length,
      note,
    };
  });
}

export interface ComparisonRuntimeRow {
  key: string;
  label: string;
  deviceWatts: number;
  /** Estimated hours per product id — null when capacity isn't on file. */
  hoursByProductId: Record<string, number | null>;
}

/**
 * Only appliances that already exist in the shared example-appliance data
 * (`appliances.ts`, the same list the Power Calculator seeds from). A
 * Starlink example is deliberately excluded: no such appliance exists in
 * that dataset, and this module never invents one.
 */
const RUNTIME_APPLIANCE_KEYS = ["fridge", "cpap", "led-lights"] as const;

export function buildComparisonRuntimeRows(products: Product[]): ComparisonRuntimeRow[] {
  return RUNTIME_APPLIANCE_KEYS.map((key) => {
    const appliance = getApplianceExample(key);
    if (!appliance) {
      throw new Error(`Expected appliance example "${key}" to exist`);
    }
    return {
      key,
      label: appliance.name,
      deviceWatts: appliance.runningWatts,
      hoursByProductId: Object.fromEntries(
        products.map((p) => [
          p.id,
          estimateRuntimeHours(p.capacity_wh, appliance.runningWatts, RUNTIME_EFFICIENCY),
        ]),
      ),
    };
  });
}

/**
 * A short list of headline differences, generated live from COMPARE_ROWS
 * display values — never independently typed numbers that could drift out
 * of sync with the catalog.
 */
const HEADLINE_ROW_KEYS = [
  "capacity_wh",
  "rated_output_w",
  "surge_output_w",
  "solar_input_w",
  "ac_charging_w",
  "weight_kg",
];

export interface HeadlineDifference {
  rowLabel: string;
  winnerId: string;
  winnerDisplay: string;
  /** Display values for every other product in the comparison, in the same order as `products`. */
  otherDisplays: string[];
}

export function headlineDifferences(products: Product[]): HeadlineDifference[] {
  const rows = COMPARE_ROWS.filter((r) => HEADLINE_ROW_KEYS.includes(r.key));
  const out: HeadlineDifference[] = [];
  for (const row of rows) {
    const winner = rowWinner(row, products);
    if (winner.tie || winner.winnerIds.length !== 1) continue;
    const winnerId = winner.winnerIds[0];
    const winnerProduct = products.find((p) => p.id === winnerId)!;
    const otherProducts = products.filter((p) => p.id !== winnerId);
    out.push({
      rowLabel: row.label,
      winnerId,
      winnerDisplay: row.display(winnerProduct),
      otherDisplays: otherProducts.map((p) => row.display(p)),
    });
  }
  return out;
}

/** Earliest (most conservative) last-checked date across every product, or null if none has one. */
export function earliestLastChecked(products: Product[]): string | null {
  const dates = products.map((p) => p.last_verified).filter((d): d is string => Boolean(d));
  if (dates.length === 0) return null;
  return dates.sort()[0];
}

export interface ComparisonIndexEntry {
  comparison: Comparison;
  /** The single most relevant use-case label, from the comparison's own curated relatedBestForSlugs — never inferred or guessed. */
  useCaseLabel: string | null;
}

const USE_CASE_LABELS: Record<string, string> = {
  "best-for-camping": "Camping",
  "best-for-rv": "RV",
  "best-for-refrigerator-backup": "Refrigerator backup",
  "best-for-home-backup": "Home backup",
};

/** Display order and copy for the /compare index page's category sections. */
const INDEX_CATEGORY_ORDER: IndexCategory[] = [
  "same-family",
  "~1000wh",
  "~2000wh",
  "high-capacity-home-backup",
  "portability-camping",
  "cross-brand",
];

const INDEX_CATEGORY_LABELS: Record<IndexCategory, string> = {
  "same-family": "Same-family models",
  "~1000wh": "~1,000 Wh class",
  "~2000wh": "~2,000 Wh class",
  "high-capacity-home-backup": "High-capacity home backup",
  "portability-camping": "Portability & camping",
  "cross-brand": "Cross-brand shootouts",
};

const INDEX_CATEGORY_BLURBS: Record<IndexCategory, string> = {
  "same-family":
    "Choosing between different sizes or generations within one manufacturer's own product line.",
  "~1000wh":
    "Compact, roughly 1,000 Wh stations usually sized around a single major appliance like a refrigerator.",
  "~2000wh":
    "Mid-size, roughly 2,000 Wh stations for home essentials, RV use or refrigerator backup with headroom to spare.",
  "high-capacity-home-backup":
    "Large, multi-kilowatt-hour stations aimed at extended, whole-home outage backup rather than portable use.",
  "portability-camping":
    "Compact, lightweight stations chosen mainly for carrying to a campsite, job site or daily errands.",
  "cross-brand":
    "Similar-capacity stations from different manufacturers, compared strictly on verified specs.",
};

/**
 * Groups every entry in COMPARISONS by its curated `indexCategory` for the
 * /compare index page. The category is an editorial label set on each
 * Comparison entry (not derived or guessed here), so a comparison always
 * lands in exactly one, explicit, human-decided section.
 */
export function groupComparisonsByCategory(comparisons: Comparison[]): {
  category: IndexCategory;
  label: string;
  blurb: string;
  entries: ComparisonIndexEntry[];
}[] {
  return INDEX_CATEGORY_ORDER.map((category) => ({
    category,
    label: INDEX_CATEGORY_LABELS[category],
    blurb: INDEX_CATEGORY_BLURBS[category],
    entries: comparisons
      .filter((c) => c.indexCategory === category)
      .map((comparison) => {
        const useCaseSlug = comparison.relatedBestForSlugs[0];
        return {
          comparison,
          useCaseLabel: useCaseSlug ? (USE_CASE_LABELS[useCaseSlug] ?? null) : null,
        };
      }),
  })).filter((g) => g.entries.length > 0);
}
