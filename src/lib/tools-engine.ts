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

import { sanitizeAutonomyDays, type CalculatorResult } from "./calculator";

function sanitizeNonNegative(value: number, max = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 0;
  return Math.min(max, Math.max(0, value));
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
  const daysUsed = sanitizeAutonomyDays(days);
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

/**
 * Converts a directly-known daily energy figure (e.g. read from an
 * EnergyGuide label, or measured with a 24-hour plug-in energy meter) into
 * the `watts` / `hoursPerDay` pair `calculator.ts` already expects — WITHOUT
 * adding a second code path to the calculation engine itself. Modeling it as
 * a flat 24-hour average (`watts = dailyEnergyWh / 24`, `hoursPerDay = 24`)
 * reproduces the exact same `dailyEnergyWh` the engine would compute
 * (`watts × hoursPerDay = dailyEnergyWh`), so every downstream formula
 * (capacity, reserve, solar offset) is untouched and already covered by the
 * existing calculator.ts test suite.
 *
 * `kWh` is converted to `Wh` (×1000) before this — see {@link kwhToWh}.
 */
export function deriveWattsAndHoursFromDailyEnergy(dailyEnergyWh: number): {
  watts: number;
  hoursPerDay: number;
} {
  const safeWh = Number.isFinite(dailyEnergyWh) && dailyEnergyWh > 0 ? dailyEnergyWh : 0;
  return { watts: safeWh / 24, hoursPerDay: 24 };
}

/** Exact, unrounded kWh → Wh conversion (×1000). */
export function kwhToWh(kwh: number): number {
  if (!Number.isFinite(kwh) || kwh <= 0) return 0;
  return kwh * 1000;
}

/**
 * The three units a visitor might reasonably have their refrigerator's daily
 * energy figure in. `kWhYear` exists specifically because the US
 * EnergyGuide label required on refrigerators shows ANNUAL kWh/year, not a
 * daily figure — see {@link dailyEnergyUnitToWh}.
 */
export type DailyEnergyUnit = "Wh" | "kWh" | "kWhYear";

/**
 * Converts a value entered in any of the three supported daily-energy units
 * into Wh/day — the one place the annual→daily conversion happens.
 *
 * This exists because a US EnergyGuide label almost always states annual
 * consumption in kWh/year, not a daily kWh or Wh figure. Treating that
 * annual number as if it were already daily (e.g. entering "438" under
 * "kWh/day") would overstate daily consumption by roughly 365×, so `kWhYear`
 * is its own explicit unit rather than folded into `kWh`, and divides by
 * 365 here rather than asking the visitor to do that math themselves.
 */
export function dailyEnergyUnitToWh(value: number, unit: DailyEnergyUnit): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  switch (unit) {
    case "Wh":
      return value;
    case "kWh":
      return kwhToWh(value);
    case "kWhYear":
      return kwhToWh(value) / 365;
  }
}

export interface SolarEstimateInput {
  /** Rated solar panel wattage (nameplate, at standard test conditions). */
  panelWatts: number;
  /** "Peak sun hours" per day — not clock hours of daylight, see the tool copy for the distinction. */
  peakSunHours: number;
  /**
   * Fraction of the panel's rated output actually realized in the field
   * (angle, temperature, haze, wiring/charge-controller losses). A
   * PowerMatchLab-documented planning assumption, not a manufacturer figure
   * — see ASSUMPTION_NOTES-style copy at the call site.
   */
  realizationFraction: number;
}

/**
 * Rough daily solar Wh estimate from panel specs — purely a convenience to
 * PRE-FILL the existing single "daily solar recharge (Wh)" field that
 * `applySolarOffset` already consumes; it does not introduce a second solar
 * model. The visitor can always overwrite the resulting number by hand.
 */
export function estimateDailySolarWh(input: SolarEstimateInput): number {
  const panelWatts = sanitizeNonNegative(input.panelWatts, 100_000);
  const peakSunHours = sanitizeNonNegative(input.peakSunHours, 24);
  const realizationFraction = Number.isFinite(input.realizationFraction)
    ? Math.min(1, Math.max(0, input.realizationFraction))
    : 0.7;
  return panelWatts * peakSunHours * realizationFraction;
}

export interface ProductSolarCapInput extends SolarEstimateInput {
  /** The specific product's own verified max solar charging input, in watts — null when unverified. */
  productSolarInputW: number | null;
}

/**
 * Caps a panel-spec solar estimate to ONE SPECIFIC product's own verified
 * solar input rating. A 1,000 W array cannot charge a station with only a
 * 200 W solar input port any faster than that 200 W port allows, so the
 * same panel spec produces a different realistic daily contribution for
 * every product — never one global number applied uniformly.
 *
 * Returns `null` when the product's own solar input rating is unverified:
 * an unknown limit is never assumed to be "no limit" (i.e. the full,
 * uncapped panel wattage), since that would let a missing spec silently
 * inflate that product's estimated autonomy or standing versus a product
 * whose (possibly much lower) rating IS verified.
 */
export function estimateProductDailySolarWh(input: ProductSolarCapInput): number | null {
  if (input.productSolarInputW == null) return null;
  const cappedPanelWatts = Math.min(
    sanitizeNonNegative(input.panelWatts, 100_000),
    sanitizeNonNegative(input.productSolarInputW, 100_000),
  );
  return estimateDailySolarWh({
    panelWatts: cappedPanelWatts,
    peakSunHours: input.peakSunHours,
    realizationFraction: input.realizationFraction,
  });
}

/** Closed enum for the `calculator_type` analytics parameter — see analytics.ts. */
export type ToolCalculatorType =
  | "power_calculator"
  | "refrigerator_runtime"
  | "cpap_battery"
  | "rv_power"
  | "rv_ac_runtime"
  | "starlink_runtime"
  | "home_backup";
