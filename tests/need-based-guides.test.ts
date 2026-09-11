import { describe, expect, it } from "vitest";
import { getGuide } from "@/content/guides";
import { getApplianceExample } from "@/lib/appliances";
import { getAllProducts } from "@/data/products";

const catalog = getAllProducts();

describe("power-station-for-sump-pump: new guide (Milestone 3)", () => {
  const guide = getGuide("power-station-for-sump-pump")!;

  it("exists with the required shape", () => {
    expect(guide).toBeDefined();
    expect(guide.group).toBe("use-cases");
    expect(guide.sections.length).toBeGreaterThan(0);
    expect(guide.faq.length).toBeGreaterThan(0);
  });

  it("reuses the existing shared sump-pump appliance figures, never inventing new ones", () => {
    const appliance = getApplianceExample("sump-pump")!;
    expect(appliance.runningWatts).toBe(800);
    expect(appliance.surgeWatts).toBe(2200);
    const body = guide.sections.flatMap((s) => s.body).join(" ");
    expect(body).toContain("800 W");
    expect(body).toContain("2,200 W");
  });

  it("the worked capacity example is arithmetically correct (800Wh / 0.85 * 1.2)", () => {
    const expected = (800 / 0.85) * 1.2;
    expect(Math.round(expected)).toBe(1129);
    const body = guide.sections.flatMap((s) => s.body).join(" ");
    expect(body).toContain("1,129 Wh");
  });

  it("explicitly frames surge, not capacity, as the deciding factor (per the milestone's requirement for motors/pumps)", () => {
    const body = guide.sections.flatMap((s) => s.body).join(" ").toLowerCase();
    expect(body).toMatch(/surge/);
    expect(body).toMatch(/startup/);
  });

  it("never promises the pump will start or guarantees flood prevention", () => {
    const allText = [
      ...guide.intro,
      ...guide.sections.flatMap((s) => s.body),
      ...guide.faq.map((f) => f.answer),
    ].join(" ");
    expect(allText).not.toMatch(/will start your pump|guarantees? (flood|protection)/i);
    // The FAQ explicitly defers the flood-prevention-reliability question to a professional.
    expect(guide.faq.some((f) => /professional/i.test(f.answer))).toBe(true);
  });

  it("relatedProductIds are real catalog products that clear the 2,200 W surge requirement", () => {
    for (const id of guide.relatedProductIds) {
      const product = catalog.find((p) => p.id === id);
      expect(product, `"${id}" not in catalog`).toBeDefined();
      expect(
        product!.surge_output_w,
        `"${id}" has no verified surge rating — can't recommend it for a surge-critical use case`,
      ).not.toBeNull();
      expect(product!.surge_output_w!).toBeGreaterThanOrEqual(2200);
    }
  });
});

describe("power-station-for-home-office: new guide (Milestone 3)", () => {
  const guide = getGuide("power-station-for-home-office")!;

  it("exists with the required shape", () => {
    expect(guide).toBeDefined();
    expect(guide.group).toBe("use-cases");
    expect(guide.sections.length).toBeGreaterThan(0);
    expect(guide.faq.length).toBeGreaterThan(0);
  });

  it("reuses the existing shared appliance figures for laptop, monitor and router — never invents new ones", () => {
    const laptop = getApplianceExample("laptop")!;
    const monitor = getApplianceExample("external-monitor")!;
    const router = getApplianceExample("wifi-router")!;
    expect(laptop.runningWatts).toBe(60);
    expect(monitor.runningWatts).toBe(30);
    expect(router.runningWatts).toBe(18);
    const body = guide.sections.flatMap((s) => s.body).join(" ");
    expect(body).toContain("60 W");
    expect(body).toContain("30 W");
    expect(body).toContain("18 W");
  });

  it("the router's continuous 24-hour draw is computed correctly (18 W × 24 h)", () => {
    expect(18 * 24).toBe(432);
    const body = guide.sections.flatMap((s) => s.body).join(" ");
    expect(body).toContain("432 Wh");
  });

  it("the full-day worked total and recommended capacity are arithmetically correct", () => {
    const totalWh = 18 * 24 + 60 * 4 + 30 * 4;
    expect(totalWh).toBe(792);
    const recommended = (totalWh / 0.85) * 1.2;
    expect(Math.round(recommended)).toBe(1118);
    const body = guide.sections.flatMap((s) => s.body).join(" ");
    expect(body).toContain("792 Wh");
    expect(body).toContain("1,118 Wh");
  });

  it("the connectivity-only FAQ hour figure matches the actual recommended product's real capacity", () => {
    const faqAnswer = guide.faq.find((f) => /internet running/i.test(f.question))!.answer;
    const productId = guide.relatedProductIds[0];
    const product = catalog.find((p) => p.id === productId)!;
    expect(product.capacity_wh).not.toBeNull();
    const hours = (product.capacity_wh! * 0.85) / 18;
    // The FAQ cites "~1,150Wh-class" / "roughly 54 hours" — confirm that
    // description actually matches the first related product's real spec,
    // not a number invented independently of the catalog.
    expect(Math.round(hours)).toBe(54);
    expect(faqAnswer).toContain("54 hours");
  });

  it("frames surge as not a real concern here (electronics, not a motor)", () => {
    const body = guide.sections.flatMap((s) => s.body).join(" ").toLowerCase();
    expect(body).toMatch(/without a meaningful startup spike/);
    expect(guide.sections.map((s) => s.heading).join(" ")).toMatch(/not a real concern/i);
  });
});

describe("power-station-for-power-outage: 24/48/72-hour breakdown added", () => {
  const guide = getGuide("power-station-for-power-outage")!;

  it("includes a dedicated section covering all three durations", () => {
    const section = guide.sections.find((s) => s.id === "outage-duration-table");
    expect(section).toBeDefined();
    expect(section!.bullets).toBeDefined();
    expect(section!.bullets!.length).toBe(3);
  });

  it("the three figures are arithmetically correct multiples of the same daily-energy reference", () => {
    const section = guide.sections.find((s) => s.id === "outage-duration-table")!;
    const dailyWh = 1400;
    const expectedByDay = [1, 2, 3].map((days) => Math.round((dailyWh * days) / 0.85 * 1.2));
    expect(expectedByDay).toEqual([1976, 3953, 5929]);
    for (const wh of expectedByDay) {
      expect(section.bullets!.join(" ")).toContain(`${wh.toLocaleString("en-US")} Wh`);
    }
  });

  it("scales linearly (72h figure is exactly 3x the 24h figure's underlying daily energy)", () => {
    const section = guide.sections.find((s) => s.id === "outage-duration-table")!;
    const text = section.bullets!.join(" ");
    expect(text).toMatch(/24 hours.*1,976 Wh/);
    expect(text).toMatch(/72 hours.*5,929 Wh/);
  });
});

describe("power-station-for-cpap: related products extended with CPAP-tagged catalog entries", () => {
  const guide = getGuide("power-station-for-cpap")!;

  it("the two newly added products are real catalog entries explicitly tagged for CPAP use", () => {
    for (const id of ["pecron-e2400lfp", "pecron-e3600lfp"]) {
      expect(guide.relatedProductIds).toContain(id);
      const product = catalog.find((p) => p.id === id)!;
      expect(product).toBeDefined();
      expect(product.best_for.some((tag) => /cpap/i.test(tag))).toBe(true);
    }
  });

  it("relatedProductIds stays within the project's 3-item convention", () => {
    expect(guide.relatedProductIds.length).toBeLessThanOrEqual(3);
  });
});

describe("Milestone 3 guides: reciprocal cross-linking", () => {
  it("power-station-for-power-outage and power-station-for-home-backup both link to both new guides", () => {
    const outage = getGuide("power-station-for-power-outage")!;
    const homeBackup = getGuide("power-station-for-home-backup")!;
    for (const target of ["power-station-for-sump-pump", "power-station-for-home-office"]) {
      expect(outage.relatedGuideSlugs).toContain(target);
      expect(homeBackup.relatedGuideSlugs).toContain(target);
    }
  });

  it("both new guides link back to at least one broader outage/home-backup guide", () => {
    for (const slug of ["power-station-for-sump-pump", "power-station-for-home-office"]) {
      const guide = getGuide(slug)!;
      expect(
        guide.relatedGuideSlugs?.some((s) =>
          ["power-station-for-power-outage", "power-station-for-home-backup"].includes(s),
        ),
      ).toBe(true);
    }
  });
});
