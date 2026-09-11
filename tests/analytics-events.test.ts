import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression coverage for the full-funnel measurement work (traffic-growth
 * round): the fixed GA4 event vocabulary, the affiliate_click placement
 * enum, comparison_started, and the "no PII / no free text / no affiliate
 * identifiers" contract every trackEvent call must honor. Complements the
 * older GA4 checks in tests/site-audit-improvements.test.ts rather than
 * replacing them.
 */

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

describe("Cloudflare Web Analytics: loaded exactly once, no duplicate integration", () => {
  it("the beacon script appears in exactly one file, mounted exactly once", () => {
    const offenders = srcFiles.filter((f) => srcContents.get(f)!.includes("cloudflareinsights.com"));
    expect(offenders).toEqual([join(SRC_DIR, "app/layout.tsx")]);
    const matches = read("src/app/layout.tsx").match(/cloudflareinsights\.com/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it("Cloudflare Web Analytics is not consent-gated (unlike GA4) — it stays outside AnalyticsConsent", () => {
    const consentSrc = read("src/components/analytics/AnalyticsConsent.tsx");
    expect(consentSrc).not.toContain("cloudflareinsights");
    const layoutSrc = read("src/app/layout.tsx");
    const beaconIdx = layoutSrc.indexOf("cloudflareinsights.com");
    expect(beaconIdx).toBeGreaterThan(-1);
  });
});

describe("affiliate_click: every placement is a closed internal enum, never free text or a URL", () => {
  const EXPECTED_PLACEMENTS = [
    "product_page_hero",
    "product_page_reviews_tab",
    "product_page_mobile_bar",
    "product_card",
    "compare_page",
    "model_comparison_page",
    "calculator_recommendation",
    "deals_page",
  ];

  it("AffiliateClickPlacement declares exactly the placements actually used in JSX", () => {
    const src = read("src/lib/analytics.ts");
    const match = src.match(/export type AffiliateClickPlacement =([\s\S]*?);/);
    expect(match).not.toBeNull();
    for (const p of EXPECTED_PLACEMENTS) {
      expect(match![1]).toContain(`"${p}"`);
    }
  });

  it("every placement string used in a <AmazonCta> or trackEvent(\"affiliate_click\" call is one of the declared enum values", () => {
    const usedPlacements = new Set<string>();
    for (const file of srcFiles) {
      const content = srcContents.get(file)!;
      for (const m of content.matchAll(/placement="([a-z_]+)"/g)) usedPlacements.add(m[1]);
      for (const m of content.matchAll(/placement:\s*"([a-z_]+)"/g)) usedPlacements.add(m[1]);
    }
    expect(usedPlacements.size).toBeGreaterThan(0);
    for (const p of usedPlacements) {
      expect(EXPECTED_PLACEMENTS, `unexpected placement "${p}" not in the declared enum`).toContain(p);
    }
  });

  it("MobileBuyBar's affiliate_click also carries a placement (it doesn't go through the AmazonCta component)", () => {
    const src = read("src/components/product/MobileBuyBar.tsx");
    const match = src.match(/trackEvent\("affiliate_click",\s*\{([\s\S]*?)\}\)/);
    expect(match).not.toBeNull();
    expect(match![1]).toContain('placement: "product_page_mobile_bar"');
  });
});

describe("comparison_started: fires once, exactly on the empty-to-first-product transition", () => {
  it("CompareContext only calls comparison_started when the tray was empty (prev.length === 0)", () => {
    const src = read("src/context/CompareContext.tsx");
    const calls = [...src.matchAll(/if \(prev\.length === 0\) trackEvent\("comparison_started"\);/g)];
    expect(calls.length).toBeGreaterThanOrEqual(2); // add() and toggle()
  });

  it("comparison_started never carries a product id or any other param (it marks a funnel stage, not a product)", () => {
    const src = read("src/context/CompareContext.tsx");
    expect(src).toContain('trackEvent("comparison_started")');
    expect(src).not.toMatch(/trackEvent\("comparison_started",\s*\{/);
  });
});

describe("Every trackEvent call site: params are internal identifiers, counts or booleans only", () => {
  // Patterns that would indicate free text, PII, or an affiliate/Amazon
  // identifier leaking into an analytics param.
  const FORBIDDEN_PATTERNS = [
    /amazon_affiliate_url/,
    /amazon_product_url/,
    /amazon_asin/,
    /\bhref\b/,
    /\bemail\b/i,
    /\.query\b/,
    /searchParams/,
    /\.name\b/, // e.g. device.name, product.name-as-free-text — ids/brand/model enums are passed as fixed fields elsewhere, never here
  ];

  /** Extracts each `trackEvent(...)` call's full text with balanced parens (params may nest, e.g. `Math.round(...)`). */
  function extractTrackEventCalls(content: string): string[] {
    const calls: string[] = [];
    const marker = "trackEvent(";
    let searchFrom = 0;
    while (true) {
      const start = content.indexOf(marker, searchFrom);
      if (start === -1) break;
      let depth = 0;
      let end = -1;
      for (let i = start + marker.length - 1; i < content.length; i++) {
        if (content[i] === "(") depth++;
        else if (content[i] === ")") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (end === -1) break;
      calls.push(content.slice(start, end + 1));
      searchFrom = end + 1;
    }
    return calls;
  }

  it("no trackEvent(...) call anywhere under src/ passes a forbidden pattern in its argument list", () => {
    const offenders: string[] = [];
    for (const file of srcFiles) {
      const content = srcContents.get(file)!;
      for (const call of extractTrackEventCalls(content)) {
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(call)) {
            offenders.push(`${file}: ${call}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("Core Web Vitals: exactly one LCP-priority product illustration, on the product detail hero", () => {
  it("ProductIllustration supports an opt-in priority prop, defaulted off", () => {
    const src = read("src/components/ui/ProductIllustration.tsx");
    expect(src).toContain("priority = false");
    expect(src).toContain("priority={priority}");
  });

  it("only the product detail page's hero illustration passes priority", () => {
    const offenders = srcFiles.filter(
      (f) =>
        f !== join(SRC_DIR, "app/products/[id]/page.tsx") &&
        /<ProductIllustration\b[\s\S]*?\/>/.test(srcContents.get(f)!) &&
        [...srcContents.get(f)!.matchAll(/<ProductIllustration\b[\s\S]*?\/>/g)].some((m) =>
          /\bpriority\b/.test(m[0]),
        ),
    );
    expect(offenders).toEqual([]);
    const heroSrc = read("src/app/products/[id]/page.tsx");
    const heroCalls = [...heroSrc.matchAll(/<ProductIllustration\b[\s\S]*?\/>/g)];
    const withPriority = heroCalls.filter((m) => /\bpriority\b/.test(m[0]));
    expect(withPriority.length).toBe(1);
  });
});

describe("GA4 request timing: gtag.js itself is never requested before consent is accepted", () => {
  it("the only <Script> that loads googletagmanager.com is inside GoogleAnalytics.tsx, which AnalyticsConsent only mounts post-acceptance", () => {
    const offenders = srcFiles.filter(
      (f) =>
        f !== join(SRC_DIR, "components/analytics/GoogleAnalytics.tsx") &&
        srcContents.get(f)!.includes("googletagmanager.com"),
    );
    expect(offenders).toEqual([]);
  });

  it("GoogleAnalytics performs no consent check of its own — being mounted at all is the only gate, and only AnalyticsConsent mounts it", () => {
    const gaSrc = read("src/components/analytics/GoogleAnalytics.tsx");
    expect(gaSrc).not.toContain("getStoredConsent");
    const mounters = srcFiles.filter((f) => srcContents.get(f)!.includes("<GoogleAnalytics"));
    expect(mounters).toEqual([join(SRC_DIR, "components/analytics/AnalyticsConsent.tsx")]);
  });
});
