import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import * as seo from "@/lib/seo";

/**
 * Google retired FAQ rich results in May 2026 and removed the supporting
 * documentation in June 2026. FAQPage JSON-LD no longer serves its original
 * purpose anywhere on the site, so the `faqJsonLd()` helper and every call
 * to it were removed (from the guide template, Best-For pages, and the
 * Power Calculator — the only three places that ever used it). This is a
 * sitewide guarantee, not a per-page exception: no page may reintroduce
 * FAQPage structured data.
 *
 * The visible FAQ sections themselves are untouched — this only concerns
 * the JSON-LD emission.
 */

const SRC_DIR = join(process.cwd(), "src");

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

const files = walk(SRC_DIR);
const contents = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));

describe("FAQPage schema: removed sitewide, no orphaned references", () => {
  it("faqJsonLd is no longer exported from src/lib/seo.ts", () => {
    expect((seo as Record<string, unknown>).faqJsonLd).toBeUndefined();
  });

  it("no file under src/ contains the literal \"FAQPage\" schema type", () => {
    const offenders = files.filter((f) => contents.get(f)!.includes("FAQPage"));
    expect(offenders, `found in: ${offenders.join(", ")}`).toEqual([]);
  });

  it("no file under src/ still imports or calls faqJsonLd", () => {
    const offenders = files.filter((f) => contents.get(f)!.includes("faqJsonLd"));
    expect(offenders, `found in: ${offenders.join(", ")}`).toEqual([]);
  });

  it("the three formerly-affected pages no longer reference faqJsonLd or FAQPage", () => {
    for (const rel of [
      "src/app/guides/[slug]/page.tsx",
      "src/components/bestfor/BestForPage.tsx",
      "src/app/power-calculator/page.tsx",
    ]) {
      const src = contents.get(join(process.cwd(), rel))!;
      expect(src, `${rel} still references faqJsonLd`).not.toContain("faqJsonLd");
      expect(src, `${rel} still references FAQPage`).not.toContain("FAQPage");
    }
  });
});

describe("FAQPage schema removal: visible FAQ content is untouched", () => {
  it("the guide template still renders guide.faq as a visible FAQ section", () => {
    const src = contents.get(join(process.cwd(), "src/app/guides/[slug]/page.tsx"))!;
    expect(src).toContain("guide.faq.length ?");
    expect(src).toContain("guide.faq.map");
  });

  it("Best-For pages still render content.faq as a visible FAQ section", () => {
    const src = contents.get(
      join(process.cwd(), "src/components/bestfor/BestForPage.tsx"),
    )!;
    expect(src).toContain("content.faq.map");
  });

  it("the Power Calculator still renders its FAQ constant as a visible FAQ section", () => {
    const src = contents.get(join(process.cwd(), "src/app/power-calculator/page.tsx"))!;
    expect(src).toContain("const FAQ = [");
    expect(src).toContain("FAQ.map");
  });
});

describe("FAQPage schema removal: legitimate structured data is preserved", () => {
  it("breadcrumbJsonLd and articleJsonLd are still exported and usable", () => {
    expect(typeof seo.breadcrumbJsonLd).toBe("function");
    expect(typeof seo.articleJsonLd).toBe("function");
    expect(seo.breadcrumbJsonLd([{ name: "Home", path: "/" }])["@type"]).toBe(
      "BreadcrumbList",
    );
    expect(
      seo.articleJsonLd({ headline: "x", description: "x", path: "/x" })["@type"],
    ).toBe("Article");
  });

  it("organizationJsonLd and webSiteJsonLd (the sitewide global schemas) are still exported", () => {
    expect(typeof seo.organizationJsonLd).toBe("function");
    expect(typeof seo.webSiteJsonLd).toBe("function");
  });

  it("the guide template still emits BreadcrumbList and Article for every guide", () => {
    const src = contents.get(join(process.cwd(), "src/app/guides/[slug]/page.tsx"))!;
    expect(src).toContain("breadcrumbJsonLd(crumbs)");
    expect(src).toContain("articleJsonLd({");
  });

  it("Best-For pages still emit BreadcrumbList", () => {
    const src = contents.get(
      join(process.cwd(), "src/components/bestfor/BestForPage.tsx"),
    )!;
    expect(src).toContain("breadcrumbJsonLd(crumbs)");
  });

  it("the Power Calculator still emits BreadcrumbList", () => {
    const src = contents.get(join(process.cwd(), "src/app/power-calculator/page.tsx"))!;
    expect(src).toContain("breadcrumbJsonLd([");
  });
});
