import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GUIDES, getGuide } from "@/content/guides";
import { getBestFor } from "@/content/best-for";
import { getComparison } from "@/content/comparisons";
import { getAllProducts } from "@/data/products";
import { absoluteUrl, breadcrumbJsonLd, articleJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

const SLUG = "best-indoor-generator-for-refrigerator";
const catalog = getAllProducts();
const catalogIds = new Set(catalog.map((p) => p.id));

describe("indoor-generator guide: exists and is unique", () => {
  it("the slug exists exactly once in GUIDES", () => {
    const matches = GUIDES.filter((g) => g.slug === SLUG);
    expect(matches).toHaveLength(1);
  });

  it("getGuide resolves it", () => {
    expect(getGuide(SLUG)).toBeDefined();
  });

  it("no other guide shares this exact slug or an accidental duplicate path", () => {
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("indoor-generator guide: metadata and canonical", () => {
  const guide = getGuide(SLUG)!;

  it("has a unique title and metaDescription distinct from the two existing refrigerator guides", () => {
    const sizing = getGuide("power-station-for-refrigerator")!;
    const feasibility = getGuide("can-a-power-station-run-a-refrigerator")!;
    expect(guide.title).not.toBe(sizing.title);
    expect(guide.title).not.toBe(feasibility.title);
    expect(guide.metaDescription).not.toBe(sizing.metaDescription);
    expect(guide.metaDescription).not.toBe(feasibility.metaDescription);
  });

  it("the title matches the approved title exactly", () => {
    expect(guide.title).toBe(
      "Best Indoor Generator for a Refrigerator: Safe Battery Backup Options",
    );
  });

  it("canonical URL is derived from the approved slug via the shared absoluteUrl helper", () => {
    expect(absoluteUrl(`/guides/${SLUG}`)).toBe(`${SITE.url}/guides/${SLUG}`);
  });
});

describe("indoor-generator guide: sitemap inclusion", () => {
  it("sitemap.ts loops over all of GUIDES (no separate allowlist that could omit this one)", () => {
    const src = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
    expect(src).toContain("for (const g of GUIDES)");
    expect(src).toContain("/guides/${g.slug}");
  });

  it("the guide is present in the GUIDES array sitemap.ts iterates", () => {
    expect(GUIDES.some((g) => g.slug === SLUG)).toBe(true);
  });
});

describe("indoor-generator guide: required internal links", () => {
  const guide = getGuide(SLUG)!;

  it("links to /best-for-refrigerator-backup via relatedBestForSlug", () => {
    expect(guide.relatedBestForSlug).toBe("best-for-refrigerator-backup");
    expect(getBestFor(guide.relatedBestForSlug!)).toBeDefined();
  });

  it("links to the refrigerator sizing guide and the refrigerator feasibility/autonomy guide", () => {
    expect(guide.relatedGuideSlugs).toContain("power-station-for-refrigerator");
    expect(guide.relatedGuideSlugs).toContain("can-a-power-station-run-a-refrigerator");
  });

  it("links to the EcoFlow DELTA 3 Classic vs Anker SOLIX C1000 Gen 2 comparison", () => {
    expect(guide.relatedComparisonSlug).toBe(
      "ecoflow-delta-3-classic-vs-anker-solix-c1000-gen-2",
    );
    expect(getComparison(guide.relatedComparisonSlug!)).toBeDefined();
  });

  it("the Power Calculator link is guaranteed by the shared guide template, not per-guide content", () => {
    // Every guide page renders a "Calculate your power needs" link in its
    // "Next steps" sidebar and a Power Calculator callout unconditionally —
    // verified once for the template rather than per guide.
    const src = readFileSync(
      join(process.cwd(), "src/app/guides/[slug]/page.tsx"),
      "utf8",
    );
    expect(src).toContain('href="/power-calculator"');
  });

  it("related product ids are real, existing catalog products", () => {
    for (const id of guide.relatedProductIds) {
      expect(catalogIds.has(id), `product id "${id}" not found in catalog`).toBe(true);
    }
  });

  it("reuses the shared EstimateFactorsDisclosure component instead of restating its factors independently", () => {
    expect(guide.showEstimateFactorsDisclosure).toBe(true);
    const src = readFileSync(
      join(process.cwd(), "src/app/guides/[slug]/page.tsx"),
      "utf8",
    );
    expect(src).toContain("showEstimateFactorsDisclosure");
    expect(src).toContain("EstimateFactorsDisclosure");
  });
});

describe("indoor-generator guide: clear fuel-generator safety warning", () => {
  const guide = getGuide(SLUG)!;
  const allText = [
    ...guide.intro,
    ...guide.keyTakeaways ?? [],
    ...guide.sections.flatMap((s) => [...s.body, ...(s.bullets ?? [])]),
    ...guide.faq.flatMap((f) => [f.question, f.answer]),
  ].join(" ");

  it("states plainly, at the very start, that a fuel generator must never run indoors", () => {
    const firstParagraph = guide.intro[0];
    expect(firstParagraph.toLowerCase()).toContain("battery-based power station");
    expect(firstParagraph.toLowerCase()).toMatch(/must never be run inside/);
  });

  it("explicitly covers garage and open-door/window scenarios, not just \"indoors\"", () => {
    expect(allText.toLowerCase()).toContain("garage");
    expect(allText.toLowerCase()).toMatch(/open.{0,20}(doors?|windows?)/);
  });

  it("never frames any fuel-burning generator as safe indoors under any condition", () => {
    // Guard against a future edit accidentally introducing a conditional
    // safety claim (e.g. "safe with adequate ventilation").
    expect(allText.toLowerCase()).not.toMatch(/generator.{0,40}(is safe|safe to (run|use)).{0,20}indoor/);
  });
});

describe("indoor-generator guide: links to official sources", () => {
  const guide = getGuide(SLUG)!;
  const urlSources = guide.sources.filter(
    (s): s is { label: string; url: string } => typeof s !== "string",
  );

  it("cites the CPSC carbon monoxide fact sheet with a real, government URL", () => {
    const cpsc = urlSources.find((s) => s.label.includes("Consumer Product Safety Commission"));
    expect(cpsc).toBeDefined();
    expect(cpsc!.url).toMatch(/^https:\/\/www\.cpsc\.gov\//);
  });

  it("cites the CDC with a real, government URL", () => {
    const cdc = urlSources.find((s) => s.label.includes("Centers for Disease Control"));
    expect(cdc).toBeDefined();
    expect(cdc!.url).toMatch(/^https:\/\/www\.cdc\.gov\//);
  });

  it("both official sources are visibly rendered as links by the shared guide template", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/guides/[slug]/page.tsx"),
      "utf8",
    );
    // Sources render as <a href={url}> whenever a source is an object with a url.
    expect(src).toContain("typeof s === \"string\" ? undefined : s.url");
  });
});

describe("indoor-generator guide: no unsupported or prohibited claims", () => {
  const guide = getGuide(SLUG)!;
  const allText = [
    guide.title,
    guide.metaDescription,
    ...guide.intro,
    ...guide.keyTakeaways ?? [],
    ...guide.sections.flatMap((s) => [s.heading, ...s.body, ...(s.bullets ?? [])]),
    ...guide.faq.flatMap((f) => [f.question, f.answer]),
  ].join(" \n ");

  it("never claims PowerMatchLab physically tested a product", () => {
    expect(allText).not.toMatch(/PowerMatchLab (has )?(physically )?tested/i);
    expect(allText.toLowerCase()).toContain("has not physically tested");
  });

  it("never states a price, review count, rating, or availability claim", () => {
    for (const forbidden of [/\$\d/, /review count/i, /\d+(\.\d+)?\s*stars?/i, /in stock/i, /out of stock/i]) {
      expect(allText).not.toMatch(forbidden);
    }
  });

  it("never claims popularity, demand, or how frequently something is compared/searched", () => {
    for (const forbidden of ["most popular", "best-selling", "frequently shortlisted", "frequently compared"]) {
      expect(allText.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("does not invent a numeric health/injury statistic (no bare death/injury counts)", () => {
    // The safety claims should stay qualitative ("has documented deaths"),
    // never a specific invented number like "500 deaths a year".
    expect(allText).not.toMatch(/\b\d[\d,]*\s+(deaths?|injuries|poisonings)\b/i);
  });

  it("runtime/capacity figures are consistently labeled as estimates, not guarantees or lab results", () => {
    expect(allText.toLowerCase()).toMatch(/planning (estimate|calculation)/);
    expect(allText).not.toMatch(/guarantee(s|d)? (a |the )?(runtime|result)/i);
  });
});

describe("indoor-generator guide: no duplicated numeric product specs", () => {
  it("does not hand-type any related product's exact capacity_wh, rated_output_w, or surge_output_w as a bare figure", () => {
    const guide = getGuide(SLUG)!;
    const allText = guide.sections.flatMap((s) => [...s.body, ...(s.bullets ?? [])]).join(" ");
    const relatedProducts = guide.relatedProductIds
      .map((id) => catalog.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    for (const p of relatedProducts) {
      if (p.capacity_wh != null) {
        expect(allText).not.toContain(`${p.capacity_wh} Wh`);
        expect(allText).not.toContain(`${p.capacity_wh.toLocaleString("en-US")} Wh`);
      }
      if (p.rated_output_w != null) {
        expect(allText).not.toContain(`${p.rated_output_w} W`);
      }
      if (p.surge_output_w != null) {
        expect(allText).not.toContain(`${p.surge_output_w} W`);
      }
    }
  });

  it("product specs reach the page only through the declarative relatedProductIds -> ProductCard mechanism", () => {
    const guide = getGuide(SLUG)!;
    expect(guide.relatedProductIds.length).toBeGreaterThan(0);
    for (const id of guide.relatedProductIds) {
      expect(catalogIds.has(id)).toBe(true);
    }
  });
});

describe("indoor-generator guide: informational/commercial separation is preserved", () => {
  it("does not define its own product ranking logic or scoring (that stays on the best-for page)", () => {
    const src = readFileSync(join(process.cwd(), "src/content/guides.ts"), "utf8");
    // Sanity: guides.ts as a whole never imports the ranking engine.
    expect(src).not.toContain("selectBestFor");
    expect(src).not.toContain("scoreProduct");
  });

  it("carries at most a small, illustrative related-products list (not a full ranked catalog)", () => {
    const guide = getGuide(SLUG)!;
    expect(guide.relatedProductIds.length).toBeLessThanOrEqual(3);
  });

  it("best-for-refrigerator-backup remains the page that actually ranks products for this use case", () => {
    const bestFor = getBestFor("best-for-refrigerator-backup")!;
    expect(bestFor.key).toBe("refrigerator-backup");
    expect(bestFor.relatedGuideSlugs).toContain(SLUG);
  });
});

/**
 * Google retired FAQ rich results in May 2026 and removed the supporting
 * documentation in June 2026. FAQPage JSON-LD was removed sitewide (not
 * just for this guide) — see tests/no-faqpage-schema.test.ts for the
 * project-wide guarantee. This block only re-confirms, for this specific
 * guide's content and the shared template it renders through, that the FAQ
 * section stayed visible and that the legitimate schemas it emits
 * (BreadcrumbList, Article) are unaffected.
 */
describe("indoor-generator guide: structured data (FAQPage removed sitewide)", () => {
  const guide = getGuide(SLUG)!;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ];
  const jsonLdData = [
    breadcrumbJsonLd(crumbs),
    articleJsonLd({
      headline: guide.title,
      description: guide.metaDescription,
      path: `/guides/${guide.slug}`,
      datePublished: guide.lastUpdated,
    }),
  ] as Record<string, unknown>[];
  const emittedTypes = jsonLdData.map((d) => d["@type"]);

  it("still emits BreadcrumbList and Article", () => {
    expect(emittedTypes).toContain("BreadcrumbList");
    expect(emittedTypes).toContain("Article");
  });

  it("does not emit FAQPage, Product, Review, AggregateRating, or Offer", () => {
    const serialized = JSON.stringify(jsonLdData);
    for (const forbidden of ["FAQPage", "Product", "Review", "AggregateRating", "Offer"]) {
      expect(emittedTypes).not.toContain(forbidden);
      expect(serialized).not.toContain(`"@type":"${forbidden}"`);
    }
  });

  it("the visible FAQ questions and answers are untouched and still present in content", () => {
    expect(guide.faq.map((f) => f.question)).toEqual([
      "Can I use a battery power station inside my house?",
      "Is it safe to run a fuel generator in the garage with the door open?",
      "Will a 1 kWh power station run my fridge for a full day?",
      "Do I need a whole-house generator just to keep the fridge running?",
    ]);
    for (const f of guide.faq) {
      expect(f.answer.length).toBeGreaterThan(0);
    }
  });

  it("the shared guide template still renders the visible FAQ section from guide.faq", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/guides/[slug]/page.tsx"),
      "utf8",
    );
    expect(src).toContain("guide.faq.length ?");
    expect(src).not.toContain("omitFaqSchema");
    expect(src).not.toContain("faqJsonLd");
  });
});
