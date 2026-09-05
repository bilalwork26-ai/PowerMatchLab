import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  STUDIO_SCENARIOS,
  getStudioScenario,
  resolveApplianceInstance,
} from "@/lib/power-setup-scenarios";
import { getApplianceExample } from "@/lib/appliances";
import { calculatePower, type DeviceInput } from "@/lib/calculator";
import { recommendProducts } from "@/lib/recommend";
import { resolveAmazonLink } from "@/lib/amazon";
import { getAllProducts, getProductById } from "@/data/products";
import {
  computeSolarFlow,
  getBatteryVisualState,
  estimateAutonomyHours,
} from "@/lib/power-setup-calc";

const catalog = getAllProducts();

describe("Power Setup Studio — scenario data integrity", () => {
  it("has exactly the 5 required scenarios", () => {
    expect(STUDIO_SCENARIOS).toHaveLength(5);
    expect(STUDIO_SCENARIOS.map((s) => s.id).sort()).toEqual(
      ["camping", "home-backup", "power-outage", "remote-work", "van-life"].sort(),
    );
  });

  it("every scenario appliance instance resolves to a real, existing appliance example", () => {
    for (const scenario of STUDIO_SCENARIOS) {
      for (const instance of scenario.appliances) {
        expect(
          getApplianceExample(instance.applianceKey),
          `${scenario.id}/${instance.id} references unknown appliance key "${instance.applianceKey}"`,
        ).toBeDefined();
        expect(() => resolveApplianceInstance(instance)).not.toThrow();
      }
    }
  });

  it("has no duplicate appliance instance ids within a scenario", () => {
    for (const scenario of STUDIO_SCENARIOS) {
      const ids = scenario.appliances.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("getStudioScenario resolves every known id and returns undefined for an unknown one", () => {
    for (const scenario of STUDIO_SCENARIOS) {
      expect(getStudioScenario(scenario.id)?.id).toBe(scenario.id);
    }
    expect(getStudioScenario("not-a-real-scenario")).toBeUndefined();
  });

  it("power-outage has no solar anchor because its illustration shows no panel", () => {
    expect(getStudioScenario("power-outage")!.solarAnchor).toBeNull();
  });

  it("every other scenario has a solar anchor", () => {
    for (const id of ["home-backup", "camping", "van-life", "remote-work"]) {
      expect(getStudioScenario(id)!.solarAnchor).not.toBeNull();
    }
  });
});

describe("Power Setup Studio — active load & daily energy", () => {
  it("sums running watts × quantity only for devices that are switched on", () => {
    const devices: DeviceInput[] = [
      { id: "a", name: "A", watts: 150, quantity: 1, hoursPerDay: 8, surgeWatts: null },
      { id: "b", name: "B", watts: 18, quantity: 1, hoursPerDay: 24, surgeWatts: null },
    ];
    const result = calculatePower(devices, { days: 1 });
    expect(result.requiredContinuousOutputW).toBe(150 + 18);
    expect(result.dailyEnergyWh).toBe(150 * 8 + 18 * 24);
  });

  it("excludes a device entirely once it is switched off (removed before calculation)", () => {
    const allOn: DeviceInput[] = [
      { id: "a", name: "A", watts: 150, quantity: 1, hoursPerDay: 8, surgeWatts: null },
      { id: "b", name: "B", watts: 100, quantity: 1, hoursPerDay: 3, surgeWatts: null },
    ];
    const bOff = allOn.filter((d) => d.id !== "b");
    const withBoth = calculatePower(allOn, { days: 1 });
    const withoutB = calculatePower(bOff, { days: 1 });
    expect(withoutB.requiredContinuousOutputW).toBe(150);
    expect(withoutB.requiredContinuousOutputW).toBeLessThan(withBoth.requiredContinuousOutputW);
  });

  it("applies the project's documented 85% efficiency and 20% reserve headroom", () => {
    const devices: DeviceInput[] = [
      { id: "a", name: "A", watts: 100, quantity: 1, hoursPerDay: 10, surgeWatts: null },
    ];
    const result = calculatePower(devices, { days: 1 });
    // 1000 Wh / 0.85 = 1176.47 -> rounded 1176; * 1.2 = 1411.76 -> 1412
    expect(result.requiredUsableCapacityWh).toBe(1176);
    expect(result.recommendedMinimumCapacityWh).toBe(1412);
  });
});

describe("Power Setup Studio — solar net flow", () => {
  it("reports net discharge when load exceeds solar", () => {
    const flow = computeSolarFlow(300, 120);
    expect(flow.netDischargeW).toBe(180);
    expect(flow.netChargingW).toBe(0);
  });

  it("reports net charging when solar exceeds load, never a negative discharge", () => {
    const flow = computeSolarFlow(120, 300);
    expect(flow.netChargingW).toBe(180);
    expect(flow.netDischargeW).toBe(0);
  });

  it("reports both as zero when load exactly matches solar", () => {
    const flow = computeSolarFlow(200, 200);
    expect(flow.netChargingW).toBe(0);
    expect(flow.netDischargeW).toBe(0);
  });
});

describe("Power Setup Studio — battery visual state", () => {
  it("is 'charging' when net charging exceeds net discharge", () => {
    expect(
      getBatteryVisualState({ batteryStatePct: 50, netChargingW: 100, netDischargeW: 0 }),
    ).toBe("charging");
  });

  it("is 'discharging' when net discharge exceeds net charging", () => {
    expect(
      getBatteryVisualState({ batteryStatePct: 50, netChargingW: 0, netDischargeW: 100 }),
    ).toBe("discharging");
  });

  it("is 'balanced' when neither net flow dominates", () => {
    expect(
      getBatteryVisualState({ batteryStatePct: 50, netChargingW: 0, netDischargeW: 0 }),
    ).toBe("balanced");
  });

  it("is 'low' at a low simulated level while discharging", () => {
    expect(
      getBatteryVisualState({ batteryStatePct: 10, netChargingW: 0, netDischargeW: 50 }),
    ).toBe("low");
  });

  it("is 'full' at 100% while charging or balanced", () => {
    expect(
      getBatteryVisualState({ batteryStatePct: 100, netChargingW: 50, netDischargeW: 0 }),
    ).toBe("full");
  });
});

describe("Power Setup Studio — autonomy estimate never decreases when solar covers the load", () => {
  it("returns null (no autonomy figure shown) when net discharge is zero", () => {
    const hours = estimateAutonomyHours({
      capacityWh: 1000,
      batteryStatePct: 80,
      netDischargeW: 0,
    });
    expect(hours).toBeNull();
  });

  it("returns null when the product's capacity is not verified", () => {
    const hours = estimateAutonomyHours({
      capacityWh: null,
      batteryStatePct: 80,
      netDischargeW: 100,
    });
    expect(hours).toBeNull();
  });

  it("computes capacity × efficiency × battery state ÷ net discharge when discharging", () => {
    const hours = estimateAutonomyHours({
      capacityWh: 1000,
      batteryStatePct: 100,
      netDischargeW: 85,
    });
    // 1000 * 0.85 * 1.0 / 85 = 10
    expect(hours).toBeCloseTo(10, 5);
  });

  it("scales down with a lower simulated battery level", () => {
    const full = estimateAutonomyHours({ capacityWh: 1000, batteryStatePct: 100, netDischargeW: 85 });
    const half = estimateAutonomyHours({ capacityWh: 1000, batteryStatePct: 50, netDischargeW: 85 });
    expect(half).toBeCloseTo(full! / 2, 5);
  });
});

describe("Power Setup Studio — recommendation engine integration", () => {
  it("classifies real catalog products for a scenario-derived requirement", () => {
    const scenario = getStudioScenario("home-backup")!;
    const devices: DeviceInput[] = scenario.appliances
      .filter((a) => a.defaultOn)
      .map((a) => {
        const resolved = resolveApplianceInstance(a);
        return {
          id: a.id,
          name: a.label,
          watts: resolved.runningWatts,
          quantity: a.defaultQuantity,
          hoursPerDay: resolved.hoursPerDay,
          surgeWatts: resolved.surgeWatts,
        };
      });
    const result = calculatePower(devices, { days: 1 });
    const recs = recommendProducts(result, catalog, { useCase: scenario.useCase });

    expect(recs.length).toBe(catalog.length);
    // Every recommendation must reference a real catalog product id.
    const catalogIds = new Set(catalog.map((p) => p.id));
    for (const rec of recs) {
      expect(catalogIds.has(rec.product.id)).toBe(true);
    }
  });

  it("gives every 'Best Match' / 'Good Match' recommendation a working affiliate CTA for its own product", () => {
    const scenario = getStudioScenario("remote-work")!;
    const devices: DeviceInput[] = scenario.appliances
      .filter((a) => a.defaultOn)
      .map((a) => {
        const resolved = resolveApplianceInstance(a);
        return {
          id: a.id,
          name: a.label,
          watts: resolved.runningWatts,
          quantity: a.defaultQuantity,
          hoursPerDay: resolved.hoursPerDay,
          surgeWatts: resolved.surgeWatts,
        };
      });
    const result = calculatePower(devices, { days: 1 });
    const recs = recommendProducts(result, catalog, { useCase: scenario.useCase });
    const goodOrBetter = recs.filter((r) => r.status === "Best Match" || r.status === "Good Match");
    expect(goodOrBetter.length).toBeGreaterThan(0);

    for (const rec of goodOrBetter) {
      const product = getProductById(rec.product.id);
      expect(product).toBeDefined();
      const link = resolveAmazonLink(product!);
      // Every one of the 22 products now carries a real affiliate link.
      expect(link.isAffiliate).toBe(true);
      expect(link.href).toBe(product!.amazon_affiliate_url);
    }
  });
});

describe("Power Setup Studio — no fictitious products", () => {
  const FORBIDDEN_NAMES = [
    "Power Station 2000",
    "Compact Station 600",
    "Home Backup 5000",
    "Emergency Station 3000",
  ];

  it("never references a made-up product name in the Studio source files", () => {
    const dir = path.resolve(__dirname, "../src/components/power-setup-studio");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), "utf8");
      for (const forbidden of FORBIDDEN_NAMES) {
        expect(content.includes(forbidden), `${file} contains forbidden fictitious product name "${forbidden}"`).toBe(false);
      }
    }
  });

  it("scenario config never embeds a product id or brand — only appliance keys", () => {
    const productIds = new Set(catalog.map((p) => p.id));
    for (const scenario of STUDIO_SCENARIOS) {
      for (const instance of scenario.appliances) {
        expect(productIds.has(instance.applianceKey)).toBe(false);
      }
    }
  });
});
