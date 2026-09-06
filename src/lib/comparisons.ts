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

/** True when both products have a non-null value for this row (a null field is neither a win nor a loss). */
export function isComparable(row: CompareRow, products: [Product, Product]): boolean {
  return products.every((p) => row.numeric(p) != null);
}

export interface CapacityParity {
  comparable: boolean;
  equal: boolean;
  display: string;
}

/** Whether the two products' registered capacity is comparable, and if so, whether it ties. */
export function capacityParity(products: [Product, Product]): CapacityParity {
  const row = COMPARE_ROWS.find((r) => r.key === "capacity_wh")!;
  const comparable = isComparable(row, products);
  const [a, b] = products;
  return {
    comparable,
    equal: comparable && row.numeric(a) === row.numeric(b),
    display: row.display(a),
  };
}

export function evaluateUseCases(products: [Product, Product]): UseCaseVerdict[] {
  const [a, b] = products;

  return VERDICT_CONFIG.map(({ key, label, rowKeys }) => {
    const rows = COMPARE_ROWS.filter((r) => rowKeys.includes(r.key));
    const isSingleCriterionCategory = rows.length === 1;

    const comparableRows = rows.filter((r) => isComparable(r, products));
    const decisive = comparableRows
      .map((row) => ({ row, result: rowWinner(row, products) }))
      .filter((d) => !d.result.tie && d.result.winnerIds.length === 1);

    const tally: Record<string, number> = { [a.id]: 0, [b.id]: 0 };
    for (const d of decisive) tally[d.result.winnerIds[0]] += 1;

    let winnerId: string | null = null;
    let note: string | null = null;

    if (isSingleCriterionCategory || decisive.length >= 2) {
      // Either this category's entire criterion is one row (legitimately
      // decidable from it alone), or at least two independent rows agree —
      // enough signal for an overall verdict.
      winnerId = tally[a.id] === tally[b.id] ? null : tally[a.id] > tally[b.id] ? a.id : b.id;
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
            } not verified for one or both units.`
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

export function buildComparisonRuntimeRows(
  products: [Product, Product],
): ComparisonRuntimeRow[] {
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
  loserDisplay: string;
}

export function headlineDifferences(products: [Product, Product]): HeadlineDifference[] {
  const rows = COMPARE_ROWS.filter((r) => HEADLINE_ROW_KEYS.includes(r.key));
  const out: HeadlineDifference[] = [];
  for (const row of rows) {
    const winner = rowWinner(row, products);
    if (winner.tie || winner.winnerIds.length !== 1) continue;
    const winnerId = winner.winnerIds[0];
    const winnerProduct = products.find((p) => p.id === winnerId)!;
    const loserProduct = products.find((p) => p.id !== winnerId)!;
    out.push({
      rowLabel: row.label,
      winnerId,
      winnerDisplay: row.display(winnerProduct),
      loserDisplay: row.display(loserProduct),
    });
  }
  return out;
}

/** Earliest (most conservative) last-checked date across both products, or null if neither has one. */
export function earliestLastChecked(products: [Product, Product]): string | null {
  const dates = products.map((p) => p.last_verified).filter((d): d is string => Boolean(d));
  if (dates.length === 0) return null;
  return dates.sort()[0];
}
