import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getGuide } from "@/content/guides";

const ROOT = process.cwd();
function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Milestone 8: self-hosted font is actually wired up", () => {
  it("layout.tsx loads next/font/google Inter into the --font-inter variable Tailwind expects", () => {
    const src = read("src/app/layout.tsx");
    expect(src).toContain('import { Inter } from "next/font/google"');
    expect(src).toContain('variable: "--font-inter"');
    expect(src).toContain('display: "swap"');
    expect(src).toContain("inter.variable");
  });
});

describe("Milestone 8: dynamic validation/empty-state callouts are announced to screen readers", () => {
  it("Callout supports an opt-in live region, off by default", () => {
    const src = read("src/components/ui/Callout.tsx");
    expect(src).toContain('role={live ? "status" : undefined}');
    expect(src).toContain('aria-live={live ? "polite" : undefined}');
  });

  it("the calculator's zero-power-row warning and empty-result states are marked live", () => {
    const src = read("src/components/calculator/PowerCalculator.tsx");
    // Three distinct dynamic Callouts in this file should opt in.
    expect(src.match(/Callout tone="warn" dark live/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("Studio's no-match state and Compare's invalid-ids notice are marked live", () => {
    const studio = read("src/components/power-setup-studio/MatchingStations.tsx");
    expect(studio).toContain('Callout tone="warn" dark live');
    const compare = read("src/components/compare/CompareView.tsx");
    expect(compare).toContain('Callout tone="warn" dark live className="mb-4"');
  });
});

describe("Milestone 6: solar-charging guide meta description matches its actual content", () => {
  const guide = getGuide("how-long-to-charge-power-station-with-solar")!;

  it("claims worked examples at 100W/200W/400W/800W, and all four now actually appear", () => {
    expect(guide.metaDescription).toMatch(/100W?, 200W?, 400W? and 800W?/i);
    const workedSection = guide.sections.find((s) => s.id === "worked-examples-solar")!;
    const body = workedSection.body.join(" ");
    expect(body).toMatch(/100 W-rated/);
    expect(body).toMatch(/200 W-rated/);
    expect(body).toMatch(/400 W-rated/);
    expect(body).toMatch(/800 W-rated/);
  });

  it("the new 100W and 800W examples use the same 65% derate formula as the existing ones, not invented numbers", () => {
    const workedSection = guide.sections.find((s) => s.id === "worked-examples-solar")!;
    const body = workedSection.body.join(" ");
    // 100W * 0.65 = 65W; 1000 / 65 ≈ 15.4h
    expect(body).toMatch(/about 65 W/);
    expect(body).toMatch(/15\.4 hours/);
    // 800W * 0.65 = 520W; 1000/520 ≈ 1.9h, 2000/520 ≈ 3.8h
    expect(body).toMatch(/about 520 W/);
    expect(body).toMatch(/1\.9 hours/);
  });
});

describe("Milestone 6: the two flagship guides now link to each other", () => {
  it("solar guide -> watts-vs-watt-hours and back", () => {
    const solar = getGuide("how-long-to-charge-power-station-with-solar")!;
    const watts = getGuide("watts-vs-watt-hours")!;
    expect(solar.relatedGuideSlugs).toContain("watts-vs-watt-hours");
    expect(watts.relatedGuideSlugs).toContain("how-long-to-charge-power-station-with-solar");
  });
});

describe("Milestone 6: refrigerator backup gets a stronger homepage link than only the footer", () => {
  it("the use-case section links to best-for-refrigerator-backup", () => {
    const src = read("src/components/home/HomeSections.tsx");
    expect(src).toContain('href="/best-for-refrigerator-backup"');
  });
});

describe("Milestone 6: /compare meta description fits a search snippet", () => {
  it("is under 160 characters", () => {
    const src = read("src/app/compare/page.tsx");
    const match = src.match(/description:\s*\n?\s*"([^"]+)"/);
    expect(match).toBeTruthy();
    expect(match![1].length).toBeLessThanOrEqual(160);
  });
});
