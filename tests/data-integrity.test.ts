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
 * The 25 V2 catalog-expansion product ids. These ship with a verified direct
 * `amazon_product_url` but intentionally NO `amazon_affiliate_url` yet — the
 * site owner has not supplied real Amazon Associates links for them, and the
 * project rule is to never manufacture one. The CTA falls back to the direct
 * link (see `resolveAmazonLink`) until real affiliate links are supplied.
 */
const V2_IDS = [
  "ecoflow-river-3-plus", "jackery-explorer-300-plus", "bluetti-eb3a", "dji-power-500",
  "anker-solix-c300", "ecoflow-river-2-pro", "jackery-explorer-1000-plus", "goal-zero-yeti-700",
  "allpowers-r1500-lite", "segway-cube-1000", "growatt-infinity-1300", "vtoman-flashspeed-1000",
  "ecoflow-delta-2-max", "jackery-explorer-2000-plus", "bluetti-ac200l", "anker-solix-f2000",
  "pecron-e2400lfp", "growatt-infinity-1500", "vtoman-flashspeed-1500", "pecron-e3600lfp",
  "oukitel-p5000", "mango-power-e", "bluetti-elite-300", "anker-solix-f3000",
  "zendure-superbase-v4600",
];

describe("catalog data integrity", () => {
  it("loads the full V1 + V2 catalog (10 + 25 = 35 records)", () => {
    expect(products).toHaveLength(35);
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

  it("leaves V2 products without a fabricated affiliate URL, but with a verified direct link", () => {
    for (const id of V2_IDS) {
      const p = getProductById(id)!;
      expect(p, `V2 product "${id}" should exist`).toBeDefined();
      expect(p.amazon_affiliate_url).toBeNull();
      expect(p.amazon_product_url).toMatch(/^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}$/);
    }
  });

  it("matches each V1 product to exactly its own affiliate link, with no duplicates", () => {
    for (const [id, expectedUrl] of Object.entries(EXPECTED_AFFILIATE_LINKS)) {
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

  it("uses the Amazon Associates affiliate URL for the CTA on V1 products", () => {
    for (const id of V1_IDS) {
      const p = getProductById(id)!;
      const link = resolveAmazonLink(p);
      expect(link.isAffiliate).toBe(true);
      expect(link.href).toBe(p.amazon_affiliate_url);
    }
  });

  it("falls back to the direct product URL for the CTA on V2 products", () => {
    for (const id of V2_IDS) {
      const p = getProductById(id)!;
      const link = resolveAmazonLink(p);
      expect(link.isAffiliate).toBe(false);
      expect(link.href).toBe(p.amazon_product_url);
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
