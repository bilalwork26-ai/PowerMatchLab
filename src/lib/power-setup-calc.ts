/**
 * Power Setup Studio — solar/battery simulation helpers.
 *
 * Pure, deterministic, and unit-tested, same discipline as calculator.ts.
 * The "current solar input" the visitor sets is an adjustable simulation of
 * instantaneous production, not a guarantee of energy across a whole day —
 * see the on-page copy this feeds and /about-methodology.
 */

import { RUNTIME_EFFICIENCY } from "./assumptions";

export interface SolarFlow {
  /** W of load not currently covered by solar; 0 when solar covers the load. */
  netDischargeW: number;
  /** W of solar production left over after covering the load; 0 when load exceeds solar. */
  netChargingW: number;
}

/**
 * net discharge = max(active load − current solar input, 0)
 * net charging  = max(current solar input − active load, 0)
 * Exactly one of the two is non-zero (or both are zero when load === solar).
 */
export function computeSolarFlow(activeLoadW: number, solarInputW: number): SolarFlow {
  const load = Math.max(0, activeLoadW);
  const solar = Math.max(0, solarInputW);
  return {
    netDischargeW: Math.max(0, load - solar),
    netChargingW: Math.max(0, solar - load),
  };
}

export type BatteryVisualState =
  | "charging"
  | "balanced"
  | "discharging"
  | "low"
  | "full";

export const BATTERY_STATE_LABELS: Record<BatteryVisualState, string> = {
  charging: "Charging",
  balanced: "Balanced",
  discharging: "Discharging",
  low: "Low battery",
  full: "Fully charged",
};

/**
 * The simulated battery level is a control the visitor sets, not a hardware
 * reading — see the "Simulated battery level" label wherever this is shown.
 */
export function getBatteryVisualState(params: {
  batteryStatePct: number;
  netChargingW: number;
  netDischargeW: number;
}): BatteryVisualState {
  const { batteryStatePct, netChargingW, netDischargeW } = params;
  if (batteryStatePct <= 15 && netChargingW <= netDischargeW) return "low";
  if (batteryStatePct >= 100 && netChargingW >= netDischargeW) return "full";
  if (netChargingW > netDischargeW) return "charging";
  if (netDischargeW > netChargingW) return "discharging";
  return "balanced";
}

/**
 * Rough autonomy estimate for a specific selected real product with a known
 * capacity, given the current simulated battery level and net discharge.
 * Returns null whenever there is nothing draining the battery right now
 * (solar covers or exceeds the load) — we never show a decreasing autonomy
 * number in that case, only "Net charging".
 *
 * capacity(Wh) × usable efficiency × battery state (0-1) ÷ net discharge (W)
 */
export function estimateAutonomyHours(params: {
  capacityWh: number | null;
  batteryStatePct: number;
  netDischargeW: number;
  efficiency?: number;
}): number | null {
  const {
    capacityWh,
    batteryStatePct,
    netDischargeW,
    efficiency = RUNTIME_EFFICIENCY,
  } = params;
  if (capacityWh == null || capacityWh <= 0) return null;
  if (netDischargeW <= 0) return null;
  const usableWh = capacityWh * efficiency * Math.max(0, Math.min(100, batteryStatePct)) / 100;
  return usableWh / netDischargeW;
}
