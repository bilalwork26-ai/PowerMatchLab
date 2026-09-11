/**
 * Shared composition layer for the /tools calculator hub.
 *
 * This deliberately does NOT reimplement power/energy math — it composes the
 * already-unit-tested primitives in `calculator.ts` (continuous/surge/daily
 * energy/usable capacity/reserve) and `recommend.ts` (product classification)
 * so every specialized tool (Refrigerator, CPAP, RV, Starlink, Home Backup)
 * calls the same functions the general Power Calculator does. A future fix
 * to the shared formulas in those two files propagates to every tool
 * automatically, and to this file's own solar/autonomy helpers.
 *
 * Everything here is a calculation from the numbers the visitor enters plus
 * documented assumptions — never a measured or guaranteed result.
 */

import type { CalculatorResult } from "./calculator";

function sanitizeNonNegative(value: number, max = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 0;
  return Math.min(max, Math.max(0, value));
}

function sanitizeDays(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 1;
  return Math.min(30, Math.max(1, value));
}

export interface SolarAdjustedResult {
  /** Sanitized daily solar contribution actually used below (Wh/day). */
  dailySolarWh: number;
  /** Energy still needed from the battery each day after solar helps. */
  netDailyEnergyWh: number;
  /** Same value, named for on-page "daily deficit" copy (RV/Home Backup). */
  dailyDeficitWh: number;
  /** True when the stated solar contribution covers the full daily need. */
  fullyOffsetBySolar: boolean;
  /** How much of the daily energy need solar actually covers, in Wh. */
  solarContributionWh: number;
  /** Net energy demand across the whole autonomy window, after solar. */
  netTotalEnergyDemandWh: number;
  netRequiredUsableCapacityWh: number;
  netRecommendedMinimumCapacityWh: number;
}

/**
 * Applies a daily solar recharge estimate on top of an existing
 * `calculatePower` result. Solar is modeled as reducing the energy that must
 * come from the battery EACH DAY (it recharges daily during a multi-day
 * outage) — it never reduces the instantaneous continuous/surge power
 * requirement, which solar input alone cannot guarantee.
 *
 * Returns the same shape whether or not solar is actually used (0 Wh/day of
 * solar is a valid, common input and simply reproduces the no-solar numbers).
 */
export function applySolarOffset(
  result: Pick<CalculatorResult, "dailyEnergyWh" | "assumptions">,
  dailySolarWh: number,
  days: number,
): SolarAdjustedResult {
  const solar = sanitizeNonNegative(dailySolarWh, 100_000);
  const daysUsed = sanitizeDays(days);
  const dailyEnergyWh = sanitizeNonNegative(result.dailyEnergyWh, 1_000_000);

  const solarContributionWh = Math.min(solar, dailyEnergyWh);
  const netDailyEnergyWh = Math.max(0, dailyEnergyWh - solar);
  const netTotalEnergyDemandWh = netDailyEnergyWh * daysUsed;
  const netRequiredUsableCapacityWh =
    netTotalEnergyDemandWh / result.assumptions.systemEfficiency;
  const netRecommendedMinimumCapacityWh =
    netRequiredUsableCapacityWh * (1 + result.assumptions.reserveFraction);

  return {
    dailySolarWh: solar,
    netDailyEnergyWh: Math.round(netDailyEnergyWh),
    dailyDeficitWh: Math.round(netDailyEnergyWh),
    fullyOffsetBySolar: dailyEnergyWh > 0 && solar >= dailyEnergyWh,
    solarContributionWh: Math.round(solarContributionWh),
    netTotalEnergyDemandWh: Math.round(netTotalEnergyDemandWh),
    netRequiredUsableCapacityWh: Math.round(netRequiredUsableCapacityWh),
    netRecommendedMinimumCapacityWh: Math.round(netRecommendedMinimumCapacityWh),
  };
}

/**
 * Builds a `CalculatorResult`-shaped object for `recommendProducts` that uses
 * the solar-adjusted capacity requirement instead of the raw one, while
 * leaving continuous/surge output requirements untouched (solar input does
 * not, by itself, change how much instantaneous power a product must
 * deliver).
 */
export function withSolarAdjustedCapacity(
  result: CalculatorResult,
  adjusted: SolarAdjustedResult,
): CalculatorResult {
  return {
    ...result,
    requiredUsableCapacityWh: adjusted.netRequiredUsableCapacityWh,
    recommendedMinimumCapacityWh: adjusted.netRecommendedMinimumCapacityWh,
  };
}

/**
 * How many whole "units" of autonomy (days, nights, charge cycles — whatever
 * the caller's `dailyEnergyWh` represents one unit of) a given product's own
 * capacity would realistically provide, at the stated system efficiency.
 * Returns null when the product's capacity isn't verified or the daily
 * energy figure is not a usable positive number — we never divide by zero
 * or invent a number for missing data.
 */
export function estimateAutonomyUnits(
  capacityWh: number | null,
  dailyEnergyWh: number,
  efficiency: number,
): number | null {
  if (capacityWh == null || !Number.isFinite(capacityWh) || capacityWh <= 0) return null;
  if (!Number.isFinite(dailyEnergyWh) || dailyEnergyWh <= 0) return null;
  if (!Number.isFinite(efficiency) || efficiency <= 0) return null;
  const usableWh = capacityWh * efficiency;
  return usableWh / dailyEnergyWh;
}

/** Closed enum for the `calculator_type` analytics parameter — see analytics.ts. */
export type ToolCalculatorType =
  | "power_calculator"
  | "refrigerator_runtime"
  | "cpap_battery"
  | "rv_power"
  | "starlink_runtime"
  | "home_backup";
