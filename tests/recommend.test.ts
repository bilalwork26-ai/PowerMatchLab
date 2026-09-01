import { describe, expect, it } from "vitest";
import { calculatePower, type DeviceInput } from "@/lib/calculator";
import { recommendProducts } from "@/lib/recommend";
import { makeProduct } from "./helpers";

const load = (watts: number, hours: number, surge?: number): DeviceInput[] => [
  {
    id: "d",
    name: "Load",
    watts,
    quantity: 1,
    hoursPerDay: hours,
    surgeWatts: surge ?? null,
  },
];

describe("recommendProducts — hard failures", () => {
  it("marks a unit Not Suitable when rated output is below the continuous load", () => {
    const result = calculatePower(load(2000, 2), { days: 1 });
    const catalog = [
      makeProduct({
        id: "small",
        rated_output_w: 1500,
        capacity_wh: 8000,
        surge_output_w: 6000,
      }),
      makeProduct({
        id: "big",
        rated_output_w: 3000,
        capacity_wh: 8000,
        surge_output_w: 6000,
      }),
    ];
    const recs = recommendProducts(result, catalog);
    expect(recs.find((r) => r.product.id === "small")!.status).toBe("Not Suitable");
    expect(recs.find((r) => r.product.id === "big")!.status).not.toBe(
      "Not Suitable",
    );
  });

  it("marks a unit Not Suitable when capacity cannot cover required usable energy", () => {
    const result = calculatePower(load(200, 24), { days: 2 }); // ~9600 Wh demand
    const catalog = [
      makeProduct({ id: "tiny", capacity_wh: 1024, rated_output_w: 2000 }),
    ];
    const recs = recommendProducts(result, catalog);
    expect(recs[0].status).toBe("Not Suitable");
    expect(recs[0].meetsCapacity).toBe(false);
  });

  it("hard-fails a 240V requirement when the unit has no native 240V", () => {
    const result = calculatePower(load(300, 2), { days: 1 });
    const catalog = [
      makeProduct({ id: "no240", voltage_240v: false, capacity_wh: 4096 }),
      makeProduct({ id: "yes240", voltage_240v: true, capacity_wh: 4096 }),
    ];
    const recs = recommendProducts(result, catalog, { needs240V: true });
    expect(recs.find((r) => r.product.id === "no240")!.status).toBe(
      "Not Suitable",
    );
    expect(recs.find((r) => r.product.id === "yes240")!.status).not.toBe(
      "Not Suitable",
    );
  });
});

describe("recommendProducts — positive classification", () => {
  it("gives a comfortable unit Best or Good Match and orders it above weaker ones", () => {
    const result = calculatePower(load(300, 4), { days: 1 }); // 1200 Wh, 300 W
    const catalog = [
      makeProduct({
        id: "ideal",
        capacity_wh: 2048,
        rated_output_w: 2400,
        surge_output_w: 4000,
        weight_kg: 14,
        ac_charging_w: 1400,
        expandable: true,
        max_expanded_capacity_wh: 4096,
      }),
      makeProduct({
        id: "marginal",
        capacity_wh: 1500,
        rated_output_w: 400,
        surge_output_w: null,
        weight_kg: 20,
        ac_charging_w: 300,
      }),
    ];
    const recs = recommendProducts(result, catalog);
    const ideal = recs.find((r) => r.product.id === "ideal")!;
    expect(["Best Match", "Good Match"]).toContain(ideal.status);
    expect(recs[0].product.id).toBe("ideal");
  });

  it("can count expansion capacity toward the requirement when the visitor allows it", () => {
    const result = calculatePower(load(200, 20), { days: 1 }); // 4000 Wh demand
    const base = makeProduct({
      id: "exp",
      capacity_wh: 2048,
      rated_output_w: 2400,
      expandable: true,
      max_expanded_capacity_wh: 6000,
    });
    const withoutExpansion = recommendProducts(result, [base])[0];
    const withExpansion = recommendProducts(result, [base], {
      allowExpansionForCapacity: true,
    })[0];
    expect(withoutExpansion.meetsCapacity).toBe(false);
    expect(withExpansion.meetsCapacity).toBe(true);
    expect(withExpansion.consideredCapacityWh).toBe(6000);
  });

  it("flags unverified surge as a limitation without hard-failing", () => {
    const result = calculatePower(load(800, 2, 3000), { days: 1 });
    const catalog = [
      makeProduct({
        id: "nosurge",
        rated_output_w: 2000,
        surge_output_w: null,
        capacity_wh: 2048,
      }),
    ];
    const rec = recommendProducts(result, catalog)[0];
    expect(rec.status).not.toBe("Not Suitable");
    expect(rec.meetsSurge).toBeNull();
    expect(rec.limitations.join(" ")).toMatch(/surge/i);
  });
});
