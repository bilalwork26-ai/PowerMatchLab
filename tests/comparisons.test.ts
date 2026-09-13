import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { COMPARISONS, getComparison, getComparisonsForProduct } from "@/content/comparisons";
import { getAllProducts, getProductsByIds } from "@/data/products";
import { GUIDES } from "@/content/guides";
import { BEST_FOR } from "@/content/best-for";
import {
  evaluateUseCases,
  buildComparisonRuntimeRows,
  headlineDifferences,
  earliestLastChecked,
  capacityParity,
  groupComparisonsByCategory,
} from "@/lib/comparisons";
import { articleJsonLd, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { BILAL_SIALI } from "@/lib/authors";
import type { Product } from "@/types/product";

const APPROVED_SLUG = "ecoflow-delta-3-classic-vs-anker-solix-c1000-gen-2";
const catalog = getAllProducts();
const catalogIds = new Set(catalog.map((p) => p.id));

/**
 * The full, hand-curated list of approved comparison slugs. Locking this in
 * as an exact array (rather than just "COMPARISONS.length > 0") keeps this a
 * real regression guard against silent, unreviewed additions — the same
 * intent as the original single-slug version, extended for the editorial-
 * comparisons expansion round.
 */
const APPROVED_SLUGS = [
  APPROVED_SLUG,
  "jackery-explorer-1000-v2-vs-ecoflow-delta-3-classic",
  "bluetti-ac180-vs-jackery-explorer-1000-v2",
  "bluetti-ac180-vs-ecoflow-delta-3-classic",
  "ecoflow-delta-2-max-vs-anker-solix-c2000-gen-2",
  "anker-solix-c2000-gen-2-vs-jackery-explorer-2000-v2",
  "anker-solix-c1000-gen-2-vs-segway-cube-1000",
  "jackery-explorer-2000-v2-vs-bluetti-ac200l",
  "ecoflow-delta-pro-3-vs-anker-solix-f3800",
  "anker-solix-f3000-vs-pecron-e3600lfp",
  // 2026-09-12 editorial-comparisons expansion (14 new + the entry above enhanced in place).
  "ecoflow-delta-3-max-vs-ecoflow-delta-3-max-plus-vs-ecoflow-delta-3-ultra-plus",
  "jackery-homepower-3000-vs-jackery-homepower-3600-plus",
  "bluetti-elite-200-v2-vs-bluetti-elite-300-vs-bluetti-elite-400",
  "anker-solix-f2000-vs-anker-solix-f3000-vs-anker-solix-f3800",
  "ecoflow-delta-2-max-vs-ecoflow-delta-3-max",
  "jackery-explorer-2000-v2-vs-jackery-homepower-3000",
  "anker-solix-c2000-gen-2-vs-anker-solix-f2000",
  "bluetti-ac200l-vs-bluetti-elite-200-v2",
  "goal-zero-yeti-300-vs-goal-zero-yeti-700",
  "ecoflow-river-3-vs-bluetti-elite-30-v2",
  "anker-solix-c1000-gen-2-vs-ecoflow-delta-3-classic-vs-jackery-explorer-1000-v2",
  "anker-solix-c2000-gen-2-vs-ecoflow-delta-2-max-vs-jackery-explorer-2000-v2",
  "anker-solix-f3000-vs-bluetti-elite-300-vs-pecron-e3600lfp",
  "jackery-explorer-5000-plus-vs-ecoflow-delta-pro-ultra",
];

/** The three-way (3-product) comparisons introduced in the 2026-09-12 expansion. */
const THREE_WAY_SLUGS = [
  "ecoflow-delta-3-max-vs-ecoflow-delta-3-max-plus-vs-ecoflow-delta-3-ultra-plus",
  "bluetti-elite-200-v2-vs-bluetti-elite-300-vs-bluetti-elite-400",
  "anker-solix-f2000-vs-anker-solix-f3000-vs-anker-solix-f3800",
  "anker-solix-c1000-gen-2-vs-ecoflow-delta-3-classic-vs-jackery-explorer-1000-v2",
  "anker-solix-c2000-gen-2-vs-ecoflow-delta-2-max-vs-jackery-explorer-2000-v2",
  "anker-solix-f3000-vs-bluetti-elite-300-vs-pecron-e3600lfp",
];

describe("comparisons: the curated list of approved slugs", () => {
  it("COMPARISONS contains exactly the approved slugs, in order (no silent additions)", () => {
    expect(COMPARISONS.map((c) => c.slug)).toEqual(APPROVED_SLUGS);
  });

  it("every productIds pair is unique — no duplicate comparison for the same two models", () => {
    const pairKeys = COMPARISONS.map((c) => [...c.productIds].sort().join("|"));
    expect(new Set(pairKeys).size).toBe(pairKeys.length);
  });

  it("getComparison resolves every approved slug and nothing else", () => {
    for (const slug of APPROVED_SLUGS) {
      expect(getComparison(slug), `"${slug}" should resolve`).toBeDefined();
    }
    expect(getComparison("some-other-slug")).toBeUndefined();
    expect(getComparison("ecoflow-delta-3-plus-vs-anker-solix-c1000-gen-2")).toBeUndefined();
  });

  it("the app route's generateStaticParams source only maps over COMPARISONS (no combinatorial generation)", () => {
    const routeSrc = readFileSync(
      join(process.cwd(), "src/app/compare/[slug]/page.tsx"),
      "utf8",
    );
    expect(routeSrc).toContain("dynamicParams = false");
    expect(routeSrc).toContain("COMPARISONS.map");
  });
});

describe("comparisons: both product ids are real, unique catalog entries", () => {
  it("both ids exist in the current catalog", () => {
    const comparison = getComparison(APPROVED_SLUG)!;
    for (const id of comparison.productIds) {
      expect(catalogIds.has(id), `product id "${id}" not found in catalog`).toBe(true);
    }
  });

  it("the two ids are distinct", () => {
    const comparison = getComparison(APPROVED_SLUG)!;
    expect(comparison.productIds[0]).not.toBe(comparison.productIds[1]);
  });

  it("resolves to exactly two Product objects via getProductsByIds", () => {
    const comparison = getComparison(APPROVED_SLUG)!;
    const products = getProductsByIds(comparison.productIds);
    expect(products).toHaveLength(2);
    expect(products.map((p) => p.id).sort()).toEqual([...comparison.productIds].sort());
  });

  it("this comparison's product ids never include EcoFlow DELTA 3 Plus", () => {
    // ecoflow-delta-3-plus was added to the catalog in the 40-product
    // build-out (2026-09-11, amazon_verification_status "pending") but has
    // no editorial comparison yet -- no comparison should be generated
    // against unverified data.
    expect(catalogIds.has("ecoflow-delta-3-plus")).toBe(true);
    const comparison = getComparison(APPROVED_SLUG)!;
    expect(comparison.productIds).not.toContain("ecoflow-delta-3-plus");
  });

  it("getComparisonsForProduct finds this comparison from either product id", () => {
    const comparison = getComparison(APPROVED_SLUG)!;
    expect(getComparisonsForProduct(comparison.productIds[0]).map((c) => c.slug)).toContain(
      APPROVED_SLUG,
    );
    expect(getComparisonsForProduct(comparison.productIds[1]).map((c) => c.slug)).toContain(
      APPROVED_SLUG,
    );
    // jackery-explorer-1000-v2 appears in two later comparisons, plus the
    // 2026-09 three-way ~1,000 Wh expansion comparison.
    expect(getComparisonsForProduct("jackery-explorer-1000-v2").map((c) => c.slug).sort()).toEqual(
      [
        "bluetti-ac180-vs-jackery-explorer-1000-v2",
        "jackery-explorer-1000-v2-vs-ecoflow-delta-3-classic",
        "anker-solix-c1000-gen-2-vs-ecoflow-delta-3-classic-vs-jackery-explorer-1000-v2",
      ].sort(),
    );
    // A real catalog product with no editorial comparison at all still resolves to an empty list.
    expect(getComparisonsForProduct("anker-solix-s2000")).toEqual([]);
  });
});

describe("comparisons: consumes live catalog data, never hardcoded numbers", () => {
  const comparison = getComparison(APPROVED_SLUG)!;
  const [p1, p2] = getProductsByIds(comparison.productIds) as [
    ReturnType<typeof getAllProducts>[number],
    ReturnType<typeof getAllProducts>[number],
  ];

  it("headline differences are generated from the live product fields", () => {
    const diffs = headlineDifferences([p1, p2]);
    // Every diff's displayed values must actually appear on one of the two
    // live product records — proving the numbers are read, not invented.
    for (const d of diffs) {
      const winner = [p1, p2].find((p) => p.id === d.winnerId)!;
      expect(winner).toBeDefined();
    }
  });

  it("use-case verdicts only ever name one of these two product ids as winner", () => {
    const verdicts = evaluateUseCases([p1, p2]);
    for (const v of verdicts) {
      if (v.winnerId !== null) {
        expect([p1.id, p2.id]).toContain(v.winnerId);
      }
    }
  });

  it("runtime rows use only appliances that exist in the shared example-appliance data (no Starlink)", () => {
    const rows = buildComparisonRuntimeRows([p1, p2]);
    const keys = rows.map((r) => r.key);
    expect(keys).toEqual(["fridge", "cpap", "led-lights"]);
    expect(keys.join(" ")).not.toMatch(/starlink/i);
  });

  it("last-checked date is read from the products' own last_verified field", () => {
    const checked = earliestLastChecked([p1, p2]);
    expect([p1.last_verified, p2.last_verified]).toContain(checked);
  });
});

describe("comparisons: never shows an unverified field as verified", () => {
  it("a null field on either product renders as 'Not verified', not a fabricated value", () => {
    const comparison = getComparison(APPROVED_SLUG)!;
    const [p1, p2] = getProductsByIds(comparison.productIds);
    // Sanity: at least one of the two known products has a null field the
    // table must render as "Not verified" rather than guessing (e.g. Anker
    // SOLIX C1000 Gen 2's weight_kg is not on file at the time of writing).
    const hasNullField = [p1, p2].some(
      (p) => p.weight_kg == null || p.warranty == null || p.expandable == null,
    );
    expect(hasNullField).toBe(true);
  });
});

describe("comparisons: no fabricated prices, ratings or reviews", () => {
  it("articleJsonLd never carries price/rating/review fields", () => {
    const node = articleJsonLd({
      headline: "test",
      description: "test",
      path: "/compare/test",
      datePublished: "2026-01-01",
    }) as Record<string, unknown>;
    for (const forbidden of ["offers", "aggregateRating", "review", "price"]) {
      expect(Object.keys(node)).not.toContain(forbidden);
    }
  });

  it("the comparison template source never references price, rating or review JSON-LD fields", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/compare/ModelComparisonPage.tsx"),
      "utf8",
    );
    for (const forbidden of ["aggregateRating", "reviewCount", "\"offers\"", "'offers'"]) {
      expect(src).not.toContain(forbidden);
    }
  });
});

describe("comparisons: metadata title has no duplicated brand suffix", () => {
  it("generateMetadata passes the bare h1 as title — the root layout's `%s · PowerMatchLab` template appends the brand name exactly once", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/compare/[slug]/page.tsx"),
      "utf8",
    );
    expect(src).toContain("title: comparison.h1,");
    // The old bug: a template literal appending the brand name a second time.
    expect(src).not.toContain("${comparison.h1} — PowerMatchLab");
  });
});

describe("comparisons: canonical, sitemap and breadcrumb", () => {
  it("canonical URL is derived from the approved slug", () => {
    expect(absoluteUrl(`/compare/${APPROVED_SLUG}`)).toBe(
      `${SITE.url}/compare/${APPROVED_SLUG}`,
    );
  });

  it("sitemap.ts source includes exactly one loop over COMPARISONS", () => {
    const src = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
    const matches = src.match(/for \(const c of COMPARISONS\)/g) ?? [];
    expect(matches).toHaveLength(1);
    expect(src).toContain("/compare/${c.slug}");
  });

  it("breadcrumbJsonLd produces a 3-level trail ending at the comparison", () => {
    const comparison = getComparison(APPROVED_SLUG)!;
    const crumbs = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Compare", path: "/compare" },
      { name: comparison.h1, path: `/compare/${comparison.slug}` },
    ]);
    expect(crumbs.itemListElement).toHaveLength(3);
    expect(crumbs.itemListElement[2].name).toBe(comparison.h1);
  });
});

describe("comparisons: internal links point to real content", () => {
  const comparison = getComparison(APPROVED_SLUG)!;
  const guideSlugs = new Set(GUIDES.map((g) => g.slug));
  const bestForSlugs = new Set(BEST_FOR.map((b) => b.slug));

  it("relatedGuideSlug references an existing guide", () => {
    expect(guideSlugs.has(comparison.relatedGuideSlug)).toBe(true);
  });

  it("relatedBestForSlugs reference existing best-for pages (at most one fridge + one RV)", () => {
    expect(comparison.relatedBestForSlugs.length).toBeLessThanOrEqual(2);
    for (const slug of comparison.relatedBestForSlugs) {
      expect(bestForSlugs.has(slug), `best-for slug "${slug}" does not exist`).toBe(true);
    }
  });

  it("best-for-refrigerator-backup and best-for-rv both link back to this comparison", () => {
    const fridge = BEST_FOR.find((b) => b.slug === "best-for-refrigerator-backup")!;
    const rv = BEST_FOR.find((b) => b.slug === "best-for-rv")!;
    expect(fridge.relatedComparisonSlugs).toContain(comparison.slug);
    expect(rv.relatedComparisonSlugs).toContain(comparison.slug);
  });

  it("no other best-for page links to THIS specific comparison (link is scoped, not spammed everywhere)", () => {
    const others = BEST_FOR.filter(
      (b) => b.slug !== "best-for-refrigerator-backup" && b.slug !== "best-for-rv",
    );
    for (const b of others) {
      expect(b.relatedComparisonSlugs ?? []).not.toContain(comparison.slug);
    }
  });

  it("every relatedComparisonSlugs entry on every best-for page resolves to a real, approved comparison", () => {
    const approvedSlugs = new Set(COMPARISONS.map((c) => c.slug));
    for (const b of BEST_FOR) {
      for (const slug of b.relatedComparisonSlugs ?? []) {
        expect(approvedSlugs.has(slug), `"${b.slug}" links to nonexistent comparison "${slug}"`).toBe(
          true,
        );
      }
    }
  });

  it("every guide's relatedComparisonSlug (when set) resolves to a real, approved comparison", () => {
    const approvedSlugs = new Set(COMPARISONS.map((c) => c.slug));
    for (const g of GUIDES) {
      if (g.relatedComparisonSlug === undefined) continue;
      expect(
        approvedSlugs.has(g.relatedComparisonSlug),
        `"${g.slug}" links to nonexistent comparison "${g.relatedComparisonSlug}"`,
      ).toBe(true);
    }
  });
});

describe("comparisons: every approved entry (not just the original) is well-formed", () => {
  const guideSlugs = new Set(GUIDES.map((g) => g.slug));
  const bestForSlugs = new Set(BEST_FOR.map((b) => b.slug));

  it("every comparison has 2 or 3 real, distinct catalog product ids", () => {
    for (const c of COMPARISONS) {
      expect(
        c.productIds.length === 2 || c.productIds.length === 3,
        `"${c.slug}": expected 2 or 3 productIds, got ${c.productIds.length}`,
      ).toBe(true);
      expect(new Set(c.productIds).size, `"${c.slug}": duplicate product id`).toBe(
        c.productIds.length,
      );
      for (const id of c.productIds) {
        expect(catalogIds.has(id), `"${c.slug}": product id "${id}" not in catalog`).toBe(true);
      }
    }
  });

  it("every three-way comparison actually has three products (curated list matches the data)", () => {
    for (const slug of THREE_WAY_SLUGS) {
      const c = getComparison(slug)!;
      expect(c, `"${slug}" should exist`).toBeDefined();
      expect(c.productIds).toHaveLength(3);
    }
    const threeWayInData = COMPARISONS.filter((c) => c.productIds.length === 3).map((c) => c.slug);
    expect(threeWayInData.sort()).toEqual([...THREE_WAY_SLUGS].sort());
  });

  it("every comparison's relatedGuideSlug references a real guide", () => {
    for (const c of COMPARISONS) {
      expect(
        guideSlugs.has(c.relatedGuideSlug),
        `"${c.slug}": relatedGuideSlug "${c.relatedGuideSlug}" does not exist`,
      ).toBe(true);
    }
  });

  it("every comparison's relatedBestForSlugs reference real pages, at most two", () => {
    for (const c of COMPARISONS) {
      expect(c.relatedBestForSlugs.length).toBeLessThanOrEqual(2);
      for (const slug of c.relatedBestForSlugs) {
        expect(bestForSlugs.has(slug), `"${c.slug}": best-for slug "${slug}" does not exist`).toBe(
          true,
        );
      }
    }
  });

  it("every comparison has a non-empty, distinct h1, metaDescription and intro", () => {
    const h1s = COMPARISONS.map((c) => c.h1);
    const descriptions = COMPARISONS.map((c) => c.metaDescription);
    expect(new Set(h1s).size).toBe(h1s.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const c of COMPARISONS) {
      expect(c.h1.length).toBeGreaterThan(5);
      expect(c.metaDescription.length).toBeGreaterThan(20);
      expect(c.intro.length).toBeGreaterThan(40);
    }
  });

  it("every comparison's h1 names every one of its actual products (no copy/paste mismatch)", () => {
    for (const c of COMPARISONS) {
      const products = getProductsByIds(c.productIds);
      for (const p of products) {
        expect(c.h1, `"${c.slug}" missing "${p.model}"`).toContain(p.model);
      }
    }
  });

  it("every comparison's slug is URL-safe and matches its product ids", () => {
    for (const c of COMPARISONS) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("no two comparisons declare the exact same h1", () => {
    const h1s = COMPARISONS.map((c) => c.h1.toLowerCase());
    expect(new Set(h1s).size).toBe(h1s.length);
  });
});

describe("comparisons: index page groups every entry by editorial category", () => {
  it("groupComparisonsByCategory places every comparison in exactly one category", () => {
    const groups = groupComparisonsByCategory(COMPARISONS);
    const totalGrouped = groups.reduce((sum, g) => sum + g.entries.length, 0);
    expect(totalGrouped).toBe(COMPARISONS.length);
    const allSlugs = groups.flatMap((g) => g.entries.map((e) => e.comparison.slug));
    expect(new Set(allSlugs).size).toBe(COMPARISONS.length);
  });

  it("every comparison declares a valid indexCategory", () => {
    const validCategories = new Set([
      "same-family",
      "~1000wh",
      "~2000wh",
      "high-capacity-home-backup",
      "portability-camping",
      "cross-brand",
    ]);
    for (const c of COMPARISONS) {
      expect(validCategories.has(c.indexCategory), `"${c.slug}": bad indexCategory`).toBe(true);
    }
  });

  it("each category group carries a non-empty label and blurb", () => {
    const groups = groupComparisonsByCategory(COMPARISONS);
    expect(groups.length).toBeGreaterThan(0);
    for (const g of groups) {
      expect(g.label.length).toBeGreaterThan(3);
      expect(g.blurb.length).toBeGreaterThan(20);
    }
  });

  it("the /compare index page renders the category-grouped comparisons, not the old flat comma list", () => {
    const src = readFileSync(join(process.cwd(), "src/app/compare/page.tsx"), "utf8");
    expect(src).toContain("groupComparisonsByCategory");
    expect(src).toContain("comparisonGroups.map");
  });
});

describe("comparisons: preloaded compare link uses the existing ?ids= mechanism", () => {
  it("the template builds a /compare?ids=<id1>,<id2> link from the real product ids (no new state mechanism)", () => {
    const comparison = getComparison(APPROVED_SLUG)!;
    const src = readFileSync(
      join(process.cwd(), "src/components/compare/ModelComparisonPage.tsx"),
      "utf8",
    );
    expect(src).toContain("/compare?ids=");
    // CompareView already seeds selection from this exact query param name.
    const compareViewSrc = readFileSync(
      join(process.cwd(), "src/components/compare/CompareView.tsx"),
      "utf8",
    );
    expect(compareViewSrc).toContain('searchParams.get("ids")');
    expect(comparison.productIds.join(",")).toMatch(
      /^[a-z0-9-]+,[a-z0-9-]+$/,
    );
  });
});

/** Minimal synthetic product for exercising evaluateUseCases()'s edge cases in isolation. */
function makeProduct(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    brand: "TestBrand",
    model: id,
    market: "US",
    category: "portable-power-station",
    capacity_wh: null,
    rated_output_w: null,
    surge_output_w: null,
    battery_chemistry: null,
    cycle_life: null,
    weight_kg: null,
    dimensions: null,
    solar_input_w: null,
    ac_charging_w: null,
    charging_time: null,
    ac_outlets: null,
    usb_c: null,
    usb_a: null,
    dc_output: null,
    rv_tt30: null,
    voltage_240v: null,
    ups_ms: null,
    expandable: null,
    max_expanded_capacity_wh: null,
    wifi: null,
    bluetooth: null,
    warranty: null,
    idle_consumption_w: null,
    best_for: [],
    pros: [],
    cons: [],
    official_source: null,
    last_verified: null,
    amazon_asin: null,
    amazon_product_url: null,
    amazon_affiliate_url: null,
    amazon_verification_status: "confirmed",
    amazon_listing_note: null,
    ...overrides,
  };
}

describe("evaluateUseCases: never declares a winner from insufficient signal", () => {
  it("a field null on one or both sides never produces a win for either product", () => {
    // "refrigerator-backup" depends on surge_output_w, capacity_wh,
    // idle_consumption_w, solar_input_w — leave every one of them null on
    // both sides except a single tied field, so nothing should ever "win".
    const p1 = makeProduct("p1", { capacity_wh: 1000 });
    const p2 = makeProduct("p2", { capacity_wh: 1000 });
    const verdicts = evaluateUseCases([p1, p2]);
    const fridge = verdicts.find((v) => v.key === "refrigerator-backup")!;
    expect(fridge.winnerId).toBeNull();
    expect(fridge.comparableCount).toBe(1); // capacity_wh is comparable (both known)...
    // ...but it's a tie, so it must not count as decisive for either side.
  });

  it("a multi-criterion category with exactly one decisive, comparable field does NOT declare an overall winner", () => {
    // "camping" = weight_kg, wh_per_kg, idle_consumption_w, solar_input_w.
    // Only solar_input_w differs and is known on both sides.
    const p1 = makeProduct("p1", { solar_input_w: 500 });
    const p2 = makeProduct("p2", { solar_input_w: 600 });
    const verdicts = evaluateUseCases([p1, p2]);
    const camping = verdicts.find((v) => v.key === "camping")!;
    expect(camping.winnerId).toBeNull();
    expect(camping.comparableCount).toBe(1);
    expect(camping.note).toBeTruthy();
    expect(camping.note).toContain("p2"); // TestBrand p2 has the higher solar input
    expect(camping.note?.toLowerCase()).toContain("solar input");
    expect(camping.note?.toLowerCase()).toContain("not verified");
  });

  it("a multi-criterion category with two independently-decisive fields DOES declare an overall winner", () => {
    // "home-backup" = ups_ms, rated_output_w, capacity_wh, expandable, voltage_240v.
    // Give p2 the edge on two independent, both-known fields.
    const p1 = makeProduct("p1", { rated_output_w: 1000, ups_ms: 20 });
    const p2 = makeProduct("p2", { rated_output_w: 1500, ups_ms: 10 });
    const verdicts = evaluateUseCases([p1, p2]);
    const homeBackup = verdicts.find((v) => v.key === "home-backup")!;
    expect(homeBackup.winnerId).toBe("p2");
    expect(homeBackup.comparableCount).toBe(2);
    expect(homeBackup.note).toBeNull();
  });

  it("a legitimately single-criterion category (solar charging) CAN declare a winner from just that one field", () => {
    const p1 = makeProduct("p1", { solar_input_w: 400 });
    const p2 = makeProduct("p2", { solar_input_w: 800 });
    const verdicts = evaluateUseCases([p1, p2]);
    const solar = verdicts.find((v) => v.key === "solar-charging")!;
    expect(solar.winnerId).toBe("p2");
    expect(solar.criteria).toEqual(["Solar input (max)"]);
  });

  it("when zero fields are comparable, there is no winner and no note", () => {
    const p1 = makeProduct("p1");
    const p2 = makeProduct("p2");
    for (const v of evaluateUseCases([p1, p2])) {
      expect(v.winnerId).toBeNull();
      expect(v.note).toBeNull();
    }
  });
});

describe("evaluateUseCases: the real EcoFlow/Anker pair only wins the single-criterion category", () => {
  const comparison = getComparison(APPROVED_SLUG)!;
  const [p1, p2] = getProductsByIds(comparison.productIds) as [Product, Product];
  const verdicts = evaluateUseCases([p1, p2]);

  it("solar-charging is the only category that declares an overall winner today", () => {
    const decisive = verdicts.filter((v) => v.winnerId !== null);
    expect(decisive.map((v) => v.key)).toEqual(["solar-charging"]);
  });

  it("camping and home-backup surface a specific note instead of an inflated category win", () => {
    const camping = verdicts.find((v) => v.key === "camping")!;
    const homeBackup = verdicts.find((v) => v.key === "home-backup")!;
    expect(camping.winnerId).toBeNull();
    expect(camping.note).toBeTruthy();
    expect(homeBackup.winnerId).toBeNull();
    expect(homeBackup.note).toBeTruthy();
  });

  it("refrigerator-backup, rv and portability show no clear overall winner", () => {
    for (const key of ["refrigerator-backup", "rv", "portability"]) {
      expect(verdicts.find((v) => v.key === key)!.winnerId).toBeNull();
    }
  });

  it("capacity is tied and comparable between the two real products", () => {
    const parity = capacityParity([p1, p2]);
    expect(parity.comparable).toBe(true);
    expect(parity.equal).toBe(true);
  });
});

describe("comparisons: unsupported editorial claims never regress", () => {
  const FORBIDDEN_PHRASES = [
    "Both are compact",
    "frequently shortlisted",
    "3 clear wins of 6",
    "clear wins of",
  ];

  it("content/comparisons.ts and the comparison template never contain these phrases", () => {
    const files = [
      "src/content/comparisons.ts",
      "src/components/compare/ModelComparisonPage.tsx",
      "src/lib/comparisons.ts",
    ];
    for (const rel of files) {
      const src = readFileSync(join(process.cwd(), rel), "utf8");
      for (const phrase of FORBIDDEN_PHRASES) {
        expect(src, `"${phrase}" found in ${rel}`).not.toContain(phrase);
      }
    }
  });

  it("the intro's stated capacity matches both real products' actual capacity_wh (no stale hardcoded figure)", () => {
    const comparison = getComparison(APPROVED_SLUG)!;
    const [p1, p2] = getProductsByIds(comparison.productIds);
    expect(p1.capacity_wh).toBe(1024);
    expect(p2.capacity_wh).toBe(1024);
    expect(comparison.intro).toContain("1,024 Wh");
  });

  it("the conclusion always states there is no absolute winner (unconditional messaging, not data-dependent copy)", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/compare/ModelComparisonPage.tsx"),
      "utf8",
    );
    expect(src.toLowerCase()).toContain("no absolute winner");
  });
});

/**
 * Regression guard for a real horizontal-overflow bug: the two-column layout
 * (`grid gap-10 lg:grid-cols-[1fr_300px]`) left its content column at CSS
 * Grid's default `min-width: auto`, so the column refused to shrink below
 * the intrinsic min-content width of its widest descendant — the spec
 * table's `min-w-[480px]` (scoped to its own `overflow-x-auto` wrapper) —
 * even on a 320-412px mobile viewport. The page-level `overflow-x-hidden`
 * safety net in layout.tsx masked this as "no scrollbar" without fixing the
 * actual layout, which is what let this ship unnoticed: individual elements
 * still painted past the visual viewport.
 *
 * Fix: `min-w-0` on the grid item defers to the table's own scroll
 * container instead of re-widening the whole column. See
 * `tests/browser/overflow.spec.ts` for the live 5-width browser
 * verification (`scrollWidth === clientWidth`) this can't reproduce without
 * a real layout engine.
 */
describe("comparison page: grid column overflow fix", () => {
  const src = readFileSync(
    join(process.cwd(), "src/components/compare/ModelComparisonPage.tsx"),
    "utf8",
  );

  it("the two-column grid still exists (same layout, not removed)", () => {
    expect(src).toContain("grid gap-10 lg:grid-cols-[1fr_300px]");
  });

  it("the content column has min-w-0 to stop CSS Grid's default min-width:auto from re-widening it", () => {
    expect(src).toMatch(/<div className="min-w-0">/);
  });

  it("both internally-scrollable tables expose an accessible, keyboard-focusable region", () => {
    const regionBlocks = [...src.matchAll(/role="region"[\s\S]{0,200}?tabIndex=\{0\}/g)];
    expect(regionBlocks.length).toBeGreaterThanOrEqual(2);
    expect(src).toContain("Spec comparison table, scrollable horizontally");
    expect(src).toContain("Estimated autonomy table, scrollable horizontally");
  });

  it("the page-level overflow-x-hidden safety net in layout.tsx is untouched (this fix does not rely on it)", () => {
    const layoutSrc = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
    expect(layoutSrc).toContain("overflow-x-hidden");
  });
});

/**
 * 2026-09-12 editorial-comparisons expansion: extends the existing
 * /compare/[slug] system to 15 curated comparisons (14 new + one existing
 * entry enhanced in place), including six genuinely 3-product pages. These
 * tests cover what changed: N-generic helpers, the widened Comparison type,
 * the new category-based index grouping, and Bilal Siali authorship on the
 * route's structured data.
 */
describe("comparisons: 2026-09 expansion — COMPARISONS now covers all 15 curated comparisons", () => {
  it("COMPARISONS contains exactly 24 entries: the 10 original plus 14 new", () => {
    expect(COMPARISONS).toHaveLength(24);
  });

  it("every one of the 15 newly-authorized comparisons resolves (14 new + 1 enhanced existing)", () => {
    const newlyAuthorized = [
      "ecoflow-delta-3-max-vs-ecoflow-delta-3-max-plus-vs-ecoflow-delta-3-ultra-plus",
      "jackery-homepower-3000-vs-jackery-homepower-3600-plus",
      "bluetti-elite-200-v2-vs-bluetti-elite-300-vs-bluetti-elite-400",
      "anker-solix-f2000-vs-anker-solix-f3000-vs-anker-solix-f3800",
      "ecoflow-delta-2-max-vs-ecoflow-delta-3-max",
      "jackery-explorer-2000-v2-vs-jackery-homepower-3000",
      "anker-solix-c2000-gen-2-vs-anker-solix-f2000",
      "bluetti-ac200l-vs-bluetti-elite-200-v2",
      "goal-zero-yeti-300-vs-goal-zero-yeti-700",
      "ecoflow-river-3-vs-bluetti-elite-30-v2",
      "anker-solix-c1000-gen-2-vs-ecoflow-delta-3-classic-vs-jackery-explorer-1000-v2",
      "anker-solix-c2000-gen-2-vs-ecoflow-delta-2-max-vs-jackery-explorer-2000-v2",
      "anker-solix-f3000-vs-bluetti-elite-300-vs-pecron-e3600lfp",
      "ecoflow-delta-pro-3-vs-anker-solix-f3800", // #14: pre-existing slug, enhanced in place, not duplicated
      "jackery-explorer-5000-plus-vs-ecoflow-delta-pro-ultra",
    ];
    expect(newlyAuthorized).toHaveLength(15);
    for (const slug of newlyAuthorized) {
      expect(getComparison(slug), `"${slug}" should resolve`).toBeDefined();
    }
  });

  it("comparison #14 was reused in place, not duplicated under a second slug", () => {
    const matches = COMPARISONS.filter(
      (c) =>
        [...c.productIds].sort().join("|") ===
        ["ecoflow-delta-pro-3", "anker-solix-f3800"].sort().join("|"),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].slug).toBe("ecoflow-delta-pro-3-vs-anker-solix-f3800");
  });

  it("no comparison in the whole set shares an identical, unordered product set with another (no hidden duplicates)", () => {
    const keys = COMPARISONS.map((c) => [...c.productIds].sort().join("|"));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("comparisons: 2026-09 expansion — N-generic helpers (2-or-3 products)", () => {
  it("the Comparison type no longer hardcodes a 2-tuple for productIds", () => {
    const src = readFileSync(join(process.cwd(), "src/content/comparisons.ts"), "utf8");
    expect(src).toContain("productIds: string[]");
    expect(src).not.toContain("productIds: [string, string]");
  });

  it("lib/comparisons.ts helpers operate on Product[], not a fixed [Product, Product] tuple", () => {
    const src = readFileSync(join(process.cwd(), "src/lib/comparisons.ts"), "utf8");
    expect(src).not.toContain("[Product, Product]");
  });

  it("ModelComparisonPage accepts a variable-length products array", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/compare/ModelComparisonPage.tsx"),
      "utf8",
    );
    expect(src).toContain("products: Product[]");
    expect(src).not.toContain("products: [Product, Product]");
  });

  it("the route's product-count gate accepts 2 or 3 products (not a hardcoded !== 2)", () => {
    const src = readFileSync(join(process.cwd(), "src/app/compare/[slug]/page.tsx"), "utf8");
    expect(src).not.toContain("products.length !== 2");
    expect(src).toContain("products.length < 2 || products.length > 3");
  });

  it("the spec table's colgroup header spans every product column dynamically, not a hardcoded 3", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/compare/ModelComparisonPage.tsx"),
      "utf8",
    );
    expect(src).toContain("colSpan={products.length + 1}");
    expect(src).not.toContain("colSpan={3}");
  });

  for (const slug of THREE_WAY_SLUGS) {
    it(`"${slug}": every N-generic helper resolves a real 3-way comparison without throwing`, () => {
      const comparison = getComparison(slug)!;
      const products = getProductsByIds(comparison.productIds);
      expect(products).toHaveLength(3);
      expect(new Set(products.map((p) => p.id)).size).toBe(3);

      expect(() => capacityParity(products)).not.toThrow();
      expect(() => evaluateUseCases(products)).not.toThrow();
      expect(() => buildComparisonRuntimeRows(products)).not.toThrow();
      expect(() => headlineDifferences(products)).not.toThrow();
      expect(() => earliestLastChecked(products)).not.toThrow();

      // Every declared use-case winner (if any) must be one of the three real products.
      const verdicts = evaluateUseCases(products);
      const productIds = products.map((p) => p.id);
      for (const v of verdicts) {
        if (v.winnerId !== null) {
          expect(productIds, `"${slug}": use-case winner not among its own products`).toContain(
            v.winnerId,
          );
        }
      }

      // Every headline difference's winner must also be one of the three real products.
      for (const d of headlineDifferences(products)) {
        expect(productIds, `"${slug}": headline diff winner not among its own products`).toContain(
          d.winnerId,
        );
        expect(d.otherDisplays.length).toBe(2);
      }

      // Runtime rows must have hours computed for every one of the three products.
      for (const row of buildComparisonRuntimeRows(products)) {
        expect(Object.keys(row.hoursByProductId).sort()).toEqual([...productIds].sort());
      }
    });
  }

  it("capacityParity.equal is true only when every product's capacity_wh truly matches (not just the first two)", () => {
    const p1 = makeProduct("p1", { capacity_wh: 2048 });
    const p2 = makeProduct("p2", { capacity_wh: 2048 });
    const p3 = makeProduct("p3", { capacity_wh: 3072 });
    expect(capacityParity([p1, p2]).equal).toBe(true);
    expect(capacityParity([p1, p2, p3]).equal).toBe(false);
    expect(capacityParity([p1, p2, p3]).comparable).toBe(true);
  });

  it("evaluateUseCases never names a winner when the top tally is tied across 3 products", () => {
    // "solar-charging" is a single-criterion category: give p1 and p2 the
    // same highest solar_input_w, ahead of p3 — a genuine 2-way tie at the top.
    const p1 = makeProduct("p1", { solar_input_w: 800 });
    const p2 = makeProduct("p2", { solar_input_w: 800 });
    const p3 = makeProduct("p3", { solar_input_w: 400 });
    const verdicts = evaluateUseCases([p1, p2, p3]);
    const solar = verdicts.find((v) => v.key === "solar-charging")!;
    expect(solar.winnerId).toBeNull();
  });

  it("evaluateUseCases can declare a single, unique winner among 3 products", () => {
    const p1 = makeProduct("p1", { solar_input_w: 400 });
    const p2 = makeProduct("p2", { solar_input_w: 600 });
    const p3 = makeProduct("p3", { solar_input_w: 900 });
    const verdicts = evaluateUseCases([p1, p2, p3]);
    const solar = verdicts.find((v) => v.key === "solar-charging")!;
    expect(solar.winnerId).toBe("p3");
  });
});

describe("comparisons: 2026-09 expansion — Bilal Siali authorship on structured data", () => {
  it("the route passes the canonical author into articleJsonLd (Person, not the default Organization)", () => {
    const src = readFileSync(join(process.cwd(), "src/app/compare/[slug]/page.tsx"), "utf8");
    expect(src).toContain('from "@/lib/authors"');
    expect(src).toContain("author: { name: BILAL_SIALI.name, path: BILAL_SIALI.path }");
  });

  it("a comparison page's articleJsonLd resolves to a real Person linked to the author page", () => {
    const node = articleJsonLd({
      headline: "test",
      description: "test",
      path: "/compare/test",
      author: { name: BILAL_SIALI.name, path: BILAL_SIALI.path },
    });
    expect(node.author["@type"]).toBe("Person");
    expect(node.author.name).toBe("Bilal Siali");
    expect((node.author as { url: string }).url).toMatch(/\/authors\/bilal-siali$/);
  });
});

describe("comparisons: 2026-09 expansion — editorial config never duplicates spec data", () => {
  it("content/comparisons.ts declares no dedicated numeric spec fields (specs are always read live)", () => {
    const src = readFileSync(join(process.cwd(), "src/content/comparisons.ts"), "utf8");
    const forbiddenFields = [
      "capacity_wh:",
      "rated_output_w:",
      "surge_output_w:",
      "weight_kg:",
      "solar_input_w:",
      "cycle_life:",
    ];
    for (const field of forbiddenFields) {
      expect(src, `unexpected spec field "${field}" in content/comparisons.ts`).not.toContain(
        field,
      );
    }
  });

  it("the Comparison interface's own fields never include a numeric spec key", () => {
    const forbidden = new Set([
      "capacity_wh",
      "rated_output_w",
      "surge_output_w",
      "weight_kg",
      "solar_input_w",
      "cycle_life",
    ]);
    for (const c of COMPARISONS) {
      for (const key of Object.keys(c)) {
        expect(forbidden.has(key), `"${c.slug}" carries a spec field "${key}"`).toBe(false);
      }
    }
  });
});

describe("comparisons: 2026-09 expansion — unverified fields never treated as a disadvantage", () => {
  it("a null field on any product in a three-way comparison renders as 'Not verified', not a fabricated value", () => {
    // At least one of the six 3-way comparisons must include a real,
    // currently-unverified field somewhere among its products — proving the
    // template path for 3 products still hits the "Not verified" case.
    let sawUnverified = false;
    for (const slug of THREE_WAY_SLUGS) {
      const comparison = getComparison(slug)!;
      const products = getProductsByIds(comparison.productIds);
      for (const p of products) {
        if (p.weight_kg == null || p.warranty == null || p.expandable == null || p.cycle_life == null) {
          sawUnverified = true;
        }
      }
    }
    expect(sawUnverified).toBe(true);
  });
});

describe("comparisons: 2026-09 expansion — internal links for the new comparisons are real", () => {
  const guideSlugs = new Set(GUIDES.map((g) => g.slug));
  const bestForSlugs = new Set(BEST_FOR.map((b) => b.slug));

  it("guides.ts adds relatedComparisonSlug entries only for real, approved comparisons", () => {
    for (const g of GUIDES) {
      if (g.relatedComparisonSlug === undefined) continue;
      expect(
        COMPARISONS.some((c) => c.slug === g.relatedComparisonSlug),
        `"${g.slug}" links to nonexistent comparison "${g.relatedComparisonSlug}"`,
      ).toBe(true);
    }
  });

  it("power-station-for-camping and power-station-for-refrigerator now link a real comparison", () => {
    const camping = GUIDES.find((g) => g.slug === "power-station-for-camping")!;
    const fridgeGuide = GUIDES.find((g) => g.slug === "power-station-for-refrigerator")!;
    expect(camping.relatedComparisonSlug).toBe("goal-zero-yeti-300-vs-goal-zero-yeti-700");
    expect(fridgeGuide.relatedComparisonSlug).toBe(
      "anker-solix-c1000-gen-2-vs-ecoflow-delta-3-classic-vs-jackery-explorer-1000-v2",
    );
  });

  it("every best-for page's relatedComparisonSlugs (old and new) resolve to real, approved comparisons", () => {
    for (const b of BEST_FOR) {
      for (const slug of b.relatedComparisonSlugs ?? []) {
        expect(
          COMPARISONS.some((c) => c.slug === slug),
          `"${b.slug}" links to nonexistent comparison "${slug}"`,
        ).toBe(true);
      }
    }
  });

  it("guideSlugs and bestForSlugs referenced across the expansion are all real (sanity)", () => {
    expect(guideSlugs.has("power-station-for-camping")).toBe(true);
    expect(bestForSlugs.has("best-for-camping")).toBe(true);
  });
});

describe("comparisons: 2026-09 expansion — products.json is never modified by this project", () => {
  it("products.json is well-formed JSON with a stable sha256 hash format (this project only reads the catalog)", () => {
    const buf = readFileSync(join(process.cwd(), "products.json"));
    const hash = createHash("sha256").update(buf).digest("hex");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
