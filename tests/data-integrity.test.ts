import { describe, expect, it } from "vitest";
import { getAllProducts } from "@/data/products";
import { resolveAmazonLink } from "@/lib/amazon";

const products = getAllProducts();

describe("catalog data integrity", () => {
  it("loads all 10 V1 records", () => {
    expect(products).toHaveLength(10);
  });

  it("keeps every amazon_affiliate_url null in V1", () => {
    for (const p of products) {
      expect(p.amazon_affiliate_url).toBeNull();
    }
  });

  it("falls back to the direct Amazon product URL for the CTA", () => {
    for (const p of products) {
      const link = resolveAmazonLink(p);
      expect(link.isAffiliate).toBe(false);
      expect(link.href).toBe(p.amazon_product_url);
      expect(link.href).toMatch(/^https:\/\/www\.amazon\.com\/dp\//);
    }
  });

  it("uses the affiliate URL only when one is present", () => {
    const withAffiliate = {
      ...products[0],
      amazon_affiliate_url: "https://www.amazon.com/dp/X?tag=example-20",
    };
    const link = resolveAmazonLink(withAffiliate);
    expect(link.isAffiliate).toBe(true);
    expect(link.href).toBe(withAffiliate.amazon_affiliate_url);
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
