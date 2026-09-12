/**
 * Power Calculator core math. Pure, deterministic, and unit-tested.
 *
 * Everything here is a PowerMatchLab CALCULATION derived from the numbers the
 * visitor enters plus the documented assumptions in `assumptions.ts`. None of it
 * is a measured or guaranteed result.
 */

import {
  type CalculatorAssumptions,
  DEFAULT_ASSUMPTIONS,
  clampAssumptions,
} from "./assumptions";

export interface DeviceInput {
  id: string;
  name: string;
  /** Running power draw in watts. */
  watts: number;
  quantity: number;
  hoursPerDay: number;
  /** Optional real startup/surge watts for a single unit. */
  surgeWatts?: number | null;
  /**
   * Whether this device is assumed to run at the same time as the other
   * devices in the list, for the purposes of continuous/surge power sizing.
   * Defaults to `true` (every existing caller's behavior, unchanged) — a
   * device only needs setting to `false` when the visitor has explicitly
   * said it never overlaps with the rest (e.g. "cargas que pueden
   * coincidir" in the Home Backup and RV calculators). It still counts
   * fully toward daily/total energy either way, since energy is consumed
   * regardless of what else happens to be running at the same instant.
   */
  simultaneous?: boolean;
}

export interface DeviceBreakdown extends DeviceInput {
  /** watts * quantity */
  continuousWatts: number;
  /** watts * quantity * hoursPerDay */
  dailyEnergyWh: number;
  /** Effective surge for the whole group of this device. */
  groupSurgeWatts: number;
}

export interface UsageInput {
  /**
   * Number of days the station must last without recharging. Accepts a
   * fraction below 1 (down to MIN_DAYS, one hour) so a short, sub-day
   * outage can be entered precisely — e.g. a caller offering an "hours"
   * input converts hours ÷ 24 before calling calculatePower rather than
   * always rounding a 6-hour outage up to a full day.
   */
  days: number;
}

/** One hour, expressed in days — the smallest autonomy window calculatePower will size for. */
export const MIN_DAYS = 1 / 24;

/**
 * Sanitizes an autonomy-duration input, in days, for calculatePower and its
 * callers (applySolarOffset, the shareable-URL codec).
 *
 * A valid POSITIVE value is clamped into [MIN_DAYS, 30] — a sub-hour value
 * (e.g. 0.001) is rounded UP to one hour rather than rejected, since it's a
 * real (if very short) outage the visitor is trying to size for.
 *
 * Zero, negative, NaN or Infinite values are a different case: they are not
 * "an extremely short but real" duration, they are missing/invalid input.
 * Falling back to MIN_DAYS (one hour) for those would silently undersize a
 * recommendation to a fraction of what a caller passing bad data actually
 * intended — before MIN_DAYS existed, this engine's safe default for
 * invalid input was one full day, and this keeps that same safe default.
 */
export function sanitizeAutonomyDays(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.min(30, Math.max(MIN_DAYS, value));
}

export interface CalculatorResult {
  devices: DeviceBreakdown[];
  assumptions: CalculatorAssumptions;

  /** Sum of continuous watts across every device (assumes simultaneous use). */
  requiredContinuousOutputW: number;
  /** Largest realistic instantaneous demand: biggest single surge + the rest running. */
  requiredSurgeOutputW: number;

  /** Energy the devices consume in one day. */
  dailyEnergyWh: number;
  /** Energy the devices consume across the whole autonomy window. */
  totalEnergyDemandWh: number;

  /**
   * Battery energy that must be *usable* to cover the demand, i.e. demand
   * divided by system efficiency.
   */
  requiredUsableCapacityWh: number;
  /**
   * Recommended minimum nameplate capacity: usable requirement plus reserve
   * headroom.
   */
  recommendedMinimumCapacityWh: number;

  hasSurgeData: boolean;
}

export function emptyDevice(id: string): DeviceInput {
  return {
    id,
    name: "",
    watts: 0,
    quantity: 1,
    hoursPerDay: DEFAULT_ASSUMPTIONS.defaultHoursPerDay,
    surgeWatts: null,
  };
}

function sanitizeNumber(value: number, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function buildDeviceBreakdown(
  device: DeviceInput,
  assumptions: CalculatorAssumptions,
): DeviceBreakdown {
  const watts = sanitizeNumber(device.watts, { max: 100_000 });
  const quantity = sanitizeNumber(device.quantity, { min: 0, max: 999 });
  const hoursPerDay = sanitizeNumber(device.hoursPerDay, { min: 0, max: 24 });

  const continuousWatts = watts * quantity;
  const dailyEnergyWh = continuousWatts * hoursPerDay;

  const perUnitSurge =
    device.surgeWatts != null && Number.isFinite(device.surgeWatts) && device.surgeWatts > 0
      ? device.surgeWatts
      : watts * assumptions.assumedSurgeMultiplier;

  // When several identical units start, assume ONE unit surges while the rest
  // are already running (a deliberately conservative-but-not-worst-case model).
  const groupSurgeWatts =
    quantity <= 0 ? 0 : perUnitSurge + watts * Math.max(0, quantity - 1);

  return {
    ...device,
    watts,
    quantity,
    hoursPerDay,
    continuousWatts,
    dailyEnergyWh,
    groupSurgeWatts,
  };
}

export function calculatePower(
  devicesInput: DeviceInput[],
  usage: UsageInput,
  assumptionsInput: Partial<CalculatorAssumptions> = {},
): CalculatorResult {
  const assumptions = clampAssumptions(assumptionsInput);
  const days = sanitizeAutonomyDays(usage.days);

  const devices = devicesInput.map((d) => buildDeviceBreakdown(d, assumptions));

  const activeDevices = devices.filter((d) => d.quantity > 0 && d.watts > 0);
  // Only devices assumed to run at the same time as everything else count
  // toward the simultaneous continuous/surge power requirement.
  const simultaneousDevices = activeDevices.filter((d) => d.simultaneous !== false);

  const requiredContinuousOutputW = simultaneousDevices.reduce(
    (sum, d) => sum + d.continuousWatts,
    0,
  );

  const totalRunning = requiredContinuousOutputW;
  // Biggest single "surge delta" above the always-running baseline.
  const maxSurgeDelta = simultaneousDevices.reduce((max, d) => {
    const delta = d.groupSurgeWatts - d.continuousWatts;
    return delta > max ? delta : max;
  }, 0);
  const requiredSurgeOutputW = Math.round(totalRunning + maxSurgeDelta);

  const dailyEnergyWh = activeDevices.reduce((sum, d) => sum + d.dailyEnergyWh, 0);
  const totalEnergyDemandWh = dailyEnergyWh * days;

  const requiredUsableCapacityWh =
    totalEnergyDemandWh / assumptions.systemEfficiency;
  const recommendedMinimumCapacityWh =
    requiredUsableCapacityWh * (1 + assumptions.reserveFraction);

  const hasSurgeData = devicesInput.some(
    (d) => d.surgeWatts != null && Number.isFinite(d.surgeWatts) && (d.surgeWatts ?? 0) > 0,
  );

  return {
    devices,
    assumptions,
    requiredContinuousOutputW: Math.round(requiredContinuousOutputW),
    requiredSurgeOutputW,
    dailyEnergyWh: Math.round(dailyEnergyWh),
    totalEnergyDemandWh: Math.round(totalEnergyDemandWh),
    requiredUsableCapacityWh: Math.round(requiredUsableCapacityWh),
    recommendedMinimumCapacityWh: Math.round(recommendedMinimumCapacityWh),
    hasSurgeData,
  };
}

export function hasUsableInput(devices: DeviceInput[]): boolean {
  return devices.some((d) => d.watts > 0 && d.quantity > 0);
}
