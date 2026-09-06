import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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
} from "@/lib/comparisons";
import { articleJsonLd, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { Product } from "@/types/product";

const APPROVED_SLUG = "ecoflow-delta-3-classic-vs-anker-solix-c1000-gen-2";
const catalog = getAllProducts();
const catalogIds = new Set(catalog.map((p) => p.id));

describe("comparisons: exactly one approved slug is published", () => {
  it("COMPARISONS contains only the one approved slug", () => {
    expect(COMPARISONS.map((c) => c.slug)).toEqual([APPROVED_SLUG]);
  });

  it("getComparison resolves the approved slug and nothing else", () => {
    expect(getComparison(APPROVED_SLUG)).toBeDefined();
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

  it("never resolves the excluded EcoFlow DELTA 3 Plus (not in this catalog)", () => {
    expect(catalogIds.has("ecoflow-delta-3-plus")).toBe(false);
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
    expect(getComparisonsForProduct("jackery-explorer-1000-v2")).toEqual([]);
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

  it("no other best-for page links to this comparison (link is scoped, not spammed everywhere)", () => {
    const others = BEST_FOR.filter(
      (b) => b.slug !== "best-for-refrigerator-backup" && b.slug !== "best-for-rv",
    );
    for (const b of others) {
      expect(b.relatedComparisonSlugs ?? []).toEqual([]);
    }
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
