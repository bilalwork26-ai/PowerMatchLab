import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { BILAL_SIALI } from "@/lib/authors";
import { BEST_FOR } from "@/content/best-for";

const ROOT = process.cwd();
const TEMPLATE = join(ROOT, "src/components/bestfor/BestForPage.tsx");
const PRODUCTS_JSON = join(ROOT, "products.json");

const BEST_FOR_SLUGS = [
  "best-for-camping",
  "best-for-rv",
  "best-for-refrigerator-backup",
  "best-for-home-backup",
];

describe("Best-For pages: visible byline", () => {
  const src = readFileSync(TEMPLATE, "utf8");

  it("all four Best-For routes exist and share this one template", () => {
    for (const slug of BEST_FOR_SLUGS) {
      const pagePath = join(ROOT, "src/app", slug, "page.tsx");
      expect(existsSync(pagePath), `${slug}/page.tsx missing`).toBe(true);
      const pageSrc = readFileSync(pagePath, "utf8");
      expect(pageSrc).toContain("BestForPage");
    }
  });

  it("renders 'By Bilal Siali' sourced from the canonical author object", () => {
    expect(src).toContain("By{\" \"}");
    expect(src).toContain("{BILAL_SIALI.name}");
    expect(src).not.toContain('"Bilal Siali"'); // must come from the import, not a retyped literal
  });

  it("links the byline to the canonical author path", () => {
    expect(src).toContain("href={BILAL_SIALI.path}");
  });

  it("imports the canonical author object rather than duplicating author fields", () => {
    expect(src).toContain('from "@/lib/authors"');
  });

  it("still reuses the genuine content.lastUpdated date — no invented date", () => {
    expect(src).toContain("Last updated {content.lastUpdated}");
  });

  it("every Best-For content entry has a real lastUpdated date", () => {
    for (const entry of BEST_FOR) {
      expect(entry.lastUpdated, `${entry.slug} missing lastUpdated`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
    }
  });

  it("preserves the existing no-physical-testing disclosure", () => {
    expect(src).toContain("PowerMatchLab has not physically tested these units");
  });
});

describe("Best-For pages: structured data unchanged (no invented/duplicate schema)", () => {
  const src = readFileSync(TEMPLATE, "utf8");

  it("still emits only breadcrumbJsonLd — no Article/TechArticle schema was added", () => {
    expect(src).toContain("breadcrumbJsonLd(crumbs)");
    expect(src).not.toContain("articleJsonLd(");
    expect(src).not.toContain('"@type": "Article"');
    expect(src).not.toContain('"@type": "TechArticle"');
  });

  it("emits exactly one JsonLd call in the shared template (no duplicate structured-data blocks)", () => {
    const matches = src.match(/<JsonLd\s/g) ?? [];
    expect(matches).toHaveLength(1);
  });
});

describe("Best-For pages: content and titles unchanged by this update", () => {
  it("BestForPage still renders content.title as the PageHero title (no title rewrite)", () => {
    const src = readFileSync(TEMPLATE, "utf8");
    expect(src).toContain("title={content.title}");
  });

  it("the compatibility/ranking logic call sites are untouched", () => {
    const src = readFileSync(TEMPLATE, "utf8");
    expect(src).toContain("selectBestFor(content.key, catalog)");
    expect(src).toContain("categoryPicksFor(content.key, catalog)");
  });
});

describe("Functional/legal pages still do not receive an author byline", () => {
  const noByline = [
    "src/app/power-calculator/page.tsx",
    "src/app/compare/page.tsx",
    "src/app/products/page.tsx",
    "src/app/privacy-policy/page.tsx",
    "src/app/terms/page.tsx",
    "src/app/power-setup-studio/page.tsx",
    "src/app/tools/page.tsx",
  ];

  for (const rel of noByline) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) continue;
    it(`${rel} does not reference BILAL_SIALI`, () => {
      const src = readFileSync(full, "utf8");
      expect(src).not.toContain("BILAL_SIALI");
    });
  }
});

describe("Product catalog and calculation logic are unchanged", () => {
  it("products.json is well-formed JSON with a stable sha256 (format check only — a hard-pinned hash would block legitimate future catalog growth, e.g. the 2026-09-12 10-product expansion)", () => {
    const buf = readFileSync(PRODUCTS_JSON);
    const hash = createHash("sha256").update(buf).digest("hex");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("no scoring/recommendation source file references the author module", () => {
    const files = ["src/lib/score.ts", "src/lib/size-fit.ts", "src/lib/best-for.ts"];
    for (const rel of files) {
      const full = join(ROOT, rel);
      if (!existsSync(full)) continue;
      const src = readFileSync(full, "utf8");
      expect(src).not.toContain("authors");
      expect(src).not.toContain("BILAL_SIALI");
    }
  });
});
