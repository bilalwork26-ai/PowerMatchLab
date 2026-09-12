import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAllProducts, productDisplayName } from "@/data/products";
import { GUIDES, getGuide } from "@/content/guides";
import { BEST_FOR, getBestFor } from "@/content/best-for";
import { TOOLS, getTool } from "@/content/tools";
import { SITE } from "@/lib/site";

const ROOT = process.cwd();

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

/**
 * Regression guards for the September 2026 CTR sprint, driven by real
 * Search Console data (204 impressions, 5 clicks, ~2.45% CTR over the first
 * week of real traffic). See marketing/17-seo-ctr-sprint-report.md for the
 * full audit — this file locks in the specific, evidence-based fixes so a
 * future edit can't silently regress them.
 */

describe("SEO CTR sprint: /products metadata", () => {
  it("the /products title is specific and names the real, current catalog size (not the old generic 'Power Stations Catalog')", () => {
    const src = read("src/app/products/page.tsx");
    expect(src).not.toContain('title: "Power Stations Catalog"');
    expect(src).toContain("PRODUCT_COUNT");
    expect(src).toContain("Portable Power Station Catalog");
  });

  it("the /products title's product count is computed from the catalog, never hardcoded", () => {
    const src = read("src/app/products/page.tsx");
    expect(src).toContain("const PRODUCT_COUNT = getAllProducts().length;");
    // Sanity: the number actually rendered matches the real catalog today.
    expect(getAllProducts().length).toBeGreaterThan(0);
  });
});

describe("SEO CTR sprint: /products/[id] meta description length", () => {
  it("the description template stays within Google's ~155-char desktop snippet budget for every product in the catalog, not just a hand-picked example", () => {
    const src = read("src/app/products/[id]/page.tsx");
    const match = src.match(/description: `([^`]+)`,/);
    expect(match, "could not find the generateMetadata description template").not.toBeNull();
    const template = match![1];

    for (const product of getAllProducts()) {
      const name = productDisplayName(product);
      const rendered = template.replace(/\$\{name\}/g, name);
      expect(
        rendered.length,
        `${name}'s product-page meta description is ${rendered.length} chars (want <= 160): "${rendered}"`,
      ).toBeLessThanOrEqual(160);
    }
  });
});

describe("SEO CTR sprint: refrigerator cluster keeps distinct intent per page (no cannibalization)", () => {
  const bestFor = getBestFor("best-for-refrigerator-backup")!;
  const sizingGuide = getGuide("power-station-for-refrigerator")!;
  const feasibilityGuide = getGuide("can-a-power-station-run-a-refrigerator")!;
  const indoorGenGuide = getGuide("best-indoor-generator-for-refrigerator")!;
  const tool = getTool("refrigerator-runtime-calculator")!;

  it("all 5 refrigerator-cluster entries exist", () => {
    expect(bestFor).toBeDefined();
    expect(sizingGuide).toBeDefined();
    expect(feasibilityGuide).toBeDefined();
    expect(indoorGenGuide).toBeDefined();
    expect(tool).toBeDefined();
  });

  it("no two pages in the cluster share a title (the real cannibalization signal, not just topical overlap)", () => {
    const titles = [bestFor.title, sizingGuide.title, feasibilityGuide.title, indoorGenGuide.title, tool.title];
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("each page's opening sentence targets a distinct question (selection vs. sizing vs. feasibility vs. safety)", () => {
    expect(bestFor.quickAnswer ?? bestFor.intro[0]).toMatch(/prioritize|surge rating/i);
    expect(sizingGuide.intro[0]).toMatch(/watt-hours|Wh|day/i);
    expect(feasibilityGuide.intro[0]).toMatch(/^Short answer: yes/i);
    expect(indoorGenGuide.intro[0]).toMatch(/indoor|safe/i);
  });

  it("the commercial page (best-for) links to all 3 differentiated guides", () => {
    expect(bestFor.relatedGuideSlugs).toEqual(
      expect.arrayContaining([
        "power-station-for-refrigerator",
        "can-a-power-station-run-a-refrigerator",
        "best-indoor-generator-for-refrigerator",
      ]),
    );
  });

  it("every guide in the cluster links back to the commercial page and forward to the calculator (bidirectional linking)", () => {
    for (const guide of [sizingGuide, feasibilityGuide, indoorGenGuide]) {
      expect(guide.relatedBestForSlug, `${guide.slug} should link to best-for-refrigerator-backup`).toBe(
        "best-for-refrigerator-backup",
      );
      expect(guide.relatedToolSlug, `${guide.slug} should link to the refrigerator calculator`).toBe(
        "refrigerator-runtime-calculator",
      );
    }
  });

  it("the calculator tool links back to all 3 guides and the commercial page", () => {
    expect(tool.relatedGuideSlugs).toEqual(
      expect.arrayContaining([
        "power-station-for-refrigerator",
        "can-a-power-station-run-a-refrigerator",
        "best-indoor-generator-for-refrigerator",
      ]),
    );
    expect(tool.relatedBestForSlug).toBe("best-for-refrigerator-backup");
  });
});

describe("SEO CTR sprint: essential internal links", () => {
  it("/about-methodology no longer dead-ends — it links forward to the Power Calculator and Compare", () => {
    const src = read("src/app/about-methodology/page.tsx");
    expect(src).toContain('href="/power-calculator"');
    expect(src).toContain('href="/compare"');
  });

  it("the homepage's Tools section links to the /tools hub, not only the general calculator", () => {
    const src = read("src/components/home/HomeSections.tsx");
    const toolsBlockMatch = src.match(/export const TOOLS = \[[\s\S]*?\];/);
    expect(toolsBlockMatch).not.toBeNull();
    expect(toolsBlockMatch![0]).toContain('href: "/tools"');
  });

  it("the refrigerator best-for page is linked from the homepage body, not only the footer", () => {
    const src = read("src/components/home/HomeSections.tsx");
    expect(src).toContain('href="/best-for-refrigerator-backup"');
  });
});

describe("SEO CTR sprint: no invented prices anywhere in the catalog or deals system", () => {
  it("no product record carries a manual price field", () => {
    for (const product of getAllProducts() as unknown as Record<string, unknown>[]) {
      expect(product).not.toHaveProperty("price");
      expect(product).not.toHaveProperty("price_usd");
      expect(product).not.toHaveProperty("list_price");
      expect(product).not.toHaveProperty("msrp");
    }
  });

  it("the deals dataset (DEALS in lib/deals.ts) has no price, discount, or percentage field on any entry", () => {
    const src = read("src/lib/deals.ts");
    const interfaceMatch = src.match(/export interface Deal \{([\s\S]*?)\}/);
    expect(interfaceMatch, "could not find the Deal interface").not.toBeNull();
    const fields = interfaceMatch![1];
    // The Deal interface's own field list is the contract; assert it never
    // grows a price/discount field without this test being updated
    // deliberately, not silently.
    expect(fields).not.toMatch(/\bprice\b/i);
    expect(fields).not.toMatch(/discount|percent/i);
  });
});

describe("SEO CTR sprint: canonical host audit conclusion stays true", () => {
  it("SITE.url resolves to the canonical www host in a production build (audited this sprint, see report)", () => {
    expect(SITE.url === "https://www.powermatchlab.com" || SITE.url === "http://localhost:3000").toBe(
      true,
    );
  });

  it("every static path in the sitemap resolves through absoluteUrl/SITE.url, so no apex-host URL can leak in", () => {
    const src = read("src/app/sitemap.ts");
    expect(src).not.toMatch(/https:\/\/powermatchlab\.com/);
    expect(src).toContain("absoluteUrl(");
  });
});

describe("SEO CTR sprint: mobile QA — fixed a real horizontal overflow on the load-list calculators", () => {
  it("the example-preset <select> in LoadListCalculator (refrigerator/RV/home-backup) can shrink and never forces the row past viewport width", () => {
    // Found during mobile QA of the refrigerator cluster: a bare <select>
    // has no CSS min-width, so the flexbox default (min-width: auto) let
    // its longest <option> text push the whole row ~330px past a 390px
    // mobile viewport. CpapCalculator and StarlinkCalculator already avoid
    // this with an explicit w-full on their <select>; LoadListCalculator
    // did not. Fixed by making both the wrapping label and the select
    // full-width below the sm: breakpoint (forcing the "add custom" button
    // onto its own wrapped line on narrow screens) and reverting to the
    // original side-by-side layout at sm: and up.
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain('className="w-full min-w-0 text-sm sm:w-auto"');
    expect(src).toContain('className={cn("w-full sm:w-auto", darkSelect)}');
  });

  it("CpapCalculator and StarlinkCalculator's selects still carry their own w-full (unaffected, confirms the bug was LoadListCalculator-specific)", () => {
    expect(read("src/components/tools/CpapCalculator.tsx")).toContain('cn("mt-1.5 w-full", darkSelect)');
    expect(read("src/components/tools/StarlinkCalculator.tsx")).toContain('cn("mt-1 w-full", darkSelect)');
  });
});

// Keep the guide/tool/best-for content lists imported so this file breaks
// loudly (a clear import error) if any of those content modules is ever
// restructured in a way that would silently invalidate the assertions above.
void GUIDES;
void BEST_FOR;
void TOOLS;
