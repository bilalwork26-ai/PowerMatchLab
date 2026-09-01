import type { Product } from "@/types/product";
import {
  NOT_VERIFIED,
  fmtBool,
  fmtCount,
  fmtMs,
  fmtText,
  fmtWatts,
  fmtWh,
} from "@/lib/format";

export type BetterDirection = "higher" | "lower" | "none";

export interface CompareRow {
  key: string;
  label: string;
  group: string;
  /** Numeric value for winner detection, or null if not comparable/verified. */
  numeric: (p: Product) => number | null;
  /** Display string (null-safe). */
  display: (p: Product) => string;
  better: BetterDirection;
  /** Use-case keys for which this row is a priority (drives highlighting). */
  priorityFor?: string[];
}

export const COMPARE_ROWS: CompareRow[] = [
  {
    key: "capacity_wh",
    label: "Capacity (Wh)",
    group: "Energy & output",
    numeric: (p) => p.capacity_wh,
    display: (p) => fmtWh(p.capacity_wh),
    better: "higher",
    priorityFor: ["refrigerator-backup", "home-backup"],
  },
  {
    key: "rated_output_w",
    label: "Rated continuous output",
    group: "Energy & output",
    numeric: (p) => p.rated_output_w,
    display: (p) => fmtWatts(p.rated_output_w),
    better: "higher",
    priorityFor: ["home-backup", "rv"],
  },
  {
    key: "surge_output_w",
    label: "Surge / peak output",
    group: "Energy & output",
    numeric: (p) => p.surge_output_w,
    display: (p) => fmtWatts(p.surge_output_w),
    better: "higher",
    priorityFor: ["refrigerator-backup", "rv"],
  },
  {
    key: "max_expanded_capacity_wh",
    label: "Max expanded capacity",
    group: "Energy & output",
    numeric: (p) => p.max_expanded_capacity_wh,
    display: (p) => fmtWh(p.max_expanded_capacity_wh),
    better: "higher",
    priorityFor: ["home-backup"],
  },
  {
    key: "weight_kg",
    label: "Weight",
    group: "Portability",
    numeric: (p) => p.weight_kg,
    display: (p) =>
      p.weight_kg == null ? NOT_VERIFIED : `${p.weight_kg} kg`,
    better: "lower",
    priorityFor: ["camping"],
  },
  {
    key: "wh_per_kg",
    label: "Energy per kg (Wh/kg)",
    group: "Portability",
    numeric: (p) =>
      p.capacity_wh != null && p.weight_kg ? p.capacity_wh / p.weight_kg : null,
    display: (p) =>
      p.capacity_wh != null && p.weight_kg
        ? `${Math.round(p.capacity_wh / p.weight_kg)} Wh/kg`
        : NOT_VERIFIED,
    better: "higher",
    priorityFor: ["camping"],
  },
  {
    key: "idle_consumption_w",
    label: "Idle consumption",
    group: "Portability",
    numeric: (p) => p.idle_consumption_w,
    display: (p) =>
      p.idle_consumption_w == null ? NOT_VERIFIED : `${p.idle_consumption_w} W`,
    better: "lower",
    priorityFor: ["camping", "refrigerator-backup"],
  },
  {
    key: "solar_input_w",
    label: "Solar input (max)",
    group: "Charging",
    numeric: (p) => p.solar_input_w,
    display: (p) => fmtWatts(p.solar_input_w),
    better: "higher",
    priorityFor: ["refrigerator-backup", "camping"],
  },
  {
    key: "ac_charging_w",
    label: "AC charging (max)",
    group: "Charging",
    numeric: (p) => p.ac_charging_w,
    display: (p) => fmtWatts(p.ac_charging_w),
    better: "higher",
  },
  {
    key: "charging_time",
    label: "Charging time (stated)",
    group: "Charging",
    numeric: () => null,
    display: (p) => fmtText(p.charging_time),
    better: "none",
  },
  {
    key: "ac_outlets",
    label: "AC outlets",
    group: "Ports",
    numeric: (p) => p.ac_outlets,
    display: (p) => fmtCount(p.ac_outlets, "outlet"),
    better: "higher",
  },
  {
    key: "usb_c",
    label: "USB-C ports",
    group: "Ports",
    numeric: (p) => p.usb_c,
    display: (p) => fmtCount(p.usb_c, "port"),
    better: "higher",
    priorityFor: ["camping"],
  },
  {
    key: "usb_a",
    label: "USB-A ports",
    group: "Ports",
    numeric: (p) => p.usb_a,
    display: (p) => fmtCount(p.usb_a, "port"),
    better: "higher",
  },
  {
    key: "rv_tt30",
    label: "RV TT-30 outlet",
    group: "Ports",
    numeric: (p) => (p.rv_tt30 == null ? null : p.rv_tt30 ? 1 : 0),
    display: (p) => fmtBool(p.rv_tt30),
    better: "higher",
    priorityFor: ["rv"],
  },
  {
    key: "voltage_240v",
    label: "Native 120/240V",
    group: "Ports",
    numeric: (p) => (p.voltage_240v == null ? null : p.voltage_240v ? 1 : 0),
    display: (p) => fmtBool(p.voltage_240v),
    better: "higher",
    priorityFor: ["home-backup"],
  },
  {
    key: "ups_ms",
    label: "UPS switchover",
    group: "Backup",
    numeric: (p) => p.ups_ms,
    display: (p) => fmtMs(p.ups_ms),
    better: "lower",
    priorityFor: ["home-backup"],
  },
  {
    key: "expandable",
    label: "Expandable",
    group: "Backup",
    numeric: (p) => (p.expandable == null ? null : p.expandable ? 1 : 0),
    display: (p) => fmtBool(p.expandable),
    better: "higher",
    priorityFor: ["home-backup", "rv"],
  },
  {
    key: "cycle_life",
    label: "Cycle life (stated)",
    group: "Battery",
    numeric: () => null,
    display: (p) => fmtText(p.cycle_life),
    better: "none",
  },
  {
    key: "warranty",
    label: "Warranty (stated)",
    group: "Battery",
    numeric: () => null,
    display: (p) => fmtText(p.warranty),
    better: "none",
  },
];

export interface RowWinner {
  /** product ids that share the best verified value; empty when not comparable. */
  winnerIds: string[];
  tie: boolean;
}

export function rowWinner(row: CompareRow, products: Product[]): RowWinner {
  if (row.better === "none") return { winnerIds: [], tie: false };
  const vals = products
    .map((p) => ({ id: p.id, v: row.numeric(p) }))
    .filter((x): x is { id: string; v: number } => x.v != null);
  if (vals.length < 2) return { winnerIds: [], tie: false };
  const best =
    row.better === "higher"
      ? Math.max(...vals.map((x) => x.v))
      : Math.min(...vals.map((x) => x.v));
  const winnerIds = vals.filter((x) => x.v === best).map((x) => x.id);
  return { winnerIds, tie: winnerIds.length > 1 };
}
