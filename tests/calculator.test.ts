import { describe, expect, it } from "vitest";
import {
  calculatePower,
  hasUsableInput,
  type DeviceInput,
} from "@/lib/calculator";

const dev = (over: Partial<DeviceInput> = {}): DeviceInput => ({
  id: over.id ?? "d1",
  name: over.name ?? "Device",
  watts: over.watts ?? 100,
  quantity: over.quantity ?? 1,
  hoursPerDay: over.hoursPerDay ?? 2,
  surgeWatts: over.surgeWatts ?? null,
});

describe("calculatePower — single device", () => {
  it("computes daily energy = watts * qty * hours", () => {
    const r = calculatePower([dev({ watts: 100, quantity: 1, hoursPerDay: 5 })], {
      days: 1,
    });
    expect(r.dailyEnergyWh).toBe(500);
    expect(r.requiredContinuousOutputW).toBe(100);
  });

  it("applies efficiency and reserve to the recommended capacity", () => {
    const r = calculatePower([dev({ watts: 100, quantity: 1, hoursPerDay: 10 })], {
      days: 1,
    });
    // 1000 Wh / 0.85 = 1176.47 -> rounded 1176
    expect(r.requiredUsableCapacityWh).toBe(1176);
    // 1176.47 * 1.2 = 1411.76 -> 1412
    expect(r.recommendedMinimumCapacityWh).toBe(1412);
  });

  it("multiplies energy by days of autonomy but not the output requirement", () => {
    const one = calculatePower([dev({ watts: 100, hoursPerDay: 5 })], { days: 1 });
    const three = calculatePower([dev({ watts: 100, hoursPerDay: 5 })], { days: 3 });
    expect(three.totalEnergyDemandWh).toBe(one.totalEnergyDemandWh * 3);
    expect(three.requiredContinuousOutputW).toBe(one.requiredContinuousOutputW);
  });
});

describe("calculatePower — multiple + custom devices", () => {
  it("sums continuous watts across devices (simultaneous assumption)", () => {
    const r = calculatePower(
      [
        dev({ id: "a", watts: 150, quantity: 1, hoursPerDay: 8 }),
        dev({ id: "b", watts: 60, quantity: 2, hoursPerDay: 4 }),
        dev({ id: "c", watts: 12, quantity: 1, hoursPerDay: 3 }),
      ],
      { days: 1 },
    );
    expect(r.requiredContinuousOutputW).toBe(150 + 120 + 12);
    expect(r.dailyEnergyWh).toBe(150 * 8 + 120 * 4 + 12 * 3);
  });

  it("handles an arbitrary custom device", () => {
    const r = calculatePower([dev({ watts: 733, quantity: 3, hoursPerDay: 1.5 })], {
      days: 2,
    });
    expect(r.requiredContinuousOutputW).toBe(2199);
    expect(r.dailyEnergyWh).toBe(Math.round(733 * 3 * 1.5));
    // Rounding is applied once, to the final figure.
    expect(r.totalEnergyDemandWh).toBe(Math.round(733 * 3 * 1.5 * 2));
  });
});

describe("calculatePower — surge handling", () => {
  it("uses explicit surge watts: largest surge delta + everything running", () => {
    const r = calculatePower(
      [
        dev({ id: "fridge", watts: 150, quantity: 1, hoursPerDay: 8, surgeWatts: 600 }),
        dev({ id: "tv", watts: 100, quantity: 1, hoursPerDay: 3 }),
      ],
      { days: 1 },
    );
    // running total 250; surge delta for fridge = 600 - 150 = 450
    expect(r.requiredSurgeOutputW).toBe(250 + 450);
    expect(r.hasSurgeData).toBe(true);
  });

  it("falls back to the surge multiplier when no explicit surge is given", () => {
    const r = calculatePower([dev({ watts: 200, quantity: 1, hoursPerDay: 1 })], {
      days: 1,
    });
    // fallback surge = 200 * 2 = 400; delta above running (200) = 200; total running 200
    expect(r.requiredSurgeOutputW).toBe(400);
    expect(r.hasSurgeData).toBe(false);
  });

  it("adds running watts for additional identical units before the surge", () => {
    const r = calculatePower(
      [dev({ watts: 100, quantity: 3, hoursPerDay: 1, surgeWatts: 500 })],
      { days: 1 },
    );
    // group surge = 500 + 100*2 = 700; continuous = 300; delta = 400; total running 300
    expect(r.requiredSurgeOutputW).toBe(700);
  });
});

describe("calculatePower — invalid input", () => {
  it("clamps negative and NaN values instead of producing NaN output", () => {
    const r = calculatePower(
      [
        dev({ watts: -50, quantity: -2, hoursPerDay: 99 }),
        dev({ id: "x", watts: Number.NaN, quantity: 1, hoursPerDay: 2 }),
      ],
      { days: -5 },
    );
    expect(Number.isNaN(r.dailyEnergyWh)).toBe(false);
    expect(r.dailyEnergyWh).toBe(0);
    expect(r.requiredContinuousOutputW).toBe(0);
    expect(r.recommendedMinimumCapacityWh).toBe(0);
  });

  it("caps hours per day at 24", () => {
    const r = calculatePower([dev({ watts: 10, quantity: 1, hoursPerDay: 1000 })], {
      days: 1,
    });
    expect(r.dailyEnergyWh).toBe(240);
  });

  it("hasUsableInput is false when nothing has real power", () => {
    expect(hasUsableInput([dev({ watts: 0 })])).toBe(false);
    expect(hasUsableInput([dev({ watts: 5, quantity: 1 })])).toBe(true);
  });
});
