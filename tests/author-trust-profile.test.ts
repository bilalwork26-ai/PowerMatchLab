import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { BILAL_SIALI } from "@/lib/authors";
import { articleJsonLd, personJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { GUIDES } from "@/content/guides";

const ROOT = process.cwd();
const AUTHOR_PAGE = join(ROOT, "src/app/authors/bilal-siali/page.tsx");
const GUIDE_PAGE = join(ROOT, "src/app/guides/[slug]/page.tsx");
const RESEARCH_PAGE = join(
  ROOT,
  "src/app/research/portable-power-station-specs-2026/page.tsx",
);
const ABOUT_PAGE = join(ROOT, "src/app/about-methodology/page.tsx");
const SITEMAP = join(ROOT, "src/app/sitemap.ts");
const PRODUCTS_JSON = join(ROOT, "products.json");

const FORBIDDEN_CLAIMS = [
  "engineer",
  "certified",
  "certification",
  "degree",
  "laboratory tested",
  "lab-tested",
  "physically test",
  "hands-on RV",
  "RV owner",
  "expert",
  "industry leader",
  "independent tester",
  "award",
  "member of",
];

describe("Canonical author object", () => {
  it("contains the approved name, role, email, URL and market", () => {
    expect(BILAL_SIALI.name).toBe("Bilal Siali");
    expect(BILAL_SIALI.jobTitle).toBe("Founder and editor");
    expect(BILAL_SIALI.email).toBe("contact@powermatchlab.com");
    expect(BILAL_SIALI.path).toBe("/authors/bilal-siali");
    expect(BILAL_SIALI.market).toBe("United States");
  });

  it("carries the approved biography verbatim", () => {
    expect(BILAL_SIALI.bio).toBe(
      "Bilal Siali is the founder and editor of PowerMatchLab. He researches manufacturer-published specifications and oversees the development of transparent tools for calculating and comparing portable power stations. PowerMatchLab does not perform laboratory testing, and information that cannot be confirmed is identified as not verified.",
    );
  });

  it("biography states the no-lab-testing and not-verified limitation language", () => {
    expect(BILAL_SIALI.bio).toContain("does not perform laboratory testing");
    expect(BILAL_SIALI.bio).toContain("not verified");
  });

  it("does not contain any invented credential, award, or physical-testing claim", () => {
    const haystack = JSON.stringify(BILAL_SIALI).toLowerCase();
    for (const phrase of FORBIDDEN_CLAIMS) {
      expect(haystack, `unexpected claim: "${phrase}"`).not.toContain(phrase.toLowerCase());
    }
  });

  it("has no sameAs / social-profile field", () => {
    expect((BILAL_SIALI as unknown as Record<string, unknown>).sameAs).toBeUndefined();
  });
});

describe("personJsonLd builder", () => {
  const node = personJsonLd({
    name: BILAL_SIALI.name,
    path: BILAL_SIALI.path,
    email: BILAL_SIALI.email,
    jobTitle: BILAL_SIALI.jobTitle,
    worksFor: "PowerMatchLab",
    knowsAbout: BILAL_SIALI.knowsAbout,
  });

  it("emits valid Person structured data", () => {
    expect(node["@context"]).toBe("https://schema.org");
    expect(node["@type"]).toBe("Person");
    expect(node.name).toBe("Bilal Siali");
    expect(node.jobTitle).toBe("Founder and editor");
  });

  it("uses the canonical absolute author URL", () => {
    expect(node.url).toMatch(/\/authors\/bilal-siali$/);
  });

  it("includes a truthful worksFor Organization reference", () => {
    expect(node.worksFor).toEqual({ "@type": "Organization", name: "PowerMatchLab" });
  });

  it("never emits sameAs", () => {
    expect((node as Record<string, unknown>).sameAs).toBeUndefined();
  });

  it("never emits a credential, award, or lab-testing claim", () => {
    const haystack = JSON.stringify(node).toLowerCase();
    for (const phrase of FORBIDDEN_CLAIMS) {
      expect(haystack, `unexpected claim: "${phrase}"`).not.toContain(phrase.toLowerCase());
    }
  });

  it("email is expressed as a mailto: URI matching the canonical author email", () => {
    expect(node.email).toBe(`mailto:${BILAL_SIALI.email}`);
  });
});

describe("articleJsonLd with a named Person author", () => {
  it("defaults to an Organization author when no author is passed (backward compatible)", () => {
    const node = articleJsonLd({ headline: "x", description: "x", path: "/x" });
    expect(node.author).toEqual({ "@type": "Organization", name: "PowerMatchLab" });
  });

  it("uses a Person with the canonical author URL when an author is passed", () => {
    const node = articleJsonLd({
      headline: "x",
      description: "x",
      path: "/x",
      author: { name: BILAL_SIALI.name, path: BILAL_SIALI.path },
    });
    expect(node.author["@type"]).toBe("Person");
    expect(node.author.name).toBe("Bilal Siali");
    expect(node.author.url).toMatch(/\/authors\/bilal-siali$/);
  });

  it("never represents the author as a product tester", () => {
    const node = articleJsonLd({
      headline: "x",
      description: "x",
      path: "/x",
      author: { name: BILAL_SIALI.name, path: BILAL_SIALI.path },
    });
    expect(JSON.stringify(node).toLowerCase()).not.toContain("tester");
  });

  it("preserves the existing Organization publisher", () => {
    const node = articleJsonLd({
      headline: "x",
      description: "x",
      path: "/x",
      author: { name: BILAL_SIALI.name, path: BILAL_SIALI.path },
    });
    expect(node.publisher).toEqual({ "@type": "Organization", name: "PowerMatchLab" });
  });
});

describe("Author page source", () => {
  const src = readFileSync(AUTHOR_PAGE, "utf8");

  it("exists at src/app/authors/bilal-siali/page.tsx", () => {
    expect(existsSync(AUTHOR_PAGE)).toBe(true);
  });

  it("is indexable (no noindex passed to pageMetadata)", () => {
    expect(src).not.toMatch(/noindex:\s*true/);
  });

  it("builds its metadata from pageMetadata with the canonical author path", () => {
    expect(src).toContain("pageMetadata({");
    expect(src).toContain("path: PATH");
    expect(src).toContain("BILAL_SIALI.path");
  });

  it("renders the H1 as the author's name via PageHero title", () => {
    expect(src).toContain("title={BILAL_SIALI.name}");
  });

  it("emits Person and BreadcrumbList JSON-LD, and nothing else", () => {
    expect(src).toContain("personJsonLd(");
    expect(src).toContain("breadcrumbJsonLd(");
    expect(src).not.toContain("articleJsonLd(");
    expect(src).not.toContain("productJsonLd(");
  });

  it("does not pass a sameAs property", () => {
    expect(src).not.toContain("sameAs");
  });

  it("links to About & Methodology, Editorial Policy, the dataset report, and the Power Calculator", () => {
    expect(src).toContain('href="/about-methodology"');
    expect(src).toContain('href="/editorial-policy"');
    expect(src).toContain('href="/research/portable-power-station-specs-2026"');
    expect(src).toContain('href="/power-calculator"');
  });

  it("links to the contact email via mailto:", () => {
    expect(src).toContain("mailto:${BILAL_SIALI.email}");
  });

  it("states PowerMatchLab does not physically or laboratory-test products", () => {
    expect(src).toMatch(/does not physically or laboratory-test products/);
  });

  it("does not use unsupported claim words", () => {
    const lower = src.toLowerCase();
    for (const phrase of FORBIDDEN_CLAIMS) {
      expect(lower, `unexpected claim: "${phrase}"`).not.toContain(phrase.toLowerCase());
    }
  });

  it("does not render an <img> (no fabricated photograph) — only a decorative initials mark", () => {
    expect(src).not.toContain("<img");
    expect(src).not.toContain("next/image");
  });
});

describe("About & Methodology links to the author page", () => {
  const src = readFileSync(ABOUT_PAGE, "utf8");

  it("has a 'Who runs PowerMatchLab' section", () => {
    expect(src).toContain("Who runs PowerMatchLab");
  });

  it("links Bilal Siali's name to the canonical author path", () => {
    expect(src).toContain("BILAL_SIALI.path");
    expect(src).toContain("BILAL_SIALI.name");
  });

  it("still preserves the no-physical-testing disclosure", () => {
    expect(src).toMatch(/do not physically test them|does not perform laboratory testing/);
  });
});

describe("Guide bylines link to the author page", () => {
  const src = readFileSync(GUIDE_PAGE, "utf8");

  it("renders 'By Bilal Siali' linked to the canonical author path", () => {
    expect(src).toContain("By{\" \"}");
    expect(src).toContain("href={BILAL_SIALI.path}");
    expect(src).toContain("{BILAL_SIALI.name}");
  });

  it("passes a Person author into the guide's articleJsonLd call", () => {
    expect(src).toMatch(/articleJsonLd\(\{[\s\S]*?author:\s*\{\s*name:\s*BILAL_SIALI\.name/);
  });

  it("every guide has a genuine lastUpdated date reused for the byline (no invented dates)", () => {
    for (const g of GUIDES) {
      expect(g.lastUpdated, `${g.slug} missing lastUpdated`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("Dataset report uses the compiled-by byline", () => {
  const src = readFileSync(RESEARCH_PAGE, "utf8");

  it('uses "Compiled and maintained by Bilal Siali"', () => {
    expect(src).toContain("Compiled and maintained by");
    expect(src).toContain("{BILAL_SIALI.name}");
  });

  it("links the byline to the canonical author path", () => {
    expect(src).toContain("href={BILAL_SIALI.path}");
  });

  it("does not add an Article/TechArticle schema (Dataset schema is untouched)", () => {
    expect(src).not.toContain("articleJsonLd(");
    expect(src).toContain("datasetJsonLd(");
  });
});

describe("Sitemap includes the author page", () => {
  const src = readFileSync(SITEMAP, "utf8");

  it('lists "/authors/bilal-siali" in the static paths', () => {
    expect(src).toContain('"/authors/bilal-siali"');
  });
});

describe("Functional/legal pages do not receive an author byline", () => {
  const noByline = [
    "src/app/power-calculator/page.tsx",
    "src/app/compare/page.tsx",
    "src/app/products/page.tsx",
    "src/app/privacy-policy/page.tsx",
    "src/app/terms/page.tsx",
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
  it("products.json hash is unchanged from the pre-implementation baseline", () => {
    const buf = readFileSync(PRODUCTS_JSON);
    const hash = createHash("sha256").update(buf).digest("hex");
    expect(hash).toBe(
      "57d831f7cc4d1d36bcf93c6579ada830541c937e09bf4230408a071ffd8aa270",
    );
  });

  it("no product/calculator/recommendation source file references the author module", () => {
    const files = [
      "src/lib/score.ts",
      "src/lib/size-fit.ts",
      "src/lib/assumptions.ts",
      "src/data/products.ts",
      "src/data/product-schema.ts",
    ];
    for (const rel of files) {
      const full = join(ROOT, rel);
      if (!existsSync(full)) continue;
      const src = readFileSync(full, "utf8");
      expect(src).not.toContain("authors");
      expect(src).not.toContain("BILAL_SIALI");
    }
  });
});

describe("breadcrumbJsonLd sanity for the author page", () => {
  it("builds a two-level Home → Bilal Siali trail", () => {
    const node = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: BILAL_SIALI.name, path: BILAL_SIALI.path },
    ]);
    expect(node.itemListElement).toHaveLength(2);
    expect(node.itemListElement[1].name).toBe("Bilal Siali");
  });
});
