/**
 * Documented, configurable calculation assumptions.
 *
 * Every number here is an explicit engineering assumption made by PowerMatchLab,
 * NOT a measured result and NOT a manufacturer claim. The methodology page
 * renders this object verbatim so visitors can see exactly what we assume.
 */

export interface CalculatorAssumptions {
  /**
   * Round-trip / inverter efficiency: the share of nameplate battery energy that
   * actually reaches an AC device. Real figures vary with load, temperature and
   * inverter design; 0.85 is a conservative planning value.
   */
  systemEfficiency: number;
  /**
   * Reserve headroom kept above the raw requirement so the battery is not run
   * flat every cycle (protects cycle life and covers estimate error).
   */
  reserveFraction: number;
  /**
   * Default hours/day and days used when seeding a new device row.
   */
  defaultHoursPerDay: number;
  defaultDays: number;
  /**
   * When a device row has no explicit surge value we assume its surge draw is
   * this multiple of its running watts (used only if the user does not enter a
   * real figure).
   */
  assumedSurgeMultiplier: number;
}

export const DEFAULT_ASSUMPTIONS: CalculatorAssumptions = {
  systemEfficiency: 0.85,
  reserveFraction: 0.2,
  defaultHoursPerDay: 3,
  defaultDays: 1,
  assumedSurgeMultiplier: 2,
};

/** Efficiency assumption used for product-page runtime examples. */
export const RUNTIME_EFFICIENCY = 0.85;

export const ASSUMPTION_NOTES: Record<keyof CalculatorAssumptions, string> = {
  systemEfficiency:
    "Assumed usable share of nameplate capacity after inverter and conversion losses.",
  reserveFraction:
    "Extra capacity kept in reserve above the calculated requirement.",
  defaultHoursPerDay: "Starting hours-per-day value for a newly added device.",
  defaultDays: "Starting number of days of autonomy for a new calculation.",
  assumedSurgeMultiplier:
    "Fallback startup-surge multiple applied only when you do not enter a real surge value.",
};

export function clampAssumptions(input: Partial<CalculatorAssumptions>): CalculatorAssumptions {
  const merged = { ...DEFAULT_ASSUMPTIONS, ...input };
  return {
    systemEfficiency: clamp(merged.systemEfficiency, 0.5, 1),
    reserveFraction: clamp(merged.reserveFraction, 0, 0.9),
    defaultHoursPerDay: clamp(merged.defaultHoursPerDay, 0, 24),
    defaultDays: clamp(merged.defaultDays, 1, 30),
    assumedSurgeMultiplier: clamp(merged.assumedSurgeMultiplier, 1, 6),
  };
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}
