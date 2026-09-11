import { describe, expect, it } from "vitest";
import { getAllProducts, getProductById } from "@/data/products";
import { resolveAmazonLink } from "@/lib/amazon";

const products = getAllProducts();

/**
 * Canonical product -> Amazon Associates link mapping for the original V1
 * catalog, exactly as supplied by the site owner (generated via Amazon
 * SiteStripe, tracking ID `powermatchlab-20`). This pins every button to its
 * verified counterpart and catches any accidental mismatch, duplication, or
 * drift.
 *
 * "ecoflow-delta-pro-3" briefly had no affiliate link (its old amzn.to link
 * was generated against a stale/typo'd ASIN, B0D14FMEZD, that resolved to no
 * real listing). The site owner corrected the ASIN to B0D14FMFZD and
 * supplied a fresh Associates link for it, so it's back in this map like
 * every other V1 product.
 */
const EXPECTED_AFFILIATE_LINKS: Record<string, string> = {
  "ecoflow-delta-pro-3": "https://amzn.to/4691jEl",
  "anker-solix-f3800": "https://amzn.to/3UsOl1K",
  "anker-solix-s2000": "https://amzn.to/462BxBM",
  "anker-solix-c1000-gen-2": "https://amzn.to/4zTzRrS",
  "anker-solix-c2000-gen-2": "https://amzn.to/3SqjJNP",
  "jackery-explorer-2000-v2": "https://amzn.to/4x151e0",
  "bluetti-ac180": "https://amzn.to/4gIsMSa",
  "ecoflow-delta-3-classic": "https://amzn.to/3V8rkBi",
  "jackery-explorer-1000-v2": "https://amzn.to/4xt2BGe",
  "bluetti-elite-30-v2": "https://amzn.to/4xzHJNL",
};

/** The 10 original V1 product ids, still expected to be present after V2. */
const V1_IDS = Object.keys(EXPECTED_AFFILIATE_LINKS);

/**
 * The 12 surviving V2 catalog-expansion product ids, each with a real Amazon
 * Associates link supplied by the site owner (2026-09-05). The other 13 V2
 * products from the original 25-product expansion have since been removed —
 * 9 because their exact Amazon.com listing no longer sells the product or
 * redirects to a different model, and 4 in an earlier cleanup because their
 * listing was inactive. Every surviving product now has a real affiliate
 * link; none are left falling back to a direct product-page link.
 */
const EXPECTED_V2_AFFILIATE_LINKS: Record<string, string> = {
  "anker-solix-c300": "https://amzn.to/4zYmJSb",
  "goal-zero-yeti-700": "https://amzn.to/4qVjKWB",
  "ecoflow-river-2-pro": "https://amzn.to/4djByFa",
  "segway-cube-1000": "https://amzn.to/4A4hVej",
  "vtoman-flashspeed-1000": "https://amzn.to/4AfQWN1",
  "bluetti-ac200l": "https://amzn.to/3VdE7Cw",
  "pecron-e2400lfp": "https://amzn.to/3UTsbWr",
  "ecoflow-delta-2-max": "https://amzn.to/4gEbqqL",
  "jackery-explorer-2000-plus": "https://amzn.to/4qWL7Qd",
  "pecron-e3600lfp": "https://amzn.to/4i8EoQN",
  "anker-solix-f3000": "https://amzn.to/3VfhBcr",
  "bluetti-elite-300": "https://amzn.to/4yrC0JX",
};

const V2_IDS = Object.keys(EXPECTED_V2_AFFILIATE_LINKS);

/**
 * The 4 Milestone 4 catalog-expansion products (added 2026-09-11). These are
 * the first products in the catalog to intentionally have
 * `amazon_affiliate_url: null` — each links to its real, verified
 * Amazon.com listing (amazon_product_url) via the AmazonCta direct-link
 * fallback until the site owner generates a real Associates link for them.
 * Specs cross-corroborated via WebSearch against each brand's own US site
 * plus independent retailer/review sources; any field that could not be
 * confirmed was left null rather than guessed.
 */
const V3_IDS = [
  "anker-solix-c800-plus",
  "ecoflow-river-3-plus",
  "jackery-explorer-300-plus",
  "bluetti-ac70",
];

/**
 * The 40-product catalog build-out (2026-09-11). 13 of these 14 are
 * `amazon_verification_status: "pending"` — their ASIN/amazon_product_url
 * are WebSearch-sourced research candidates only, not yet confirmed to
 * match the exact base unit, so the UI shows no purchase CTA for them at
 * all (see resolveAmazonLink). "bluetti-apex-300" is the sole exception:
 * its Amazon listing was explicitly confirmed to match the linked base
 * unit (2764.8Wh, no expansion battery), so it is "confirmed" and uses the
 * normal honest direct-link fallback like the V3 products above, even
 * though a real affiliate link still hasn't been generated for it.
 */
const V4_PENDING_IDS = [
  "dji-power-2000",
  "goal-zero-yeti-1500-6th-gen",
  "geneverse-homepower-one-pro",
  "jackery-explorer-3000-v2",
  "ecoflow-delta-pro-ultra",
  "growatt-helios-3600",
  "mango-power-e",
  "jackery-explorer-500-v2",
  "jackery-explorer-5000-plus",
  "bluetti-elite-100-v2",
  "dji-power-1000-v2",
  "growatt-vita-550",
  "ecoflow-delta-3-plus",
];
const V4_CONFIRMED_IDS = ["bluetti-apex-300"];
const V4_IDS = [...V4_CONFIRMED_IDS, ...V4_PENDING_IDS];

describe("catalog data integrity", () => {
  it("loads the full 40-product catalog (10 V1 + 12 V2 + 4 V3 + 14 V4)", () => {
    expect(products).toHaveLength(
      V1_IDS.length + V2_IDS.length + V3_IDS.length + V4_IDS.length,
    );
    expect(products).toHaveLength(40);
  });

  it("still contains every V1 record", () => {
    for (const id of V1_IDS) {
      expect(getProductById(id), `V1 product "${id}" should still exist`).toBeDefined();
    }
  });

  it("gives every V1 product a verified Amazon Associates affiliate URL", () => {
    for (const id of V1_IDS) {
      const p = getProductById(id)!;
      expect(p.amazon_affiliate_url).not.toBeNull();
      expect(p.amazon_affiliate_url).toMatch(/^https:\/\/amzn\.to\/[A-Za-z0-9]+$/);
    }
  });

  it("gives every V2 product a verified Amazon Associates affiliate URL", () => {
    for (const id of V2_IDS) {
      const p = getProductById(id);
      expect(p, `V2 product "${id}" should exist`).toBeDefined();
      expect(p!.amazon_affiliate_url).not.toBeNull();
      expect(p!.amazon_affiliate_url).toMatch(/^https:\/\/amzn\.to\/[A-Za-z0-9]+$/);
    }
  });

  it("matches each V1 and V2 product to exactly its own affiliate link, with no duplicates", () => {
    for (const [id, expectedUrl] of Object.entries({
      ...EXPECTED_AFFILIATE_LINKS,
      ...EXPECTED_V2_AFFILIATE_LINKS,
    })) {
      const product = getProductById(id);
      expect(product, `product "${id}" should exist`).toBeDefined();
      expect(product!.amazon_affiliate_url).toBe(expectedUrl);
    }
    // No two products should ever share the same affiliate destination.
    const urls = products.map((p) => p.amazon_affiliate_url).filter((u) => u !== null);
    expect(new Set(urls).size).toBe(urls.length);
    // Nor the same direct product URL.
    const productUrls = products.map((p) => p.amazon_product_url).filter((u) => u !== null);
    expect(new Set(productUrls).size).toBe(productUrls.length);
  });

  it("every V1 and V2 catalog product still has an affiliate URL", () => {
    for (const id of [...V1_IDS, ...V2_IDS]) {
      const p = getProductById(id)!;
      expect(p.amazon_affiliate_url, `"${p.id}" should have an affiliate URL`).not.toBeNull();
    }
  });

  it("every V1/V2/V3/V4 product declares amazon_verification_status explicitly", () => {
    for (const p of products) {
      expect(
        ["pending", "confirmed", "rejected"],
        `"${p.id}" has an unexpected amazon_verification_status`,
      ).toContain(p.amazon_verification_status);
    }
    for (const id of [...V1_IDS, ...V2_IDS, ...V3_IDS, ...V4_CONFIRMED_IDS]) {
      expect(getProductById(id)!.amazon_verification_status).toBe("confirmed");
    }
    for (const id of V4_PENDING_IDS) {
      expect(getProductById(id)!.amazon_verification_status).toBe("pending");
    }
  });

  it("V4 (40-product build-out) products never carry a real affiliate link before SiteStripe verification", () => {
    for (const id of V4_IDS) {
      const p = getProductById(id);
      expect(p, `V4 product "${id}" should exist`).toBeDefined();
      expect(p!.amazon_affiliate_url, `"${id}" must not have an affiliate link yet`).toBeNull();
    }
  });

  it("pending V4 products show no Amazon purchase link at all, even though a candidate URL is stored", () => {
    for (const id of V4_PENDING_IDS) {
      const p = getProductById(id)!;
      // The candidate URL/ASIN are stored as research data...
      if (p.amazon_product_url !== null) {
        expect(p.amazon_product_url).toMatch(/^https:\/\//);
      }
      // ...but resolveAmazonLink must never surface them as a real CTA.
      const link = resolveAmazonLink(p);
      expect(link.href, `"${id}" is pending — no href should resolve`).toBeNull();
      expect(link.isAffiliate).toBe(false);
    }
  });

  it("the confirmed V4 product (bluetti-apex-300) uses the honest direct-link fallback like V3", () => {
    const p = getProductById("bluetti-apex-300")!;
    expect(p.amazon_verification_status).toBe("confirmed");
    expect(p.amazon_asin).toBe("B0F42JY551");
    const link = resolveAmazonLink(p);
    expect(link.href).toBe(p.amazon_product_url);
    expect(link.isAffiliate).toBe(false);
  });

  it("Milestone 4 V3 products are real, distinct, and use the direct-link fallback honestly", () => {
    for (const id of V3_IDS) {
      const p = getProductById(id);
      expect(p, `V3 product "${id}" should exist`).toBeDefined();
      // No affiliate link has been generated for these yet — must stay null,
      // never fabricated.
      expect(p!.amazon_affiliate_url).toBeNull();
      expect(p!.amazon_asin).toMatch(/^[A-Z0-9]{10}$/);
      expect(p!.amazon_product_url).toBe(`https://www.amazon.com/dp/${p!.amazon_asin}`);
      expect(p!.official_source).toBeTruthy();
      expect(p!.last_verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const link = resolveAmazonLink(p!);
      expect(link.isAffiliate).toBe(false);
      expect(link.href).toBe(p!.amazon_product_url);
    }
    // No V3 product duplicates an existing id, ASIN, or product URL.
    const allIds = products.map((p) => p.id);
    expect(new Set(allIds).size).toBe(allIds.length);
    const allAsins = products.map((p) => p.amazon_asin).filter((a) => a !== null);
    expect(new Set(allAsins).size).toBe(allAsins.length);
  });

  it("uses the Amazon Associates affiliate URL for the CTA on every product", () => {
    for (const id of [...V1_IDS, ...V2_IDS]) {
      const p = getProductById(id)!;
      const link = resolveAmazonLink(p);
      expect(link.isAffiliate).toBe(true);
      expect(link.href).toBe(p.amazon_affiliate_url);
    }
  });

  it("still falls back to the direct product URL when a product has no affiliate link", () => {
    const withoutAffiliate = { ...products[0], amazon_affiliate_url: null };
    const link = resolveAmazonLink(withoutAffiliate);
    expect(link.isAffiliate).toBe(false);
    expect(link.href).toBe(withoutAffiliate.amazon_product_url);
    expect(link.href).toMatch(/^https:\/\/www\.amazon\.com\/dp\//);
  });

  it("keeps the EcoFlow DELTA Pro 3 ASIN and product URL on the manually-verified listing", () => {
    // B0D14FMEZD (note the "E") was a one-character typo of the real ASIN —
    // it resolved to no listing at all, which is what caused Amazon's short
    // link to fall back to a generic search page. B0D14FMFZD (note the "F")
    // is the real, standalone DELTA Pro 3 listing, manually confirmed on
    // Amazon.com by the site owner on 2026-09-05.
    const deltaPro3 = getProductById("ecoflow-delta-pro-3");
    expect(deltaPro3).toBeDefined();
    expect(deltaPro3!.amazon_asin).toBe("B0D14FMFZD");
    expect(deltaPro3!.amazon_product_url).toBe(
      "https://www.amazon.com/dp/B0D14FMFZD",
    );
  });

  it("does not coerce unknown numeric fields to 0", () => {
    // At least one record has a genuinely unknown weight — it must stay null.
    const anyNullWeight = products.some((p) => p.weight_kg === null);
    expect(anyNullWeight).toBe(true);
    for (const p of products) {
      if (p.weight_kg !== null) expect(p.weight_kg).toBeGreaterThan(0);
    }
  });

  it("retains the DELTA 3 Classic naming (not the old DELTA 3)", () => {
    const ecoflow = products.find((p) => p.id === "ecoflow-delta-3-classic");
    expect(ecoflow).toBeDefined();
    expect(ecoflow!.model).toBe("DELTA 3 Classic");
    expect(products.find((p) => p.id === "ecoflow-delta-3")).toBeUndefined();
  });
});
