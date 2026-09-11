import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Milestone 5: discreet persistent mobile CTA on product pages", () => {
  const mobileBuyBar = read("src/components/product/MobileBuyBar.tsx");
  const productPage = read("src/app/products/[id]/page.tsx");

  it("MobileBuyBar is mobile-only, sits above the global bottom nav, and never fabricates a link", () => {
    expect(mobileBuyBar).toContain("md:hidden");
    expect(mobileBuyBar).toContain("bottom-20");
    expect(mobileBuyBar).toContain("resolveAmazonLink");
    // Honest fallback when there is no href, same rule as AmazonCta.
    expect(mobileBuyBar).toContain("Not verified");
  });

  it("the product page renders MobileBuyBar and reserves extra bottom space for it on mobile", () => {
    expect(productPage).toContain("import { MobileBuyBar }");
    expect(productPage).toContain("<MobileBuyBar product={product} />");
    expect(productPage).toContain("pb-32");
  });

  it("the product page shows the last-verified date next to the primary Amazon CTA, not just in the spec table", () => {
    const ctaBlockIndex = productPage.indexOf("<AmazonCta product={product} size=\"md\"");
    const dateLineIndex = productPage.indexOf("Specs last checked {fmtDate(product.last_verified)}");
    expect(dateLineIndex).toBeGreaterThan(-1);
    expect(dateLineIndex).toBeLessThan(ctaBlockIndex);
  });

  it("comparison pages show a last-verified date next to each product's own Amazon CTA", () => {
    const src = read("src/components/compare/ModelComparisonPage.tsx");
    expect(src).toContain("Specs last checked {fmtDate(p.last_verified)}");
  });
});

describe("Milestone 5: best-for pages surface the recommendation before the prose", () => {
  const src = read("src/components/bestfor/BestForPage.tsx");

  it("Top picks and Shortlist comparison each appear exactly once", () => {
    expect(src.match(/Top picks for/g)?.length).toBe(1);
    expect(src.match(/Shortlist comparison/g)?.length).toBe(1);
  });

  it("Top picks and the shortlist table now render before the explanatory sections", () => {
    const introEnd = src.indexOf("What actually matters");
    const topPicks = src.indexOf("Top picks for");
    const shortlist = src.indexOf("Shortlist comparison");
    const commonMistakes = src.indexOf("Common mistakes");
    expect(topPicks).toBeGreaterThan(-1);
    expect(shortlist).toBeGreaterThan(topPicks);
    expect(shortlist).toBeLessThan(introEnd);
    expect(introEnd).toBeLessThan(commonMistakes);
  });
});

describe("Milestone 5: guide 'Next steps' tools sidebar isn't buried on mobile", () => {
  it("the sidebar is reordered ahead of the article on small screens only", () => {
    const src = read("src/app/guides/[slug]/page.tsx");
    expect(src).toContain('<aside className="order-first lg:order-none lg:sticky lg:top-20 lg:h-fit">');
  });
});
