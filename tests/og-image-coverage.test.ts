import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { TOOLS } from "@/content/tools";

/**
 * Regression guard found during the tools-launch campaign audit: /tools and
 * /tools/[slug] had no dynamic opengraph-image.tsx, unlike every other
 * important route (guides, power-calculator, compare, the research report).
 * Every Pinterest pin, Facebook post, or forum link to a calculator page
 * would have shown a generic sitewide card instead of naming the actual
 * tool — a real gap for a campaign whose whole point is social/external
 * sharing of these exact pages.
 */
const ROOT = process.cwd();

describe("Open Graph image coverage: /tools hub and each calculator", () => {
  it("the /tools hub has its own opengraph-image.tsx", () => {
    expect(existsSync(join(ROOT, "src/app/tools/opengraph-image.tsx"))).toBe(true);
  });

  it("/tools/[slug] has a dynamic opengraph-image.tsx generating one image per tool", () => {
    const path = join(ROOT, "src/app/tools/[slug]/opengraph-image.tsx");
    expect(existsSync(path)).toBe(true);
  });

  it("the dynamic OG image declares generateStaticParams covering every tool slug (no orphaned/missing OG image for any tool)", () => {
    const src = require("node:fs").readFileSync(
      join(ROOT, "src/app/tools/[slug]/opengraph-image.tsx"),
      "utf8",
    );
    expect(src).toContain("export function generateStaticParams()");
    expect(src).toContain("TOOLS.map((t) => ({ slug: t.slug }))");
  });

  it("every priority tool (refrigerator, CPAP, Starlink) is covered by TOOLS, so it gets a real OG image", () => {
    const prioritySlugs = [
      "refrigerator-runtime-calculator",
      "cpap-battery-calculator",
      "starlink-runtime-calculator",
    ];
    const knownSlugs = TOOLS.map((t) => t.slug);
    for (const slug of prioritySlugs) {
      expect(knownSlugs, `${slug} missing from TOOLS`).toContain(slug);
    }
  });
});
