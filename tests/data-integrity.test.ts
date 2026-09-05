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

describe("catalog data integrity", () => {
  it("loads the full V1 + V2 catalog (10 + 12 = 22 records)", () => {
    expect(products).toHaveLength(22);
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

  it("every catalog product now has an affiliate URL (no direct-link fallback remains)", () => {
    expect(products).toHaveLength(V1_IDS.length + V2_IDS.length);
    for (const p of products) {
      expect(p.amazon_affiliate_url, `"${p.id}" should have an affiliate URL`).not.toBeNull();
    }
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
