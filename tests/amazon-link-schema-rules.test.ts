import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  productSchema,
  productsSchema,
  isAffiliateShapedUrl,
  AMAZON_ASSOCIATES_TAG,
} from "@/data/product-schema";

const BASE = {
  id: "test-product",
  brand: "TestBrand",
  model: "Test Model",
  market: "US" as const,
  category: "portable-power-station" as const,
  capacity_wh: 1000,
  rated_output_w: 1000,
  surge_output_w: 2000,
  battery_chemistry: "LiFePO4",
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
  best_for: ["camping"],
  pros: ["pro"],
  cons: ["con"],
  official_source: "Test Manufacturer",
  last_verified: "2026-01-01",
  amazon_asin: "B0TEST1234",
  amazon_verification_status: "confirmed" as const,
};

describe("isAffiliateShapedUrl", () => {
  it("recognizes amzn.to short links", () => {
    expect(isAffiliateShapedUrl("https://amzn.to/abc123")).toBe(true);
  });
  it("recognizes a full URL carrying the real Associates tag", () => {
    expect(
      isAffiliateShapedUrl(`https://www.amazon.com/dp/B0TEST1234?tag=${AMAZON_ASSOCIATES_TAG}`),
    ).toBe(true);
  });
  it("rejects a plain direct product URL with an ASIN but no tag", () => {
    expect(isAffiliateShapedUrl("https://www.amazon.com/dp/B0TEST1234")).toBe(false);
  });
  it("rejects a URL carrying a different tracking tag", () => {
    expect(
      isAffiliateShapedUrl("https://www.amazon.com/dp/B0TEST1234?tag=someone-else-20"),
    ).toBe(false);
  });
});

describe("productSchema: a plain direct link can never pass as an affiliate link", () => {
  it("accepts a product with a null affiliate URL and a plain direct URL (the honest pending state)", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_product_url: "https://www.amazon.com/dp/B0TEST1234",
      amazon_affiliate_url: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a real amzn.to affiliate link alongside a distinct direct URL", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_product_url: "https://www.amazon.com/dp/B0TEST1234",
      amazon_affiliate_url: "https://amzn.to/realShortLink",
    });
    expect(result.success).toBe(true);
  });

  it("rejects amazon_affiliate_url that is just the ASIN URL with no tag or amzn.to shape", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_product_url: "https://www.amazon.com/dp/B0TEST1234",
      amazon_affiliate_url: "https://www.amazon.com/dp/B0TEST1234?ref=something",
    });
    expect(result.success).toBe(false);
  });

  it("rejects amazon_affiliate_url identical to amazon_product_url even if both are non-null", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_product_url: "https://www.amazon.com/dp/B0TEST1234",
      amazon_affiliate_url: "https://www.amazon.com/dp/B0TEST1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects amazon_product_url that itself carries the Associates tag (direct means direct)", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_product_url: `https://www.amazon.com/dp/B0TEST1234?tag=${AMAZON_ASSOCIATES_TAG}`,
      amazon_affiliate_url: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects amazon_product_url that is itself an amzn.to link", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_product_url: "https://amzn.to/shouldNotBeHere",
      amazon_affiliate_url: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a tracking tag other than powermatchlab-20", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_product_url: "https://www.amazon.com/dp/B0TEST1234",
      amazon_affiliate_url: "https://www.amazon.com/dp/B0TEST1234?tag=wrong-tag-20",
    });
    expect(result.success).toBe(false);
  });
});

describe("productSchema: amazon_verification_status gates whether an affiliate link can exist at all", () => {
  it("accepts a pending product with a provisional direct URL and no affiliate link", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_verification_status: "pending",
      amazon_product_url: "https://www.amazon.com/dp/B0TEST1234",
      amazon_affiliate_url: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a real affiliate link on a product whose Amazon listing is only \"pending\"", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_verification_status: "pending",
      amazon_product_url: "https://www.amazon.com/dp/B0TEST1234",
      amazon_affiliate_url: "https://amzn.to/realShortLink",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a real affiliate link on a \"rejected\" listing", () => {
    const result = productSchema.safeParse({
      ...BASE,
      amazon_verification_status: "rejected",
      amazon_product_url: "https://www.amazon.com/dp/B0TEST1234",
      amazon_affiliate_url: "https://amzn.to/realShortLink",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing amazon_verification_status entirely (no implicit default)", () => {
    const { amazon_verification_status: _drop, ...withoutStatus } = {
      ...BASE,
      amazon_product_url: "https://www.amazon.com/dp/B0TEST1234",
      amazon_affiliate_url: null,
    };
    const result = productSchema.safeParse(withoutStatus);
    expect(result.success).toBe(false);
  });
});

describe("the real catalog (products.json) satisfies the full schema including link rules", () => {
  it("parses via productsSchema with no issues", () => {
    // Exercises the real file through the exact same schema products.ts uses.
    // A failure here means a product in the catalog violates a link rule.
    const raw = JSON.parse(readFileSync(join(process.cwd(), "products.json"), "utf8"));
    const result = productsSchema.safeParse(raw);
    if (!result.success) {
      console.error(result.error.issues);
    }
    expect(result.success).toBe(true);
  });
});
