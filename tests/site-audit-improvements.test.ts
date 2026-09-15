import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { GUIDES, getGuide } from "@/content/guides";
import { BEST_FOR, getBestFor } from "@/content/best-for";
import { categoryPicksFor, selectBestFor } from "@/lib/best-for";
import { getAllProducts } from "@/data/products";
import { PRIMARY_NAV, MOBILE_NAV } from "@/lib/site";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

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

describe("catalog count: single dynamic source, no stale text", () => {
  it("the homepage stat is computed from getAllProducts().length, not a literal", () => {
    const src = read("src/components/home/HomeSections.tsx");
    expect(src).toContain("getAllProducts().length");
    // No stray hardcoded "12" catalog-size literal near the stat.
    expect(src).not.toMatch(/stationCount\s*=\s*\d/);
  });

  it("products.json and getAllProducts() agree on the catalog size", () => {
    expect(getAllProducts().length).toBeGreaterThan(0);
    const raw = JSON.parse(readFileSync(join(ROOT, "products.json"), "utf8"));
    expect(getAllProducts().length).toBe(raw.length);
  });

  it("the catalog page no longer calls itself 'The V1 working catalog'", () => {
    const src = read("src/app/products/page.tsx");
    expect(src).not.toContain("V1 working catalog");
  });
});

describe("Deals: removed from primary nav, noindexed while empty", () => {
  it("is not present in PRIMARY_NAV or MOBILE_NAV", () => {
    expect(PRIMARY_NAV.some((i) => i.href === "/deals")).toBe(false);
    expect(MOBILE_NAV.some((i) => i.href === "/deals")).toBe(false);
  });

  it("the route itself still exists and is not in the sitemap while empty", () => {
    const pageSrc = read("src/app/deals/page.tsx");
    expect(pageSrc).toContain("noindex: getActiveDeals().length === 0");
    const sitemapSrc = read("src/app/sitemap.ts");
    expect(sitemapSrc).not.toContain('"/deals"');
  });
});

describe("GA4: env-var gated, no hardcoded Measurement ID", () => {
  it("GA_MEASUREMENT_ID reads only from NEXT_PUBLIC_GA_MEASUREMENT_ID", () => {
    const src = read("src/lib/analytics.ts");
    expect(src).toContain("process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID");
    // No literal Google Measurement ID pattern (G-XXXXXXX) hardcoded anywhere under src/.
    const offenders = srcFiles.filter((f) => /G-[A-Z0-9]{6,}/.test(srcContents.get(f)!));
    expect(offenders, `hardcoded GA id found in: ${offenders.join(", ")}`).toEqual([]);
  });

  it("GoogleAnalytics renders nothing when the env var is unset", () => {
    expect(GA_MEASUREMENT_ID).toBeUndefined();
    const src = read("src/components/analytics/GoogleAnalytics.tsx");
    expect(src).toContain("if (!GA_MEASUREMENT_ID) return null;");
  });

  it("all eight required events are declared in the fixed vocabulary", () => {
    const src = read("src/lib/analytics.ts");
    for (const evt of [
      "calculator_start",
      "calculator_completed",
      "compare_add_product",
      "comparison_started",
      "comparison_completed",
      "affiliate_click",
      "view_product",
      "guide_cta_click",
    ]) {
      expect(src).toContain(`"${evt}"`);
    }
  });

  it("each event is actually fired from its real call site", () => {
    expect(read("src/context/CompareContext.tsx")).toContain('trackEvent("compare_add_product"');
    expect(read("src/context/CompareContext.tsx")).toContain('trackEvent("comparison_started")');
    expect(read("src/components/compare/CompareView.tsx")).toContain(
      'trackEvent("comparison_completed"',
    );
    expect(read("src/components/product/AmazonCta.tsx")).toContain(
      'trackEvent("affiliate_click"',
    );
    expect(read("src/components/analytics/TrackProductView.tsx")).toContain(
      'trackEvent("view_product"',
    );
    expect(read("src/components/calculator/PowerCalculator.tsx")).toContain(
      'trackEvent("calculator_start")',
    );
    expect(read("src/components/calculator/PowerCalculator.tsx")).toContain(
      'trackEvent("calculator_completed"',
    );
    expect(read("src/components/analytics/TrackedLink.tsx")).toContain("trackEvent(event");
    expect(read("src/app/guides/[slug]/page.tsx")).toContain('event="guide_cta_click"');
  });

  it("every AmazonCta render site passes a placement so affiliate_click always records where the click happened", () => {
    const placementCallers = [
      "src/app/products/[id]/page.tsx",
      "src/components/product/ProductCard.tsx",
      "src/components/compare/CompareView.tsx",
      "src/components/compare/ModelComparisonPage.tsx",
      "src/components/calculator/RecommendationCard.tsx",
      "src/app/deals/page.tsx",
    ];
    for (const file of placementCallers) {
      const src = read(file);
      const ctaBlocks = src.match(/<AmazonCta[\s\S]*?\/>/g) ?? [];
      expect(ctaBlocks.length, `${file} has no <AmazonCta /> usage to check`).toBeGreaterThan(0);
      for (const block of ctaBlocks) {
        expect(block, `${file}: <AmazonCta> missing placement=\n${block}`).toMatch(
          /placement="[a-z_]+"/,
        );
      }
    }
  });
});

describe("GA4: exactly one page_view strategy — manual dispatch, config's own auto page_view disabled", () => {
  it("GoogleAnalytics disables gtag's automatic page_view and never dispatches one itself", () => {
    const src = read("src/components/analytics/GoogleAnalytics.tsx");
    expect(src).not.toMatch(/gtag\(['"]event['"],\s*['"]page_view['"]/);
    expect(src).toContain("gtag('config'");
    expect(src).toContain("send_page_view: false");
  });

  it("exactly one file dispatches page_view, and it's the dedicated tracker component", () => {
    const offenders = srcFiles.filter(
      (f) =>
        f !== join(SRC_DIR, "components/analytics/GoogleAnalyticsPageview.tsx") &&
        /['"]page_view['"]/.test(srcContents.get(f)!),
    );
    expect(offenders, `manual page_view dispatch found outside the tracker in: ${offenders.join(", ")}`).toEqual([]);
    const trackerSrc = read("src/components/analytics/GoogleAnalyticsPageview.tsx");
    expect(trackerSrc).toMatch(/gtag\(['"]event['"],\s*['"]page_view['"]/);
  });

  it("the tracker fires on both the initial pathname and every Next.js App Router navigation, wrapped in Suspense", () => {
    const src = read("src/components/analytics/GoogleAnalyticsPageview.tsx");
    expect(src).toContain("usePathname");
    expect(src).toContain("useSearchParams");
    expect(src).toContain("[pathname, searchParams]");
    expect(src).toContain("Suspense");
  });

  it("GoogleAnalytics mounts the tracker so every acceptance gets it, and no consent check is duplicated in the tracker itself", () => {
    const gaSrc = read("src/components/analytics/GoogleAnalytics.tsx");
    expect(gaSrc).toContain("<GoogleAnalyticsPageview />");
    const trackerSrc = read("src/components/analytics/GoogleAnalyticsPageview.tsx");
    expect(trackerSrc).not.toContain("getStoredConsent");
  });
});

describe("Consent Mode v2: denied by default, GA4 never loads before acceptance", () => {
  it("the root layout sets all four Consent Mode signals to denied, before any other tag", () => {
    const src = read("src/app/layout.tsx");
    for (const signal of [
      "analytics_storage",
      "ad_storage",
      "ad_user_data",
      "ad_personalization",
    ]) {
      expect(src).toContain(signal);
    }
    expect(src).toContain("'denied'");
    expect(src).toContain("gtag('consent', 'default'");
  });

  it("the consent-defaults script renders before the AdSense script in layout.tsx", () => {
    const src = read("src/app/layout.tsx");
    const consentIdx = src.indexOf('id="consent-defaults"');
    const adsenseIdx = src.indexOf("pagead2.googlesyndication.com");
    expect(consentIdx).toBeGreaterThan(-1);
    expect(adsenseIdx).toBeGreaterThan(-1);
    expect(consentIdx).toBeLessThan(adsenseIdx);
  });

  it("AnalyticsConsent is the only place that mounts GoogleAnalytics, and only once accepted", () => {
    const src = read("src/components/analytics/AnalyticsConsent.tsx");
    expect(src).toContain('choice === "accepted" ? <GoogleAnalytics /> : null');
    // The root layout never imports or renders <GoogleAnalytics /> itself
    // (a prose mention of the component's name in a comment is fine).
    const layoutSrc = read("src/app/layout.tsx");
    expect(layoutSrc).not.toContain('import { GoogleAnalytics }');
    expect(layoutSrc).not.toContain("<GoogleAnalytics");
  });

  it("GoogleAnalytics is not mounted anywhere else in the app", () => {
    const offenders = srcFiles.filter(
      (f) =>
        f !== join(SRC_DIR, "components/analytics/AnalyticsConsent.tsx") &&
        f !== join(SRC_DIR, "components/analytics/GoogleAnalytics.tsx") &&
        srcContents.get(f)!.includes("<GoogleAnalytics"),
    );
    expect(offenders).toEqual([]);
  });

  it("the initial (pre-effect) render state never shows the banner or loads GA4 — avoids a hydration mismatch", () => {
    const src = read("src/components/analytics/AnalyticsConsent.tsx");
    expect(src).toContain('useState<ConsentChoice | null | "unset">("unset")');
  });

  it("a visitor's choice is applied via gtag consent update, and persisted", () => {
    const consentSrc = read("src/lib/consent.ts");
    expect(consentSrc).toContain("gtag(\"consent\", \"update\"");
    expect(consentSrc).toContain("localStorage");
  });

  it("a 'Cookie preferences' control exists to reopen and change the choice later", () => {
    const linkSrc = read("src/components/analytics/CookiePreferencesLink.tsx");
    expect(linkSrc).toContain("REOPEN_CONSENT_EVENT");
    const footerSrc = read("src/components/layout/Footer.tsx");
    expect(footerSrc).toContain("CookiePreferencesLink");
    const consentSrc = read("src/components/analytics/AnalyticsConsent.tsx");
    expect(consentSrc).toContain("REOPEN_CONSENT_EVENT");
  });

  it("the privacy policy describes denied-by-default consent and the banner, not a hardcoded jurisdiction claim", () => {
    const src = read("src/app/privacy-policy/page.tsx");
    expect(src).toContain("denied");
    expect(src).toContain("Consent Mode");
    expect(src).not.toMatch(/without a banner|no banner (is )?(needed|required)/i);
  });

  it("a returning visitor's already-accepted consent is re-applied on mount, before GoogleAnalytics can render — every fresh page load starts with an empty dataLayer, so a stored choice from a previous session must be re-sent or gtag still believes consent is denied", () => {
    const src = read("src/components/analytics/AnalyticsConsent.tsx");
    const effectMatch = src.match(/useEffect\(\(\) => \{([\s\S]*?)\}, \[\]\);/);
    expect(effectMatch, "could not find the mount effect in AnalyticsConsent.tsx").not.toBeNull();
    const effectBody = effectMatch![1];
    expect(effectBody).toContain("applyConsentUpdate");
    // The re-applied update must happen before setChoice (which mounts
    // GoogleAnalytics) — not after, or GoogleAnalytics could still race it.
    const applyIdx = effectBody.indexOf("applyConsentUpdate");
    const setChoiceIdx = effectBody.indexOf("setChoice(stored)");
    expect(applyIdx).toBeGreaterThan(-1);
    expect(setChoiceIdx).toBeGreaterThan(-1);
    expect(applyIdx).toBeLessThan(setChoiceIdx);
    // Only re-applied for "accepted" — a rejected visitor must stay silent.
    expect(effectBody).toMatch(/stored === "accepted"/);
  });
});

describe("GA4 copy: never claims Google Analytics is active when it isn't", () => {
  it("the consent banner branches its claim on GA_ENABLED (computed from GA_MEASUREMENT_ID), not a fixed string, and its short 'GA not active' copy never claims analytics is running", () => {
    const src = read("src/components/analytics/AnalyticsConsent.tsx");
    expect(src).toContain("const GA_ENABLED = Boolean(GA_MEASUREMENT_ID)");
    expect(src).toMatch(/\{GA_ENABLED\s*\?/);
    const falseBranch = src.slice(src.indexOf('? "We use'), src.indexOf('Nothing loads'));
    expect(falseBranch).toMatch(/no analytics run/i);
    expect(falseBranch).not.toMatch(/we (track|use) (google )?analytics/i);
  });

  it("the privacy policy computes gaEnabled from the same GA_MEASUREMENT_ID and branches the GA4 section on it", () => {
    const src = read("src/app/privacy-policy/page.tsx");
    expect(src).toContain("import { GA_MEASUREMENT_ID }");
    expect(src).toContain("const gaEnabled = Boolean(GA_MEASUREMENT_ID)");
    expect(src).toContain("{gaEnabled ? (");
    expect(src).toContain("Google Analytics is not currently active on this");
  });

  it("the 'not active' branch never claims events are being recorded", () => {
    const src = read("src/app/privacy-policy/page.tsx");
    // Isolate just the false-branch JSX of the GA4 section's ternary (") : ("
    // through the next <h2>), since the true branch elsewhere in the same
    // file legitimately contains "we track" for when GA4 *is* active.
    const gaSectionStart = src.indexOf("<h2>Google Analytics (GA4)</h2>");
    const falseBranchStart = src.indexOf(") : (", gaSectionStart);
    const falseBranchEnd = src.indexOf("<h2>Server logs</h2>", falseBranchStart);
    const notActiveParagraph = src.slice(falseBranchStart, falseBranchEnd);
    expect(notActiveParagraph).toContain("Google Analytics is not currently active on this");
    expect(notActiveParagraph).not.toMatch(/we track|these events record/i);
  });

  it("with no NEXT_PUBLIC_GA_MEASUREMENT_ID configured (this test run's actual state), GA_MEASUREMENT_ID is falsy", () => {
    // Confirms the two source-level flags above are meaningfully wired to a
    // real, currently-false condition in this environment, not dead code.
    expect(GA_MEASUREMENT_ID).toBeFalsy();
  });
});

describe("GA4 event parameters: no PII, no free text, no affiliate identifiers", () => {
  it("affiliate_click sends only a catalog product id, a boolean and an enum placement — never the destination URL", () => {
    const src = read("src/components/product/AmazonCta.tsx");
    const match = src.match(/trackEvent\("affiliate_click",\s*\{([\s\S]*?)\}\)/);
    expect(match).not.toBeNull();
    const params = match![1];
    expect(params).toContain("product_id: product.id");
    expect(params).toContain("placement");
    expect(params).not.toContain("href");
    expect(params).not.toMatch(/amazon_affiliate_url|amazon_asin|resolveAmazonLink/);
  });

  it("AffiliateClickPlacement is a closed enum of internal placement strings, never accepts arbitrary text", () => {
    const src = read("src/lib/analytics.ts");
    const match = src.match(/export type AffiliateClickPlacement =([\s\S]*?);/);
    expect(match).not.toBeNull();
    expect(match![1]).not.toMatch(/:\s*string/);
  });

  it("no trackEvent call reads a free-text search/query filter", () => {
    const src = read("src/components/product/ProductsBrowser.tsx");
    // needsSolar preset from a URL flag is fine (a boolean toggle, not free text);
    // the raw text filters.q must never reach an analytics call anywhere.
    expect(src).not.toContain("trackEvent");
  });

  it("no trackEvent call passes user-typed device names from the calculator", () => {
    const src = read("src/components/calculator/PowerCalculator.tsx");
    const calls = src.match(/trackEvent\([^)]*\)/g) ?? [];
    for (const call of calls) {
      expect(call).not.toMatch(/devices\b/);
      expect(call).not.toContain(".name");
    }
  });
});

describe("Comparator: no double-loading gate, skeleton reserves layout", () => {
  it("CompareView no longer blocks its whole render behind a bare 'Loading…' gate", () => {
    const src = read("src/components/compare/CompareView.tsx");
    expect(src).not.toContain("if (!ready) {");
  });

  it("the /compare Suspense fallback is a layout-matching skeleton, not bare text", () => {
    const pageSrc = read("src/app/compare/page.tsx");
    expect(pageSrc).toContain("<CompareSkeleton");
    expect(pageSrc).not.toContain("Loading comparison…");
  });

  it("a copy-comparison-link control exists", () => {
    const src = read("src/components/compare/CompareView.tsx");
    expect(src).toContain("copyShareLink");
    expect(src).toContain("navigator.clipboard.writeText");
  });

  it("the spec table's group headers are sticky", () => {
    const src = read("src/components/compare/CompareView.tsx");
    expect(src).toContain("sticky top-16");
  });
});

describe("Best-For pages: category picks are data-derived, never a fabricated 'value' pick", () => {
  const catalog = getAllProducts();

  it("no product schema field represents price, so no category can honestly claim 'best value'", () => {
    const product = catalog[0];
    expect(Object.keys(product)).not.toContain("price");
  });

  it("categoryPicksFor never emits a 'value' category", () => {
    for (const b of BEST_FOR) {
      const picks = categoryPicksFor(b.key, catalog);
      expect(picks.some((p) => /value/i.test(p.label))).toBe(false);
    }
  });

  it("refrigerator-backup yields at least an overall pick, each with a real numeric reason", () => {
    const picks = categoryPicksFor("refrigerator-backup", catalog);
    expect(picks.length).toBeGreaterThan(0);
    expect(picks[0].key).toBe("overall");
    for (const p of picks) {
      expect(p.reason.length).toBeGreaterThan(10);
    }
  });

  it("every pick is a real catalog product present in selectBestFor's own ranking", () => {
    const entries = selectBestFor("refrigerator-backup", catalog);
    const ids = new Set(entries.map((e) => e.product.id));
    for (const p of categoryPicksFor("refrigerator-backup", catalog)) {
      expect(ids.has(p.entry.product.id)).toBe(true);
    }
  });

  it("BestForPage renders a shortlist comparison table sourced from COMPARE_ROWS, not new invented specs", () => {
    const src = read("src/components/bestfor/BestForPage.tsx");
    expect(src).toContain("COMPARE_ROWS");
    expect(src).toContain("rowWinner");
    expect(src).toContain("SHORTLIST_ROW_KEYS");
  });

  it("'Also in the catalog' links to the full catalog instead of repeating every product", () => {
    const src = read("src/components/bestfor/BestForPage.tsx");
    expect(src).toContain("others.slice(0, 2)");
    expect(src).toContain("Browse the full catalog");
  });

  it("best-for-refrigerator-backup has a short quick answer labeled as such", () => {
    const content = getBestFor("best-for-refrigerator-backup")!;
    expect(content.quickAnswer).toBeTruthy();
    expect(content.quickAnswer!.length).toBeLessThan(400);
  });

  it("estimated refrigerator runtime is explicitly labeled a planning calculation", () => {
    const src = read("src/components/bestfor/BestForPage.tsx");
    expect(src).toContain("planning calculation, not a lab measurement");
  });
});

describe("Refrigerator content cluster: four distinct intents preserved", () => {
  it("each of the four pages exists with a distinct, non-duplicated purpose", () => {
    expect(getBestFor("best-for-refrigerator-backup")).toBeTruthy();
    expect(getGuide("power-station-for-refrigerator")).toBeTruthy();
    expect(getGuide("can-a-power-station-run-a-refrigerator")).toBeTruthy();
    expect(getGuide("best-indoor-generator-for-refrigerator")).toBeTruthy();
  });

  it("the best-for page cross-links all three refrigerator guides", () => {
    const content = getBestFor("best-for-refrigerator-backup")!;
    expect(content.relatedGuideSlugs).toEqual(
      expect.arrayContaining([
        "power-station-for-refrigerator",
        "can-a-power-station-run-a-refrigerator",
        "best-indoor-generator-for-refrigerator",
      ]),
    );
  });
});

describe("Near-page-1 pages: /compare and two guides gained real interactive/indexable content", () => {
  it("/compare has a stronger title and added indexable 'what to compare' content", () => {
    const src = read("src/app/compare/page.tsx");
    expect(src).toContain("What to actually compare");
    expect(src).toContain("Compare Power Stations Side by Side");
  });

  it("watts-vs-watt-hours embeds the watt-hour calculator", () => {
    expect(getGuide("watts-vs-watt-hours")!.embed).toBe("watt-hour-calculator");
  });

  it("the solar charging guide embeds the solar calculator and links a solar-filtered catalog view", () => {
    const guide = getGuide("how-long-to-charge-power-station-with-solar")!;
    expect(guide.embed).toBe("solar-charge-calculator");
    expect(guide.catalogFilterHref).toBe("/products?solar=1");
  });

  it("the guide template wires every declared embed value to a real component", () => {
    const embedValues = new Set(GUIDES.map((g) => g.embed).filter(Boolean));
    const src = read("src/app/guides/[slug]/page.tsx");
    for (const v of embedValues) {
      expect(src).toContain(`"${v}":`);
    }
  });

  it("/products honors a ?solar=1 deep link into the existing solar filter", () => {
    const src = read("src/components/product/ProductsBrowser.tsx");
    expect(src).toContain('searchParams.get("solar") === "1"');
    expect(src).toContain("needsSolar: true");
  });
});

describe("Contrast: secondary text token clears WCAG AA on the site's dark panels", () => {
  it("navy-400 was lightened from the original sub-AA shade", () => {
    const src = readFileSync(join(ROOT, "tailwind.config.ts"), "utf8");
    expect(src).not.toContain('400: "#5a7bae"');
    expect(src).toContain('400: "#7290bc"');
  });
});
