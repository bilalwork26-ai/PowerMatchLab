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
  /** Number of days the station must last without recharging. */
  days: number;
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
  const days = sanitizeNumber(usage.days, { min: 1, max: 30 }) || 1;

  const devices = devicesInput.map((d) => buildDeviceBreakdown(d, assumptions));

  const activeDevices = devices.filter((d) => d.quantity > 0 && d.watts > 0);

  const requiredContinuousOutputW = activeDevices.reduce(
    (sum, d) => sum + d.continuousWatts,
    0,
  );

  const totalRunning = requiredContinuousOutputW;
  // Biggest single "surge delta" above the always-running baseline.
  const maxSurgeDelta = activeDevices.reduce((max, d) => {
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
