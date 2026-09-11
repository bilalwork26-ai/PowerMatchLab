import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getGuide } from "@/content/guides";
import { APPLIANCE_EXAMPLES } from "@/lib/appliances";

const ROOT = process.cwd();

describe("appliance-power-consumption-table: new linkable resource guide (Milestone 7)", () => {
  const guide = getGuide("appliance-power-consumption-table")!;

  it("exists and embeds the live appliance table component", () => {
    expect(guide).toBeDefined();
    expect(guide.embed).toBe("appliance-consumption-table");
    expect(guide.group).toBe("basics");
  });

  it("the embed is wired into the guide template's GUIDE_EMBEDS map", () => {
    const src = readFileSync(join(ROOT, "src/app/guides/[slug]/page.tsx"), "utf8");
    expect(src).toContain('"appliance-consumption-table": ApplianceConsumptionTable');
  });

  it("the component reads live from APPLIANCE_EXAMPLES, never a hand-copied list", () => {
    const src = readFileSync(
      join(ROOT, "src/components/guides/ApplianceConsumptionTable.tsx"),
      "utf8",
    );
    expect(src).toContain("APPLIANCE_EXAMPLES");
    // No hardcoded appliance name strings duplicating the source data.
    for (const a of APPLIANCE_EXAMPLES.slice(0, 3)) {
      expect(src).not.toContain(`"${a.name}"`);
    }
  });

  it("links reciprocally with watts-vs-watt-hours and the sizing guide", () => {
    expect(guide.relatedGuideSlugs).toContain("how-to-size-a-portable-power-station");
    const wattsGuide = getGuide("watts-vs-watt-hours")!;
    expect(wattsGuide.relatedGuideSlugs).toContain("appliance-power-consumption-table");
  });

  it("never claims a table figure is exact for any specific product", () => {
    const allText = [...guide.intro, ...guide.sections.flatMap((s) => s.body)].join(" ");
    expect(allText).toMatch(/starting point|not a measurement/i);
  });
});

describe("promotion kit documentation (Milestone 7)", () => {
  const path = join(ROOT, "docs/promotion-kit.md");

  it("exists in the repo", () => {
    expect(existsSync(path)).toBe(true);
  });

  it("covers all five tools with a short and long description each", () => {
    const content = readFileSync(path, "utf8");
    for (const tool of [
      "Power Calculator",
      "Compare tool",
      "Solar Charging Time Calculator",
      "Watt-Hour Calculator",
      "Appliance Power Consumption Table",
    ]) {
      expect(content).toContain(tool);
    }
    const shortCount = (content.match(/\*\*Short description/g) ?? []).length;
    expect(shortCount).toBeGreaterThanOrEqual(5);
  });

  it("includes outreach pitch text, site-type list, and social post ideas, without fabricated metrics", () => {
    const content = readFileSync(path, "utf8");
    expect(content).toMatch(/Outreach pitch/i);
    expect(content).toMatch(/Relevant site types/i);
    expect(content).toMatch(/Social post ideas/i);
    // Explicit self-declaration that nothing was invented or sent.
    expect(content).toMatch(/No fabricated subscriber counts|nothing.*has been sent/i);
  });

  it("explicitly states nothing has been sent or published externally", () => {
    const content = readFileSync(path, "utf8");
    expect(content).toMatch(/has been sent, posted, or published anywhere/i);
  });
});
