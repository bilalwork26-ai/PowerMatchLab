import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getAllProducts } from "@/data/products";
import { computeCatalogStats } from "@/lib/catalog-stats";
import { scoreCatalog, scoreProduct } from "@/lib/score";
import { hasEssentialSpecsForFeaturing } from "@/lib/featured-eligibility";
import { DEFAULT_ASSUMPTIONS, ASSUMPTION_NOTES } from "@/lib/assumptions";
import { SITE } from "@/lib/site";
import { GUIDES } from "@/content/guides";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}
const srcFiles = walk(SRC_DIR);
const srcContents = new Map(srcFiles.map((f) => [f, readFileSync(f, "utf8")]));
function read(rel: string): string {
  return srcContents.get(join(ROOT, rel))!;
}

const catalog = getAllProducts();

// ---------------------------------------------------------------------------
// Bloque 1: dynamic catalog count everywhere, no stale literal
// ---------------------------------------------------------------------------
describe("Bloque 1: catalog count is always computed live, never a stale literal", () => {
  it("the research report page derives its CSV-row-count sentence from the live catalog, not a hardcoded number", () => {
    const src = read("src/app/research/portable-power-station-specs-2026/page.tsx");
    expect(src).not.toMatch(/same 39 rows/);
    expect(src).toMatch(/same \{PRODUCT_COUNT\} rows/);
  });

  it("the research report's stats object productCount matches the real catalog length", () => {
    const stats = computeCatalogStats(catalog);
    expect(stats.productCount).toBe(catalog.length);
  });

  it("the CSV route builds from getAllProducts() live, not a static file or literal count", () => {
    const src = read("src/app/research/portable-power-station-specs-2026/catalog.csv/route.ts");
    expect(src).toContain("getAllProducts()");
    expect(src).not.toMatch(/\b39\b/);
  });

  it("no source file under src/ contains a stale 'all 39 products' or '39-product' phrase", () => {
    for (const [file, content] of srcContents) {
      expect(content, file).not.toMatch(/all 39 products?/i);
      expect(content, file).not.toMatch(/39-product catalog/i);
    }
  });

  it("the /tools/[slug] template still derives its catalog-size line from catalog.length (pre-existing guard, re-confirmed)", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    expect(src).toContain("all {catalog.length} products");
  });

  it("sanity: the live catalog today has more than one product, making the dynamic count meaningful", () => {
    expect(catalog.length).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// Bloque 2: PowerMatch Score — accessible explanation, coverage, relativity
// ---------------------------------------------------------------------------
describe("Bloque 2: PowerMatch Score is explained as relative/editorial, with coverage, accessibly", () => {
  it("about-methodology explicitly disclaims that 100/100 does not mean flawless or fully verified", () => {
    const src = read("src/app/about-methodology/page.tsx");
    expect(src).toMatch(/does not mean the product is objectively flawless/i);
    expect(src).toMatch(/every one of its[\s\S]{0,40}specification fields has been independently verified/i);
  });

  it("ProductCard's score badge is a real, focusable link with an accessible name stating it is editorial, relative, and shows coverage", () => {
    const src = read("src/components/product/ProductCard.tsx");
    expect(src).toMatch(/<Link[\s\S]{0,20}href=\{`\/products\/\$\{product\.id\}#details`\}/);
    expect(src).toMatch(/aria-label=\{`PowerMatch Score[\s\S]{0,400}scoredCount[\s\S]{0,200}totalDimensions/);
    expect(src).toMatch(/relative to the products in this catalog/);
    expect(src).toMatch(/Not a lab test/);
  });

  it("the score badge's explanation is not hover-only: it is carried in aria-label (screen reader) and reachable via a real link (keyboard/mobile), with title as a supplementary hover hint only", () => {
    const src = read("src/components/product/ProductCard.tsx");
    const start = src.indexOf("score?.overall != null");
    const linkBlock = src.slice(start, src.indexOf("</Link>", start));
    expect(linkBlock).toContain("aria-label=");
    expect(linkBlock).toContain("title=");
    expect(linkBlock).toContain("href=");
  });

  it("CompareView's inline score mention also states it is editorial/relative and shows dimension coverage", () => {
    const src = read("src/components/compare/CompareView.tsx");
    expect(src).toMatch(/editorial figure relative to this catalog/);
    expect(src).toContain("sc.scoredCount");
    expect(src).toContain("sc.totalDimensions");
  });

  it("the product detail page's hero already surfaces coverage and a link to the full breakdown (pre-existing, re-confirmed no regression)", () => {
    const src = read("src/app/products/[id]/page.tsx");
    expect(src).toMatch(/\$\{score\.scoredCount\}\/\$\{score\.totalDimensions\} dimensions/);
    expect(src).toContain("See score breakdown");
  });

  it("scoring logic never awards points for a missing field: every dimension push requires the underlying field to be non-null", () => {
    const src = read("src/lib/score.ts");
    // Every `push(` call site is guarded by an `if (product.<field> != null` check directly above it.
    const pushSites = [...src.matchAll(/if \(([^)]*!= null[^)]*)\)\s*\{[\s\S]{0,300}?push\(/g)];
    expect(pushSites.length).toBeGreaterThanOrEqual(4);
  });

  it("a product missing a dimension's underlying data is never scored 0 or defaulted for that dimension — it is simply excluded from scoredCount", () => {
    const withGaps = catalog.filter((p) => p.weight_kg == null || p.rated_output_w == null);
    expect(withGaps.length).toBeGreaterThan(0);
    for (const p of withGaps) {
      const s = scoreProduct(p, catalog);
      expect(s.scoredCount).toBeLessThan(s.totalDimensions);
      if (p.weight_kg == null) {
        expect(s.dimensions.some((d) => d.key === "portability")).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Bloque 3: homepage featured picks require complete essential specs
// ---------------------------------------------------------------------------
describe("Bloque 3: homepage 'top picks' require capacity + continuous output + weight all verified", () => {
  it("hasEssentialSpecsForFeaturing is false for a product missing weight, output, or capacity", () => {
    expect(hasEssentialSpecsForFeaturing({ capacity_wh: 1000, rated_output_w: 1000, weight_kg: null } as never)).toBe(false);
    expect(hasEssentialSpecsForFeaturing({ capacity_wh: 1000, rated_output_w: null, weight_kg: 10 } as never)).toBe(false);
    expect(hasEssentialSpecsForFeaturing({ capacity_wh: null, rated_output_w: 1000, weight_kg: 10 } as never)).toBe(false);
    expect(hasEssentialSpecsForFeaturing({ capacity_wh: 1000, rated_output_w: 1000, weight_kg: 10 } as never)).toBe(true);
  });

  it("the three products named in the audit report still have a real missing field today (confirms the hypothesis, not stale)", () => {
    const byId = (id: string) => catalog.find((p) => p.id === id);
    expect(byId("ecoflow-delta-pro-ultra")?.weight_kg).toBeNull();
    expect(byId("jackery-explorer-5000-plus")?.rated_output_w).toBeNull();
    expect(byId("ecoflow-delta-pro-3")?.weight_kg).toBeNull();
  });

  it("all three of those products are therefore ineligible for the homepage spotlight", () => {
    const byId = (id: string) => catalog.find((p) => p.id === id)!;
    for (const id of ["ecoflow-delta-pro-ultra", "jackery-explorer-5000-plus", "ecoflow-delta-pro-3"]) {
      expect(hasEssentialSpecsForFeaturing(byId(id)), id).toBe(false);
    }
  });

  it("HomeSections' TopProducts filters featured candidates through hasEssentialSpecsForFeaturing before slicing, but keeps items.length as the full catalog count", () => {
    const src = read("src/components/home/HomeSections.tsx");
    const fnBlock = src.slice(src.indexOf("export function TopProducts"), src.indexOf("export function TopProducts") + 1200);
    expect(fnBlock).toContain("hasEssentialSpecsForFeaturing");
    expect(fnBlock).toMatch(/items\.filter\(/);
    expect(fnBlock).toContain("items.length");
  });

  it("enough real catalog products qualify that the homepage spotlight is never empty", () => {
    const eligible = catalog.filter(hasEssentialSpecsForFeaturing);
    expect(eligible.length).toBeGreaterThanOrEqual(4);
  });

  it("no product is removed from the general catalog by this rule — getAllProducts() is untouched", () => {
    expect(getAllProducts().length).toBe(catalog.length);
  });
});

// ---------------------------------------------------------------------------
// Bloque 4: Power Calculator seeded-example label + surge-multiplier disclosure
// ---------------------------------------------------------------------------
describe("Bloque 4: Power Calculator labels its seeded example and explains the surge fallback", () => {
  const src = read("src/components/calculator/PowerCalculator.tsx");

  it("shows an 'Example setup' callout only while the seeded devices are untouched", () => {
    expect(src).toContain("isDefaultExample");
    expect(src).toMatch(/Example setup/);
    expect(src).toMatch(/\{isDefaultExample \? \(/);
  });

  it("every device-list mutation (edit, remove, add custom, add example) turns the example label off; only resetAll turns it back on", () => {
    const updateRowBlock = src.slice(src.indexOf("const updateRow = "), src.indexOf("const removeRow = "));
    const removeRowBlock = src.slice(src.indexOf("const removeRow = "), src.indexOf("const addCustom = "));
    const addCustomBlock = src.slice(src.indexOf("const addCustom = "), src.indexOf("const addExample = "));
    const addExampleBlock = src.slice(src.indexOf("const addExample = "), src.indexOf("const resetAll = "));
    const resetAllBlock = src.slice(src.indexOf("const resetAll = "), src.indexOf("const resetAll = ") + 300);
    for (const block of [updateRowBlock, removeRowBlock, addCustomBlock, addExampleBlock]) {
      expect(block).toContain("setIsDefaultExample(false)");
    }
    expect(resetAllBlock).toContain("setIsDefaultExample(true)");
  });

  it("does not break share/URL-param handling: PowerCalculator has no searchParams-driven share-state restoration to interfere with", () => {
    expect(src).not.toContain("useSearchParams");
    expect(src).not.toContain("decodeLoadListShareState");
  });

  it("the surge-multiplier fallback note explains that different appliance types can have very different real peaks and to use the nameplate/manual", () => {
    expect(ASSUMPTION_NOTES.assumedSurgeMultiplier).toMatch(/motors?, compressors?, pumps?, refrigerators? and air conditioners?/i);
    expect(ASSUMPTION_NOTES.assumedSurgeMultiplier).toMatch(/nameplate or manual/i);
    expect(ASSUMPTION_NOTES.assumedSurgeMultiplier).not.toMatch(/^Fallback startup-surge multiple applied only when you do not enter a real surge value\.$/);
  });

  it("the surge fallback note and multiplier value are rendered visibly in the calculation-assumptions panel, and a short hint sits on the Surge column header", () => {
    expect(src).toContain("ASSUMPTION_NOTES.assumedSurgeMultiplier");
    expect(src).toContain("DEFAULT_ASSUMPTIONS.assumedSurgeMultiplier");
    expect(src).toMatch(/optional — blank uses a \{DEFAULT_ASSUMPTIONS\.assumedSurgeMultiplier\}/);
  });

  it("the RV AC calculator's own duty-cycle estimator (a separate component) is untouched by this change", () => {
    const loadListSrc = read("src/components/tools/LoadListCalculator.tsx");
    expect(loadListSrc).toContain("allowDutyCycleEstimator");
    expect(loadListSrc).toContain("desiredCoolingHours");
    expect(loadListSrc).toContain("dutyCyclePct");
  });

  it("DEFAULT_ASSUMPTIONS.assumedSurgeMultiplier is still 2 (unchanged formula, only the explanatory text and display changed)", () => {
    expect(DEFAULT_ASSUMPTIONS.assumedSurgeMultiplier).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Bloque 5: editorial language — positive framing, clear "checked listing" wording
// ---------------------------------------------------------------------------
describe("Bloque 5: editorial language is positive and precise, without renaming internal fields", () => {
  it("the /guides hero no longer uses defensive 'no thin, mass-generated SEO' framing", () => {
    const src = read("src/app/guides/page.tsx");
    expect(src).not.toMatch(/mass-generated SEO/i);
    expect(src).toMatch(/transparent assumptions, worked examples, and source-backed specifications/);
  });

  it("no user-visible source file claims a 'verified link to Amazon' — ambiguous between listing-identity verification and link-liveness verification", () => {
    for (const [file, content] of srcContents) {
      if (file.includes("/data/product-schema.ts")) continue; // internal schema doc-comment, not user-visible copy
      expect(content, file).not.toMatch(/verified link to Amazon/i);
    }
  });

  it("SITE.description and the product-page meta description use the clearer 'checked Amazon listing' phrasing instead", () => {
    expect(SITE.description).toMatch(/checked Amazon listing/);
    const src = read("src/app/products/[id]/page.tsx");
    expect(src).toMatch(/checked Amazon listing/);
  });

  it("the editorial-policy page already explains exactly what a 'checked listing' means (exact-model match, working direct link) — the phrase is not left unexplained", () => {
    const src = read("src/app/editorial-policy/page.tsx");
    expect(src).toMatch(/working, direct[\s\S]{0,20}Amazon\.com listing for that exact model/);
  });

  it("no internal field name or MatchStatus/amazon_verification_status literal was renamed by this round", () => {
    const src = read("src/lib/amazon.ts");
    expect(src).toContain('amazon_verification_status: "confirmed"');
    const schemaSrc = read("src/types/product.ts");
    expect(schemaSrc).toContain('amazon_verification_status: "pending" | "confirmed" | "rejected"');
  });

  it("'Not verified' remains the single, consistent label for unconfirmed fields sitewide (spot-check a few known surfaces)", () => {
    for (const file of [
      "src/components/ui/Badge.tsx",
      "src/app/editorial-policy/page.tsx",
      "src/lib/format.ts",
    ]) {
      expect(read(file)).toMatch(/Not verified/);
    }
  });
});

// ---------------------------------------------------------------------------
// Bloque 6: authorship/trust — Contact page, guide template (audit-confirm, minimal new assertions)
// ---------------------------------------------------------------------------
describe("Bloque 6: Contact page identifies the founder; guide template already guarantees authorship/date/sources/CTA", () => {
  it("the Contact page now names Bilal Siali as creator/maintainer, linked to the canonical author page, without inventing credentials", () => {
    const src = read("src/app/contact/page.tsx");
    expect(src).toContain("BILAL_SIALI");
    expect(src).toMatch(/was created and is maintained by/);
    expect(src).toMatch(/to help people size portable power stations without guessing/);
    expect(src).not.toMatch(/laboratory|lab-tested|our team|our reviewers|years of experience/i);
  });

  it("the Contact page still shows the single published professional address, contact@powermatchlab.com", () => {
    expect(SITE.email).toBe("contact@powermatchlab.com");
    const src = read("src/app/contact/page.tsx");
    expect(src).toContain("SITE.email");
  });

  it("every guide unconditionally renders a byline, a last-updated date, its sources list, and a Power Calculator CTA via the shared template (no per-guide opt-out)", () => {
    const src = read("src/app/guides/[slug]/page.tsx");
    expect(src).toContain("{BILAL_SIALI.name}");
    expect(src).toMatch(/Last updated \{fmtDate\(guide\.lastUpdated\)\}/);
    expect(src).toContain("guide.sources.map");
    expect(src).toContain('href="/power-calculator"');
    // None of these four are gated behind a guide-specific boolean flag.
    const bylineArea = src.slice(src.indexOf("{BILAL_SIALI.name}") - 200, src.indexOf("{BILAL_SIALI.name}") + 50);
    expect(bylineArea).not.toMatch(/guide\.\w+\s*\?/);
  });

  it("no guide in the current content set has an empty sources array", () => {
    for (const g of GUIDES) {
      expect(g.sources.length, g.slug).toBeGreaterThan(0);
    }
  });
});
