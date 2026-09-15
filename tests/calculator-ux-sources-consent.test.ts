import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getAllProducts } from "@/data/products";
import { getGuide, GUIDES } from "@/content/guides";
import { getTool } from "@/content/tools";
import { pickRecommendationHighlights, type Recommendation } from "@/lib/recommend";
import type { Product } from "@/types/product";

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
// 1. Calculator starts empty; example is opt-in; advanced settings collapsed
// ---------------------------------------------------------------------------
describe("Power Calculator: starts empty, example is an explicit opt-in, advanced settings collapsible", () => {
  const src = read("src/components/calculator/PowerCalculator.tsx");

  it("the devices state initializes to an empty array, not the seeded example", () => {
    expect(src).toContain("useState<DeviceInput[]>([])");
    expect(src).not.toMatch(/useState<DeviceInput\[\]>\(seededDevices\)/);
  });

  it("a 'Try an example setup' button is the only way to load the fridge/lights/phone example, shown only while devices is empty", () => {
    expect(src).toContain("Try an example setup");
    expect(src).toContain("loadExampleSetup");
    const buttonBlock = src.slice(src.indexOf("Try an example setup") - 300, src.indexOf("Try an example setup") + 50);
    expect(buttonBlock).toMatch(/devices\.length === 0 \? \(/);
  });

  it("resetAll clears back to the true empty default, not back to the example", () => {
    const block = src.slice(src.indexOf("const resetAll = "), src.indexOf("const resetAll = ") + 200);
    expect(block).toContain("setDevices([])");
    expect(block).not.toContain("seededDevices()");
  });

  it("no capacity/energy recommendation number renders before a real device is added — the Quick Summary is gated on `ready`", () => {
    const block = src.slice(src.indexOf("Quick summary"), src.indexOf("Quick summary") + 1600);
    expect(block).toMatch(/!ready \? \(/);
    expect(block).toContain('Add at least one device to see your numbers here.');
    expect(block).toMatch(/ready \? fmtWh\(result\.dailyEnergyWh\) : "—"/);
    expect(block).toMatch(/ready \? fmtWatts\(result\.requiredContinuousOutputW\) : "—"/);
    expect(block).toMatch(/ready \? fmtWh\(result\.recommendedMinimumCapacityWh\) : "—"/);
  });

  it("the 'Next' button to step 2 stays disabled until ready (pre-existing guard, re-confirmed)", () => {
    expect(src).toMatch(/disabled=\{!ready\}/);
  });

  it("usable efficiency, reserve headroom and the surge fallback live inside a collapsible <details> named 'Advanced settings'", () => {
    const detailsOpenIdx = src.indexOf('<details className="glass-panel bg-navy-900/60 p-4" open={advancedSettingsOpen}');
    expect(detailsOpenIdx).toBeGreaterThan(-1);
    const block = src.slice(detailsOpenIdx, src.indexOf("</details>", detailsOpenIdx) + 11);
    expect(block).toContain("Advanced settings");
    expect(block).toContain("Usable efficiency");
    expect(block).toContain("Reserve headroom");
    expect(block).toContain("Surge fallback");
    expect(block).toContain("advancedSettingsOpen");
  });

  it("days of autonomy (a primary Step 2 input, not a technical assumption) stays outside the collapsible", () => {
    const advancedStart = src.indexOf('<details className="glass-panel bg-navy-900/60 p-4" open={advancedSettingsOpen}');
    const beforeAdvanced = src.slice(0, advancedStart);
    expect(beforeAdvanced).toContain("Days of autonomy");
  });
});

// ---------------------------------------------------------------------------
// 2. Recommendations: top-3 default, highlight labels, "view all" expander
// ---------------------------------------------------------------------------
describe("pickRecommendationHighlights: verifiable, never-invented highlight labels", () => {
  function rec(id: string, overrides: Partial<Product>, fitScore = 50): Recommendation {
    const product = catalog[0]; // shape doesn't matter, only overridden fields below are read
    return {
      product: { ...product, id, ...overrides } as Product,
      status: "Best Fit",
      fitScore,
      reasons: [],
      limitations: [],
      powerMatchScore: { productId: id, dimensions: [], overall: 80, scoredCount: 5, totalDimensions: 5, band: "Great" },
      consideredCapacityWh: overrides.capacity_wh ?? null,
      meetsContinuous: true,
      meetsCapacity: true,
      meetsSurge: true,
      capacityRatio: 1.2,
      outputRatio: 1.2,
    };
  }

  it("empty input yields no highlights", () => {
    expect(pickRecommendationHighlights([])).toEqual({});
  });

  it("a single-item primary group only gets 'Best overall match' — no fabricated portable/capacity distinction with nothing to compare against", () => {
    const only = rec("a", { weight_kg: 10, capacity_wh: 1000 });
    const h = pickRecommendationHighlights([only]);
    expect(h).toEqual({ a: "Best overall match" });
  });

  it("a genuinely lighter, non-#1 product earns 'Best portable option'; a genuinely bigger one earns 'Best higher-capacity option'", () => {
    const overall = rec("a", { weight_kg: 15, capacity_wh: 2000 });
    const lighter = rec("b", { weight_kg: 8, capacity_wh: 1800 });
    const bigger = rec("c", { weight_kg: 20, capacity_wh: 5000 });
    const h = pickRecommendationHighlights([overall, lighter, bigger]);
    expect(h.a).toBe("Best overall match");
    expect(h.b).toBe("Best portable option");
    expect(h.c).toBe("Best higher-capacity option");
  });

  it("never assigns 'Best portable' to a product that is not lighter than the overall pick (no data, no invented distinction)", () => {
    const overall = rec("a", { weight_kg: 5, capacity_wh: 2000 }); // already lightest
    const heavier = rec("b", { weight_kg: 12, capacity_wh: 1000 });
    const h = pickRecommendationHighlights([overall, heavier]);
    expect(h.a).toBe("Best overall match");
    expect(h.b).toBeUndefined();
  });

  it("skips the portability/capacity highlight entirely when weight/capacity data is unverified (null) rather than guessing", () => {
    const overall = rec("a", { weight_kg: null, capacity_wh: null });
    const other = rec("b", { weight_kg: null, capacity_wh: null });
    const h = pickRecommendationHighlights([overall, other]);
    expect(h).toEqual({ a: "Best overall match" });
  });
});

describe("PowerCalculator: top-3 primary display with 'View all compatible models' expansion", () => {
  const src = read("src/components/calculator/PowerCalculator.tsx");

  it("computes visiblePrimary as a slice of at most 3 unless showAllPrimary is set", () => {
    expect(src).toContain("const visiblePrimary = showAllPrimary ? primary : primary.slice(0, 3)");
  });

  it("renders a 'View all compatible models' button only when more than 3 primary matches exist, showing the total count", () => {
    expect(src).toContain("View all compatible models ({primary.length})");
    expect(src).toContain("hiddenPrimaryCount > 0");
  });

  it("resets showAllPrimary to false whenever the recommendation set itself changes (a fresh calculation never stays stuck expanded)", () => {
    const effectBlock = src.slice(src.indexOf("setShowAllPrimary(false)") - 200, src.indexOf("setShowAllPrimary(false)") + 60);
    expect(effectBlock).toContain("useEffect");
    expect(effectBlock).toContain("[recommendations]");
  });

  it("passes each visible card a highlight badge computed from pickRecommendationHighlights, keyed by product id", () => {
    expect(src).toContain("const highlights = useMemo(() => pickRecommendationHighlights(primary), [primary])");
    expect(src).toContain("badge={highlights[rec.product.id]}");
  });

  it("every RecommendationCard usage declares a location, and oversized/possible/not-suitable sections remain fully listed (never limited to 3)", () => {
    const cardCalls = [...src.matchAll(/<RecommendationCard[\s\S]{0,300}?\/>/g)];
    expect(cardCalls.length).toBeGreaterThanOrEqual(4);
    for (const call of cardCalls) {
      expect(call[0]).toMatch(/location="power_calculator"/);
    }
    // oversized/possible/notSuitable still map the FULL array, not a sliced one.
    expect(src).toMatch(/\{oversized\.map\(\(rec\) => \(/);
    expect(src).toMatch(/\{possible\.map\(\(rec\) => \(/);
    expect(src).toMatch(/\{notSuitable\.map\(\(rec\) => \(/);
  });
});

describe("RecommendationCard: every current caller declares a real, closed-enum location", () => {
  it("ToolResultsBlock and Power Setup Studio both pass a location, and recommendation_click fires with product_id/location/status only", () => {
    const cardSrc = read("src/components/calculator/RecommendationCard.tsx");
    expect(cardSrc).toContain('"use client"');
    expect(cardSrc).toContain('trackEvent("recommendation_click"');
    expect(cardSrc).toContain("product_id: product.id");
    expect(cardSrc).toContain("location,");
    expect(cardSrc).toContain("status: normalizedStatus(status)");

    const toolsSrc = read("src/components/tools/ToolResultsBlock.tsx");
    const toolsCalls = [...toolsSrc.matchAll(/<RecommendationCard[\s\S]{0,300}?\/>/g)];
    expect(toolsCalls.length).toBeGreaterThanOrEqual(4);
    for (const call of toolsCalls) expect(call[0]).toMatch(/location="tool_results"/);

    const studioSrc = read("src/components/power-setup-studio/MatchingStations.tsx");
    expect(studioSrc).toMatch(/location="power_setup_studio"/);
  });

  it("normalizedStatus never leaks the raw spaced MatchStatus label (e.g. 'Best Fit') into an analytics param", () => {
    const cardSrc = read("src/components/calculator/RecommendationCard.tsx");
    expect(cardSrc).toContain('status.toLowerCase().replace(/ /g, "_")');
  });
});

describe("Ranking never lets PowerMatch Score override proportionality (audit, no formula change)", () => {
  it("Oversized is a fully separate status group — never mixed into `primary` regardless of score", () => {
    const src = read("src/lib/recommend.ts");
    expect(src).toContain('primary: recs.filter((r) => r.status === "Best Fit" || r.status === "Good Fit")');
    expect(src).toContain('oversized: recs.filter((r) => r.status === "Oversized")');
  });

  it("computeFitScore weights capacity/output proportionality (0-65 combined) far more than the PowerMatch Score tie-break (capped at 15)", () => {
    const src = read("src/lib/recommend.ts");
    const fnStart = src.indexOf("function computeFitScore");
    const bodyStart = src.indexOf("): number {", fnStart);
    const fn = src.slice(fnStart, src.indexOf("\n}", bodyStart));
    expect(fn).toContain("powerMatchOverall * 0.15");
    expect(fn).toMatch(/capacityFitScore\(capacityRatio\)/);
    expect(fn).toMatch(/outputFitScore\(outputRatio\)/);
  });
});

// ---------------------------------------------------------------------------
// 3. Official manufacturer source: visible, accessible link when verified
// ---------------------------------------------------------------------------
describe("Official manufacturer source link: visible when verified, never fabricated", () => {
  it("official_source_url is a nullable schema field, never required, and passes zod URL validation when present", () => {
    const schemaSrc = read("src/data/product-schema.ts");
    expect(schemaSrc).toContain("official_source_url: z.string().url().nullable()");
  });

  it("SpecTable renders a real <a> with target=_blank and rel=noopener noreferrer only when a URL is verified; otherwise plain text, never a fabricated href", () => {
    const src = read("src/components/product/SpecTable.tsx");
    expect(src).toContain("function officialSourceValue(label: string | null, url: string | null)");
    expect(src).toContain('target="_blank"');
    expect(src).toContain('rel="noopener noreferrer"');
    expect(src).toContain("officialSourceValue(product.official_source, product.official_source_url)");
  });

  it("every product with a non-null official_source_url uses an https:// URL on the manufacturer's own domain, never an Amazon domain", () => {
    for (const p of catalog) {
      if (!p.official_source_url) continue;
      expect(p.official_source_url, p.id).toMatch(/^https:\/\//);
      expect(p.official_source_url, p.id).not.toMatch(/amazon\.|amzn\./i);
    }
  });

  it("the 49-product catalog is unchanged in count; official_source_url is additive only", () => {
    expect(catalog.length).toBe(49);
  });

  it("a meaningful share of the catalog now has a verified official source link, and the rest correctly remain null rather than guessed", () => {
    const withUrl = catalog.filter((p) => p.official_source_url);
    const withoutUrl = catalog.filter((p) => !p.official_source_url);
    expect(withUrl.length).toBeGreaterThanOrEqual(20);
    expect(withoutUrl.length).toBeGreaterThan(0); // honestly incomplete, not padded
    for (const p of withoutUrl) {
      expect(p.official_source_url, p.id).toBeNull();
    }
  });

  it("the research report's CSV export includes official_source_url as a manufacturer-attribution column (still excludes every amazon_* field)", () => {
    const src = read("src/lib/catalog-stats.ts");
    expect(src).toMatch(/\{\s*key:\s*"official_source_url"/);
    expect(src).not.toMatch(/key:\s*"amazon_/);
  });
});

// ---------------------------------------------------------------------------
// 4. Guides: early, contextual calculator CTA (existing bottom CTA preserved)
// ---------------------------------------------------------------------------
describe("Guides: an early, contextual calculator CTA on sizing/runtime guides", () => {
  const src = read("src/app/guides/[slug]/page.tsx");

  it("shows an early CTA box only for 'runtime' and 'use-cases' guides, before the 'On this page' nav", () => {
    const earlyIdx = src.indexOf('guide.group === "runtime" || guide.group === "use-cases"');
    const navIdx = src.indexOf("On this page");
    expect(earlyIdx).toBeGreaterThan(-1);
    expect(navIdx).toBeGreaterThan(earlyIdx);
  });

  it("links to the guide's own related tool when one exists, else the general Power Calculator — never a broken/empty href", () => {
    const start = src.indexOf('guide.group === "runtime"');
    const block = src.slice(start, src.indexOf("</div>", start) + 6);
    expect(block).toContain("relatedTool ? `/tools/${relatedTool.slug}` : \"/power-calculator\"");
    expect(block).toContain("relatedTool ? `Calculate your ${relatedTool.shortTitle} power needs` : \"Calculate your power needs\"");
  });

  it("the early CTA fires guide_cta_click with the guide slug and a distinct cta value from the existing bottom CTA", () => {
    const start = src.indexOf('guide.group === "runtime"');
    const block = src.slice(start, src.indexOf("</div>", start) + 6);
    expect(block).toMatch(/event="guide_cta_click"/);
    expect(block).toMatch(/cta:\s*relatedTool \? "related_tool_top" : "power_calculator_top"/);
  });

  it("the pre-existing 'Put a number on it' bottom CTA is preserved, unchanged in position relative to the sections", () => {
    expect(src).toContain('title="Put a number on it"');
    const bottomIdx = src.indexOf('title="Put a number on it"');
    const sectionsIdx = src.indexOf("{guide.sections.map((s) =>");
    expect(bottomIdx).toBeGreaterThan(sectionsIdx);
  });

  it("no guide's early CTA can 404: every runtime/use-cases guide's relatedToolSlug (when set) resolves to a real tool", () => {
    for (const g of GUIDES) {
      if ((g.group === "runtime" || g.group === "use-cases") && g.relatedToolSlug) {
        expect(getTool(g.relatedToolSlug), g.slug).toBeDefined();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Content-cannibalization audit: the 4 named pairs are genuinely distinct
// ---------------------------------------------------------------------------
describe("Content cannibalization audit: the 4 named guide pairs have distinct intent and no duplicated prose", () => {
  function noSharedSentences(slugA: string, slugB: string) {
    const a = getGuide(slugA)!;
    const b = getGuide(slugB)!;
    const sentencesOf = (g: typeof a) =>
      g.sections
        .flatMap((s) => s.body)
        .join(" ")
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 30);
    const setA = new Set(sentencesOf(a));
    const dupes = sentencesOf(b).filter((s) => setA.has(s));
    return dupes;
  }

  it("'Can a Power Station Run a Refrigerator, and For How Long?' vs 'What Size Power Station Do I Need for a Refrigerator?': different titles, different primary intent (runtime-check vs. sizing-guide), reciprocal cross-links, zero shared sentences", () => {
    const canRun = getGuide("can-a-power-station-run-a-refrigerator")!;
    const sizing = getGuide("power-station-for-refrigerator")!;
    expect(canRun.title).not.toBe(sizing.title);
    expect(canRun.metaDescription).not.toBe(sizing.metaDescription);
    expect(canRun.relatedGuideSlugs).toContain(sizing.slug);
    expect(sizing.relatedGuideSlugs).toContain(canRun.slug);
    expect(noSharedSentences("can-a-power-station-run-a-refrigerator", "power-station-for-refrigerator")).toEqual([]);
  });

  it("'LiFePO4 vs. NMC' vs 'LiFePO4 vs Lithium-Ion': the second guide explicitly self-identifies as the terminology-clarification entry point and hands off to the first for the deeper comparison — not a duplicate", () => {
    const nmc = getGuide("lifepo4-vs-nmc-battery-chemistry")!;
    const lithiumIon = getGuide("lifepo4-vs-lithium-ion")!;
    expect(nmc.title).not.toBe(lithiumIon.title);
    const lithiumIonIntro = lithiumIon.intro.join(" ");
    expect(lithiumIonIntro).toMatch(/lithium-ion/i);
    expect(lithiumIonIntro).toMatch(/terminology|untangl/i);
    expect(lithiumIon.relatedGuideSlugs).toContain(nmc.slug);
    expect(nmc.relatedGuideSlugs).toContain(lithiumIon.slug);
    expect(noSharedSentences("lifepo4-vs-nmc-battery-chemistry", "lifepo4-vs-lithium-ion")).toEqual([]);
  });

  it("neither pair was merged/redirected — the task's own rule against removing pages that can be differentiated correctly applies to all four", () => {
    for (const slug of [
      "can-a-power-station-run-a-refrigerator",
      "power-station-for-refrigerator",
      "lifepo4-vs-nmc-battery-chemistry",
      "lifepo4-vs-lithium-ion",
    ]) {
      expect(getGuide(slug), slug).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Cookie consent banner: simplified, still symmetric, still consent-gated
// ---------------------------------------------------------------------------
describe("Cookie consent banner: shorter, plainer, still functionally correct", () => {
  const src = read("src/components/analytics/AnalyticsConsent.tsx");

  it("Accept and Reject are both single, always-visible <button>s of the same interaction cost — no dark pattern hiding Reject behind extra steps", () => {
    expect(src).toMatch(/<button[\s\S]{0,80}onClick=\{\(\) => choose\("rejected"\)\}/);
    expect(src).toMatch(/<button[\s\S]{0,80}onClick=\{\(\) => choose\("accepted"\)\}/);
  });

  it("still links to the Privacy Policy for the full detail", () => {
    expect(src).toContain('href="/privacy-policy"');
  });

  it("a 'Cookie preferences' link exists sitewide (in the footer) to reopen the banner and change the choice later", () => {
    const footerSrc = read("src/components/layout/Footer.tsx");
    expect(footerSrc).toContain("CookiePreferencesLink");
  });

  it("GA4's own script is still never mounted before the visitor accepts — GoogleAnalytics only renders on choice === 'accepted'", () => {
    expect(src).toMatch(/\{choice === "accepted" \? <GoogleAnalytics \/> : null\}/);
  });

  it("the copy is meaningfully shorter than before (a 'small and easy to understand' notice, not a technical essay)", () => {
    const pStart = src.indexOf('<p className="max-w-xl');
    const pEnd = src.indexOf("</p>", pStart);
    const bannerText = src.slice(pStart, pEnd).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(bannerText.length).toBeLessThan(220);
  });
});

// ---------------------------------------------------------------------------
// 7. Analytics: recommendation_click completes the required event list;
//    consent-gating and no-invented-GA-ID are re-confirmed
// ---------------------------------------------------------------------------
describe("Analytics: the full required event vocabulary is present and consent-respecting", () => {
  it("AnalyticsEvent declares recommendation_click alongside the six pre-existing required events", () => {
    const src = read("src/lib/analytics.ts");
    const match = src.match(/export type AnalyticsEvent =([\s\S]*?);/);
    expect(match).not.toBeNull();
    for (const evt of [
      "calculator_start",
      "calculator_completed",
      "recommendation_click",
      "affiliate_click",
      "compare_add_product",
      "comparison_completed",
      "guide_cta_click",
    ]) {
      expect(match![1], evt).toContain(`"${evt}"`);
    }
  });

  it("RecommendationClickLocation is a closed enum covering exactly the three current recommendation surfaces", () => {
    const src = read("src/lib/analytics.ts");
    const match = src.match(/export type RecommendationClickLocation =([\s\S]*?);/);
    expect(match).not.toBeNull();
    for (const loc of ["power_calculator", "tool_results", "power_setup_studio"]) {
      expect(match![1]).toContain(`"${loc}"`);
    }
  });

  it("no NEXT_PUBLIC_GA_MEASUREMENT_ID is hardcoded anywhere — it is only ever read from process.env", () => {
    const src = read("src/lib/analytics.ts");
    expect(src).toContain("process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID");
    // No literal Google Analytics Measurement ID pattern (G-XXXXXXXXXX) anywhere in src/.
    for (const [file, content] of srcContents) {
      expect(content, file).not.toMatch(/["']G-[A-Z0-9]{6,}["']/);
    }
  });

  it("trackEvent is a safe no-op with no gtag mounted (GA not configured in this environment) — confirms the deploy is never blocked by a missing credential", () => {
    const src = read("src/lib/analytics.ts");
    expect(src).toContain('if (typeof window === "undefined" || typeof window.gtag !== "function") return;');
  });
});
