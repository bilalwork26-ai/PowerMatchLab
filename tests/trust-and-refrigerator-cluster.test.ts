import { describe, expect, it } from "vitest";
import { getGuide } from "@/content/guides";
import { getBestFor } from "@/content/best-for";
import { DEFAULT_ASSUMPTIONS } from "@/lib/assumptions";
import { FACTORS } from "@/components/ui/EstimateFactorsDisclosure";

describe("refrigerator cluster: U.S.-market notice", () => {
  it("is set on both refrigerator guides and the refrigerator best-for page", () => {
    expect(getGuide("can-a-power-station-run-a-refrigerator")!.usMarketNotice).toBe(true);
    expect(getGuide("power-station-for-refrigerator")!.usMarketNotice).toBe(true);
    expect(getBestFor("best-for-refrigerator-backup")!.usMarketNotice).toBe(true);
  });

  it("stays unset on pages not touched this round (e.g. best-for-home-backup)", () => {
    expect(getBestFor("best-for-home-backup")!.usMarketNotice).toBeUndefined();
    expect(getGuide("power-station-for-camping")!.usMarketNotice).toBeUndefined();
  });
});

describe("refrigerator cluster: 8/12/24-hour blackout scenario math", () => {
  // Recomputes the guide's stated worked numbers from the same reference
  // figure (1,200 Wh/day, the guide's own existing worked example) and the
  // same documented assumptions used everywhere else on the site — so if
  // DEFAULT_ASSUMPTIONS ever changes, this test catches the guide's prose
  // numbers silently going stale.
  const dailyEnergyWh = 1200;
  const { systemEfficiency, reserveFraction } = DEFAULT_ASSUMPTIONS;

  function recommendedCapacityWh(hours: number): number {
    const proratedWh = dailyEnergyWh * (hours / 24);
    return proratedWh / systemEfficiency * (1 + reserveFraction);
  }

  it("8 hours ≈ 565 Wh, as stated in the guide", () => {
    expect(Math.round(recommendedCapacityWh(8))).toBe(565);
  });

  it("12 hours ≈ 847 Wh, as stated in the guide", () => {
    expect(Math.round(recommendedCapacityWh(12))).toBe(847);
  });

  it("24 hours ≈ 1,694 Wh, matching the guide's existing (unchanged) worked example", () => {
    expect(Math.round(recommendedCapacityWh(24))).toBe(1694);
  });

  it("the guide's own bullet text states these same three figures", () => {
    const guide = getGuide("power-station-for-refrigerator")!;
    const section = guide.sections.find((s) => s.id === "blackout-scenarios-fridge");
    expect(section, "blackout-scenarios-fridge section should exist").toBeDefined();
    const bulletText = (section!.bullets ?? []).join(" | ");
    expect(bulletText).toContain("565 Wh");
    expect(bulletText).toContain("847 Wh");
    expect(bulletText).toContain("1,694 Wh");
  });
});

describe("calculator/Studio results disclosure covers all 9 required variability factors", () => {
  const requiredKeywords = [
    "Temperature",
    "Battery age",
    "Inverter efficiency",
    "Variable appliance draw",
    "Startup/surge",
    "Appliance settings",
    "Conversion losses",
    "Real solar conditions",
    "safety reserve",
  ];

  it("lists exactly one factor per required topic, in accessible list form", () => {
    expect(FACTORS.length).toBe(9);
    const joined = FACTORS.join(" | ");
    for (const kw of requiredKeywords) {
      expect(joined, `missing required factor: "${kw}"`).toContain(kw);
    }
  });
});
