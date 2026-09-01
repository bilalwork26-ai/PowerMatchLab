import { describe, expect, it } from "vitest";
import { estimateRuntimeHours, buildRuntimeTable } from "@/lib/runtime";

describe("estimateRuntimeHours", () => {
  it("uses capacity_wh * efficiency / device_watts", () => {
    expect(estimateRuntimeHours(1000, 100, 0.85)).toBeCloseTo(8.5, 5);
  });

  it("returns null when capacity is unknown", () => {
    expect(estimateRuntimeHours(null, 100)).toBeNull();
  });

  it("returns null for non-positive device watts", () => {
    expect(estimateRuntimeHours(1000, 0)).toBeNull();
    expect(estimateRuntimeHours(1000, -5)).toBeNull();
  });

  it("defaults to the documented 0.85 efficiency", () => {
    expect(estimateRuntimeHours(2000, 200)).toBeCloseTo(8.5, 5);
  });
});

describe("buildRuntimeTable", () => {
  it("marks every row null when capacity is unverified", () => {
    const rows = buildRuntimeTable(null);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.hours === null)).toBe(true);
  });

  it("produces positive runtimes for a known capacity", () => {
    const rows = buildRuntimeTable(2048);
    expect(rows.every((r) => (r.hours ?? 0) > 0)).toBe(true);
  });
});
