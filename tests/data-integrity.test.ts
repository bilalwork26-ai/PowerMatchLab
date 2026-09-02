import { describe, expect, it } from "vitest";
import { getAllProducts, getProductById } from "@/data/products";
import { resolveAmazonLink } from "@/lib/amazon";

const products = getAllProducts();

/**
 * Canonical product -> Amazon Associates link mapping, exactly as supplied by
 * the site owner (generated via Amazon SiteStripe, tracking ID
 * `powermatchlab-20`). This pins every button to its verified counterpart and
 * catches any accidental mismatch, duplication, or drift.
 */
const EXPECTED_AFFILIATE_LINKS: Record<string, string> = {
  "ecoflow-delta-pro-3": "https://amzn.to/4daJPev",
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

describe("catalog data integrity", () => {
  it("loads all 10 V1 records", () => {
    expect(products).toHaveLength(10);
  });

  it("gives every product a verified Amazon Associates affiliate URL", () => {
    for (const p of products) {
      expect(p.amazon_affiliate_url).not.toBeNull();
      expect(p.amazon_affiliate_url).toMatch(/^https:\/\/amzn\.to\/[A-Za-z0-9]+$/);
    }
  });

  it("matches each product to exactly its own affiliate link, with no duplicates", () => {
    for (const [id, expectedUrl] of Object.entries(EXPECTED_AFFILIATE_LINKS)) {
      const product = getProductById(id);
      expect(product, `product "${id}" should exist`).toBeDefined();
      expect(product!.amazon_affiliate_url).toBe(expectedUrl);
    }
    // No two products should ever share the same affiliate destination.
    const urls = products.map((p) => p.amazon_affiliate_url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("uses the Amazon Associates affiliate URL for the CTA", () => {
    for (const p of products) {
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

  it("keeps the EcoFlow DELTA Pro 3 ASIN and product URL consistent after the E/F correction", () => {
    const deltaPro3 = getProductById("ecoflow-delta-pro-3");
    expect(deltaPro3).toBeDefined();
    expect(deltaPro3!.amazon_asin).toBe("B0D14FMEZD");
    expect(deltaPro3!.amazon_product_url).toBe(
      "https://www.amazon.com/dp/B0D14FMEZD",
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
