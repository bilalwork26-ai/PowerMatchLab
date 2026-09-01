/**
 * Runtime estimator.
 *
 * estimated_runtime_hours = usable_energy_wh / device_power_w
 * usable_energy_wh        = capacity_wh * assumed_efficiency
 *
 * This is ALWAYS a calculation, never a testing claim. Callers must label
 * results "Estimated runtime".
 */

import { RUNTIME_EFFICIENCY } from "./assumptions";

export interface RuntimeExample {
  key: string;
  label: string;
  deviceWatts: number;
}

/** Generic example loads for product-page runtime tables. */
export const RUNTIME_EXAMPLES: RuntimeExample[] = [
  { key: "fridge", label: "Full-size refrigerator (~150 W avg)", deviceWatts: 150 },
  { key: "cpap", label: "CPAP machine (~40 W)", deviceWatts: 40 },
  { key: "laptop", label: "Laptop (~60 W)", deviceWatts: 60 },
  { key: "tv", label: "LED TV (~100 W)", deviceWatts: 100 },
  { key: "space-heater", label: "Space heater (~1500 W)", deviceWatts: 1500 },
];

export function estimateRuntimeHours(
  capacityWh: number | null,
  deviceWatts: number,
  efficiency: number = RUNTIME_EFFICIENCY,
): number | null {
  if (capacityWh == null || !Number.isFinite(capacityWh) || capacityWh <= 0) return null;
  if (!Number.isFinite(deviceWatts) || deviceWatts <= 0) return null;
  const usable = capacityWh * efficiency;
  return usable / deviceWatts;
}

export interface RuntimeRow {
  key: string;
  label: string;
  deviceWatts: number;
  hours: number | null;
}

export function buildRuntimeTable(
  capacityWh: number | null,
  efficiency: number = RUNTIME_EFFICIENCY,
  examples: RuntimeExample[] = RUNTIME_EXAMPLES,
): RuntimeRow[] {
  return examples.map((ex) => ({
    key: ex.key,
    label: ex.label,
    deviceWatts: ex.deviceWatts,
    hours: estimateRuntimeHours(capacityWh, ex.deviceWatts, efficiency),
  }));
}
