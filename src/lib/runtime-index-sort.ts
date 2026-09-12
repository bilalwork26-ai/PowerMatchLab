/**
 * Pure sort/filter logic for the Runtime Index table (see
 * components/tools/RuntimeIndexTable.tsx). Kept separate from the component
 * so the ordering/filtering behavior is unit-testable without rendering
 * React — the component itself only calls these two functions.
 */

import type { MatchStatus, Recommendation } from "./recommend";

export type RuntimeIndexSortKey =
  | "autonomy"
  | "capacity"
  | "continuousOutput"
  | "surge"
  | "weight"
  | "solarInput"
  | "proportionality"
  | "status";

export type SortDirection = "asc" | "desc";

/** null/unverified values always sort to the end, regardless of direction — an unknown spec is never "the biggest" or "the smallest". */
function compareNullable(
  a: number | null,
  b: number | null,
  direction: SortDirection,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return direction === "asc" ? a - b : b - a;
}

const STATUS_ORDER: Record<MatchStatus, number> = {
  "Best Fit": 0,
  "Good Fit": 1,
  Oversized: 2,
  "Possible Match": 3,
  "Not Suitable": 4,
};

export function sortRuntimeIndexRows(
  rows: Recommendation[],
  autonomyByProductId: ReadonlyMap<string, number | null>,
  sortKey: RuntimeIndexSortKey,
  direction: SortDirection,
): Recommendation[] {
  const withIndex = rows.map((rec, index) => ({ rec, index }));
  withIndex.sort((a, b) => {
    const cmp = compareRuntimeIndexRows(a.rec, b.rec, autonomyByProductId, sortKey, direction);
    // Stable sort: ties keep their original relative order (recommendProducts'
    // own status/fitScore ordering) instead of an arbitrary swap.
    return cmp !== 0 ? cmp : a.index - b.index;
  });
  return withIndex.map((w) => w.rec);
}

function compareRuntimeIndexRows(
  a: Recommendation,
  b: Recommendation,
  autonomyByProductId: ReadonlyMap<string, number | null>,
  sortKey: RuntimeIndexSortKey,
  direction: SortDirection,
): number {
  switch (sortKey) {
    case "autonomy":
      return compareNullable(
        autonomyByProductId.get(a.product.id) ?? null,
        autonomyByProductId.get(b.product.id) ?? null,
        direction,
      );
    case "capacity":
      return compareNullable(a.product.capacity_wh, b.product.capacity_wh, direction);
    case "continuousOutput":
      return compareNullable(a.product.rated_output_w, b.product.rated_output_w, direction);
    case "surge":
      return compareNullable(a.product.surge_output_w, b.product.surge_output_w, direction);
    case "weight":
      return compareNullable(a.product.weight_kg, b.product.weight_kg, direction);
    case "solarInput":
      return compareNullable(a.product.solar_input_w, b.product.solar_input_w, direction);
    case "proportionality":
      return compareNullable(a.capacityRatio, b.capacityRatio, direction);
    case "status": {
      const diff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      return direction === "asc" ? diff : -diff;
    }
  }
}

export function filterRuntimeIndexRows(
  rows: Recommendation[],
  statusFilter: MatchStatus | "all",
): Recommendation[] {
  if (statusFilter === "all") return rows;
  return rows.filter((r) => r.status === statusFilter);
}
