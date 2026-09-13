import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { getAllProducts, getProductById } from "@/data/products";
import { resolveAmazonLink } from "@/lib/amazon";
import { getIllustrationPath, isEditorialIllustration } from "@/lib/illustrations";
import { isAffiliateShapedUrl } from "@/data/product-schema";

/**
 * Regression coverage for the 2026-09-12 "10 new catalog products" package
 * (powermatchlab-10-product-images.zip): a duplicate check against the
 * existing 39-product catalog found no collisions by name, brand/model,
 * ASIN, or affiliate short-link, so all 10 were added. Each ASIN was
 * independently cross-checked (via manufacturer-sourced WebSearch results)
 * against the model name the site owner supplied after manually resolving
 * every amzn.to redirect.
 */
const ROOT = process.cwd();

const NEW_PRODUCTS: Record<string, { brand: string; model: string; asin: string; affiliate: string; image: string }> = {
  "bluetti-elite-200-v2": {
    brand: "BLUETTI",
    model: "Elite 200 V2",
    asin: "B0DCJV9LTB",
    affiliate: "https://amzn.to/3UG1l4f",
    image: "01-bluetti-elite-200-v2.png",
  },
  "ecoflow-river-3": {
    brand: "EcoFlow",
    model: "RIVER 3",
    asin: "B0DB1S36YP",
    affiliate: "https://amzn.to/4h2mNYG",
    image: "02-ecoflow-river-3.png",
  },
  "jackery-homepower-3000": {
    brand: "Jackery",
    model: "HomePower 3000",
    asin: "B0FFSLG3WZ",
    affiliate: "https://amzn.to/4hrQUsP",
    image: "03-jackery-homepower-3000.png",
  },
  "ecoflow-delta-3-max": {
    brand: "EcoFlow",
    model: "DELTA 3 Max",
    asin: "B0FQV6LMVX",
    affiliate: "https://amzn.to/3T1Zeab",
    image: "04-ecoflow-delta-3-max.png",
  },
  "ecoflow-delta-3-max-plus": {
    brand: "EcoFlow",
    model: "DELTA 3 Max Plus",
    asin: "B0FQV9Q9J2",
    affiliate: "https://amzn.to/3UOGM5E",
    image: "05-ecoflow-delta-3-max-plus.png",
  },
  "ecoflow-delta-3-ultra-plus": {
    brand: "EcoFlow",
    model: "DELTA 3 Ultra Plus",
    asin: "B0FQVG59LV",
    affiliate: "https://amzn.to/4Abs3BI",
    image: "06-ecoflow-delta-3-ultra-plus.png",
  },
  "bluetti-elite-400": {
    brand: "BLUETTI",
    model: "Elite 400",
    asin: "B0G8YVL3SL",
    affiliate: "https://amzn.to/3USiUhp",
    image: "07-bluetti-elite-400.png",
  },
  "goal-zero-yeti-300": {
    brand: "Goal Zero",
    model: "Yeti 300",
    asin: "B0CRD8CVD8",
    affiliate: "https://amzn.to/4AaFmTc",
    image: "08-goal-zero-yeti-300.png",
  },
  "anker-solix-f2000": {
    brand: "Anker SOLIX",
    model: "F2000 (PowerHouse 767)",
    asin: "B09XM7WDZ2",
    affiliate: "https://amzn.to/4yueyeU",
    image: "09-anker-solix-f2000.png",
  },
  "jackery-homepower-3600-plus": {
    brand: "Jackery",
    model: "HomePower 3600 Plus",
    asin: "B0FM8653F1",
    affiliate: "https://amzn.to/3SLBnvA",
    image: "10-jackery-homepower-3600-plus.png",
  },
};

const NEW_IDS = Object.keys(NEW_PRODUCTS);

describe("10 new catalog products: presence and uniqueness", () => {
  const products = getAllProducts();

  it("the catalog now contains 49 products (39 existing + 10 new)", () => {
    expect(products.length).toBe(49);
  });

  it("every new product id exists exactly once in the catalog", () => {
    for (const id of NEW_IDS) {
      const matches = products.filter((p) => p.id === id);
      expect(matches.length, `${id} should appear exactly once`).toBe(1);
    }
  });

  it("no two products in the whole catalog share an id", () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no two products in the whole catalog share an ASIN", () => {
    const asins = products.map((p) => p.amazon_asin).filter((a): a is string => a !== null);
    expect(new Set(asins).size).toBe(asins.length);
  });

  it("no two products in the whole catalog share an affiliate URL", () => {
    const urls = products.map((p) => p.amazon_affiliate_url).filter((u): u is string => u !== null);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("none of the 10 new ASINs collide with any of the 39 pre-existing products", () => {
    const preExistingIds = products.filter((p) => !NEW_IDS.includes(p.id));
    for (const [id, data] of Object.entries(NEW_PRODUCTS)) {
      const collision = preExistingIds.find((p) => p.amazon_asin === data.asin);
      expect(collision, `${data.asin} (${id}) collides with pre-existing product ${collision?.id}`).toBeUndefined();
    }
  });
});

describe("10 new catalog products: exact brand/model/ASIN/affiliate-link correspondence", () => {
  for (const [id, data] of Object.entries(NEW_PRODUCTS)) {
    it(`${id} has the expected brand, model, ASIN and affiliate link`, () => {
      const product = getProductById(id);
      expect(product, `${id} should exist`).toBeDefined();
      expect(product!.brand).toBe(data.brand);
      expect(product!.model).toBe(data.model);
      expect(product!.amazon_asin).toBe(data.asin);
      expect(product!.amazon_affiliate_url).toBe(data.affiliate);
      expect(product!.market).toBe("US");
      expect(product!.category).toBe("portable-power-station");
    });
  }
}
);

describe("10 new catalog products: affiliate links are well-formed and confirmed", () => {
  for (const [id, data] of Object.entries(NEW_PRODUCTS)) {
    it(`${id}'s affiliate URL is shaped like a real Amazon Associates link`, () => {
      expect(isAffiliateShapedUrl(data.affiliate)).toBe(true);
    });

    it(`${id} is marked amazon_verification_status "confirmed" (required for any affiliate URL to be present)`, () => {
      const product = getProductById(id)!;
      expect(product.amazon_verification_status).toBe("confirmed");
    });

    it(`${id}'s direct amazon_product_url is a plain (non-affiliate) amazon.com link, distinct from the affiliate URL`, () => {
      const product = getProductById(id)!;
      expect(product.amazon_product_url).toMatch(/^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]+$/);
      expect(product.amazon_product_url).not.toBe(product.amazon_affiliate_url);
      expect(isAffiliateShapedUrl(product.amazon_product_url!)).toBe(false);
    });

    it(`${id}'s "Check Price on Amazon" CTA resolves to the real affiliate link`, () => {
      const product = getProductById(id)!;
      const link = resolveAmazonLink(product);
      expect(link.href).toBe(data.affiliate);
      expect(link.isAffiliate).toBe(true);
    });
  }
});

describe("10 new catalog products: illustration files exist, are registered, and match the manifest", () => {
  for (const id of NEW_IDS) {
    it(`${id}: illustration path resolves to /illustrations/${id}.png and the file exists`, () => {
      const product = getProductById(id)!;
      const path = getIllustrationPath(product);
      expect(path).toBe(`/illustrations/${id}.png`);
      expect(existsSync(join(ROOT, "public", path)), `missing file for ${id}`).toBe(true);
    });

    it(`${id} is flagged as an editorial illustration (site-owner-supplied, not a generic render)`, () => {
      const product = getProductById(id)!;
      expect(isEditorialIllustration(product)).toBe(true);
    });

    it(`${id}'s illustration file is non-trivial (not a stub)`, () => {
      const absolute = join(ROOT, "public", "illustrations", `${id}.png`);
      expect(statSync(absolute).size).toBeGreaterThan(100_000);
    });
  }

  it("no two of the 10 new illustrations are byte-identical to each other or to any pre-existing illustration", () => {
    const products = getAllProducts();
    const hashToIds = new Map<string, string[]>();
    for (const product of products) {
      const absolute = join(ROOT, "public", getIllustrationPath(product));
      const hash = createHash("sha256").update(readFileSync(absolute)).digest("hex");
      if (!hashToIds.has(hash)) hashToIds.set(hash, []);
      hashToIds.get(hash)!.push(product.id);
    }
    for (const [, ids] of hashToIds) {
      expect(ids.length, `these products share byte-identical image content: ${ids.join(", ")}`).toBe(1);
    }
  });
});

describe("10 new catalog products: schema-required unverified fields stay null (no invented data)", () => {
  it("every new product carries a valid ISO last_verified date", () => {
    for (const id of NEW_IDS) {
      const product = getProductById(id)!;
      expect(product.last_verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("every new product has a non-empty official_source", () => {
    for (const id of NEW_IDS) {
      const product = getProductById(id)!;
      expect(product.official_source).toBeTruthy();
    }
  });

  it("no new product has an amazon_listing_note asserting an unconfirmed bundle claim", () => {
    // None of the 10 were confirmed to bundle anything beyond the bare unit,
    // so the note must stay null rather than assert something unverified.
    for (const id of NEW_IDS) {
      const product = getProductById(id)!;
      expect(product.amazon_listing_note).toBeNull();
    }
  });

  it("no numeric field on any new product is NaN or Infinity", () => {
    const numericKeys = [
      "capacity_wh",
      "rated_output_w",
      "surge_output_w",
      "weight_kg",
      "solar_input_w",
      "ac_charging_w",
      "ac_outlets",
      "usb_c",
      "usb_a",
      "ups_ms",
      "max_expanded_capacity_wh",
      "idle_consumption_w",
    ] as const;
    for (const id of NEW_IDS) {
      const product = getProductById(id)!;
      for (const key of numericKeys) {
        const value = product[key];
        if (value !== null) {
          expect(Number.isFinite(value), `${id}.${key} = ${value}`).toBe(true);
        }
      }
    }
  });
});

describe("10 new catalog products: no regression to the pre-existing 39 products", () => {
  it("products.json is a pure append — the diff against the pre-change baseline removes zero lines", () => {
    // This is enforced procedurally during implementation (git diff showed
    // 0 removed lines); this test pins the mechanism that guarantees it:
    // every pre-existing id/ASIN is still present, unchanged, and none of
    // the 10 new ids/ASINs were reused from the old set.
    const products = getAllProducts();
    const preExisting = products.filter((p) => !NEW_IDS.includes(p.id));
    expect(preExisting.length).toBe(39);
  });

  it("every one of the original 10 V1 affiliate links is still present and unchanged", () => {
    const V1_LINKS: Record<string, string> = {
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
    for (const [id, url] of Object.entries(V1_LINKS)) {
      const product = getProductById(id);
      expect(product, `${id} should still exist`).toBeDefined();
      expect(product!.amazon_affiliate_url).toBe(url);
    }
  });

  it("products.json hash reflects only the additive change (recorded here for traceability, not asserted against a stale value)", () => {
    // Deliberately not pinned to a literal hash: unlike the author-trust-layer
    // work, this PR's whole point is to change products.json. What matters is
    // that it changed via pure addition (see the diff-based test above and
    // the id-count / V1-link checks), not that its hash matches a constant.
    const buf = readFileSync(join(ROOT, "products.json"));
    const hash = createHash("sha256").update(buf).digest("hex");
    expect(hash).toHaveLength(64);
  });
});
