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
 * The 4 Milestone 4 catalog-expansion products (added 2026-09-11). Three of
 * them (ecoflow-river-3-plus, jackery-explorer-300-plus, bluetti-ac70) later
 * received real Amazon Associates SiteStripe links from the site owner
 * (2026-09-11, see EXPECTED_V3_V4_AFFILIATE_LINKS below).
 * "anker-solix-c800-plus" remains confirmed-but-unlinked: its ASIN listing
 * could not be safely resolved on Amazon.com (risk of confusion with the
 * different "C800X"/"C800" models), so it still uses the honest
 * no-purchase-link fallback until a verified ASIN is found.
 */
const V3_IDS = [
  "anker-solix-c800-plus",
  "ecoflow-river-3-plus",
  "jackery-explorer-300-plus",
  "bluetti-ac70",
];
const V3_WITHOUT_AFFILIATE_LINK_IDS = ["anker-solix-c800-plus"];
const V3_WITH_AFFILIATE_LINK_IDS = V3_IDS.filter(
  (id) => !V3_WITHOUT_AFFILIATE_LINK_IDS.includes(id),
);

/**
 * The 40-product catalog build-out (2026-09-11). Originally 13 of these 14
 * were `amazon_verification_status: "pending"` (WebSearch-sourced research
 * candidates only) and 1 ("bluetti-apex-300") was "confirmed" but still
 * unlinked. On 2026-09-11 the site owner supplied real Amazon Associates
 * SiteStripe links for 9 of the 14 — bluetti-apex-300 plus 8 that had been
 * pending — flipping their amazon_verification_status to "confirmed".
 *
 * On the same day, the site owner ruled on the remaining 5: 4 were approved
 * as correct listings (amazon_verification_status -> "confirmed", but still
 * no affiliate link — that comes later via SiteStripe) and 1
 * (geneverse-homepower-one-pro) was rejected for substitution, staying
 * "pending" until a replacement product is found. Two of the 4 approvals
 * carry an `amazon_listing_note` disclosing that the verified Amazon.com
 * listing bundles something beyond the bare unit:
 * jackery-explorer-5000-plus (an Anderson extension cable — no added
 * capacity/power) and growatt-vita-550 (a 200W solar panel, kept out of the
 * unit's own spec fields). ecoflow-delta-pro-ultra's ASIN was corrected
 * from the old bundle listing (B0D2WF8QNZ) to a clean base-unit match
 * (B0CQXMZ5BK). ecoflow-delta-3-plus's already-clean ASIN was simply
 * approved as-is.
 */
const V4_PENDING_IDS = ["geneverse-homepower-one-pro"];
const V4_NEWLY_CONFIRMED_IDS = [
  "dji-power-2000",
  "goal-zero-yeti-1500-6th-gen",
  "jackery-explorer-3000-v2",
  "growatt-helios-3600",
  "mango-power-e",
  "jackery-explorer-500-v2",
  "bluetti-elite-100-v2",
  "dji-power-1000-v2",
];
/** Confirmed and carrying a real SiteStripe affiliate link. */
const V4_LINKED_CONFIRMED_IDS = ["bluetti-apex-300", ...V4_NEWLY_CONFIRMED_IDS];
/** Confirmed (site owner approved the ASIN/listing) but no affiliate link yet. */
const V4_CONFIRMED_UNLINKED_IDS = [
  "ecoflow-delta-pro-ultra",
  "jackery-explorer-5000-plus",
  "growatt-vita-550",
  "ecoflow-delta-3-plus",
];
const EXPECTED_LISTING_NOTES: Record<string, string> = {
  "jackery-explorer-5000-plus": "Amazon option includes an Anderson extension cable",
  "growatt-vita-550": "Amazon bundle includes a 200W solar panel",
};
const V4_CONFIRMED_IDS = [...V4_LINKED_CONFIRMED_IDS, ...V4_CONFIRMED_UNLINKED_IDS];
const V4_IDS = [...V4_CONFIRMED_IDS, ...V4_PENDING_IDS];

/**
 * Real Amazon Associates links supplied by the site owner via SiteStripe on
 * 2026-09-11 (tracking ID `powermatchlab-20`), covering the 3 newly-linked
 * V3 products and the 9 newly-linked V4 products (bluetti-apex-300 plus the
 * 8 V4_NEWLY_CONFIRMED_IDS). Saved verbatim, case preserved.
 */
const EXPECTED_V3_V4_AFFILIATE_LINKS: Record<string, string> = {
  "bluetti-apex-300": "https://amzn.to/4hljoVX",
  "dji-power-2000": "https://amzn.to/4r6hprX",
  "goal-zero-yeti-1500-6th-gen": "https://amzn.to/4yANPNZ",
  "jackery-explorer-3000-v2": "https://amzn.to/4gNy543",
  "growatt-helios-3600": "https://amzn.to/46YFrM9",
  "mango-power-e": "https://amzn.to/3TuurTL",
  "jackery-explorer-500-v2": "https://amzn.to/4xovB10",
  "bluetti-elite-100-v2": "https://amzn.to/3UHjcYx",
  "dji-power-1000-v2": "https://amzn.to/46fIbET",
  "bluetti-ac70": "https://amzn.to/4xSqojb",
  "ecoflow-river-3-plus": "https://amzn.to/4zZJkhg",
  "jackery-explorer-300-plus": "https://amzn.to/4ys4XoU",
};

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

  it("V4 pending products never carry a real affiliate link before SiteStripe verification", () => {
    for (const id of V4_PENDING_IDS) {
      const p = getProductById(id);
      expect(p, `V4 product "${id}" should exist`).toBeDefined();
      expect(p!.amazon_affiliate_url, `"${id}" must not have an affiliate link yet`).toBeNull();
    }
  });

  it("V4 newly-confirmed products carry exactly their assigned SiteStripe affiliate link", () => {
    for (const id of V4_LINKED_CONFIRMED_IDS) {
      const p = getProductById(id);
      expect(p, `V4 product "${id}" should exist`).toBeDefined();
      expect(p!.amazon_affiliate_url).toBe(EXPECTED_V3_V4_AFFILIATE_LINKS[id]);
      const link = resolveAmazonLink(p!);
      expect(link.href).toBe(EXPECTED_V3_V4_AFFILIATE_LINKS[id]);
      expect(link.isAffiliate).toBe(true);
    }
  });

  it("V4 confirmed-but-unlinked products (site owner approved the ASIN, no affiliate link yet) show no CTA and carry the right listing note", () => {
    for (const id of V4_CONFIRMED_UNLINKED_IDS) {
      const p = getProductById(id);
      expect(p, `V4 product "${id}" should exist`).toBeDefined();
      expect(p!.amazon_verification_status).toBe("confirmed");
      expect(p!.amazon_affiliate_url, `"${id}" must not have an affiliate link yet`).toBeNull();
      const link = resolveAmazonLink(p!);
      expect(link.href).toBeNull();
      expect(link.isAffiliate).toBe(false);
      expect(p!.amazon_listing_note).toBe(EXPECTED_LISTING_NOTES[id] ?? null);
    }
  });

  it("ecoflow-delta-pro-ultra's ASIN was corrected off the old bundle listing to the approved base-unit match", () => {
    const p = getProductById("ecoflow-delta-pro-ultra")!;
    expect(p.amazon_asin).toBe("B0CQXMZ5BK");
    expect(p.amazon_product_url).toBe(
      "https://www.amazon.com/EF-ECOFLOW-Expandable-Generator-Emergency/dp/B0CQXMZ5BK",
    );
    expect(p.amazon_asin).not.toBe("B0D2WF8QNZ");
  });

  it("jackery-explorer-5000-plus was approved provisionally on the Anderson-cable listing, ASIN B0FCSHFJ6S", () => {
    const p = getProductById("jackery-explorer-5000-plus")!;
    expect(p.amazon_asin).toBe("B0FCSHFJ6S");
    expect(p.amazon_listing_note).toBe("Amazon option includes an Anderson extension cable");
  });

  it("growatt-vita-550 keeps its original ASIN, approved as a transparent solar-panel bundle", () => {
    const p = getProductById("growatt-vita-550")!;
    expect(p.amazon_asin).toBe("B0BSH4F944");
    expect(p.amazon_listing_note).toBe("Amazon bundle includes a 200W solar panel");
  });

  it("ecoflow-delta-3-plus keeps its already-clean ASIN, simply approved as-is", () => {
    const p = getProductById("ecoflow-delta-3-plus")!;
    expect(p.amazon_asin).toBe("B0DCC2BVFW");
    expect(p.amazon_listing_note).toBeNull();
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

  it("the confirmed V4 product bluetti-apex-300 now shows its real SiteStripe purchase link", () => {
    const p = getProductById("bluetti-apex-300")!;
    expect(p.amazon_verification_status).toBe("confirmed");
    expect(p.amazon_asin).toBe("B0F42JY551");
    expect(p.amazon_affiliate_url).toBe("https://amzn.to/4hljoVX");
    const link = resolveAmazonLink(p);
    expect(link.href).toBe("https://amzn.to/4hljoVX");
    expect(link.isAffiliate).toBe(true);
  });

  it("Milestone 4 V3 products are real and distinct; 3 of 4 now show their real SiteStripe purchase link, 1 still shows none", () => {
    for (const id of V3_IDS) {
      const p = getProductById(id);
      expect(p, `V3 product "${id}" should exist`).toBeDefined();
      expect(p!.amazon_asin).toMatch(/^[A-Z0-9]{10}$/);
      expect(p!.amazon_product_url).toBe(`https://www.amazon.com/dp/${p!.amazon_asin}`);
      expect(p!.official_source).toBeTruthy();
      expect(p!.last_verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const link = resolveAmazonLink(p!);
      if (V3_WITH_AFFILIATE_LINK_IDS.includes(id)) {
        expect(p!.amazon_affiliate_url).toBe(EXPECTED_V3_V4_AFFILIATE_LINKS[id]);
        expect(link.isAffiliate).toBe(true);
        expect(link.href).toBe(EXPECTED_V3_V4_AFFILIATE_LINKS[id]);
      } else {
        // anker-solix-c800-plus: no affiliate link has been generated yet —
        // must stay null, never fabricated. amazon_product_url is a
        // research/matching field only — the CTA never uses it.
        expect(p!.amazon_affiliate_url).toBeNull();
        expect(link.isAffiliate).toBe(false);
        expect(link.href).toBeNull();
      }
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

  it("shows no purchase link at all when a product has no affiliate link, even if amazon_product_url is populated", () => {
    const withoutAffiliate = { ...products[0], amazon_affiliate_url: null };
    const link = resolveAmazonLink(withoutAffiliate);
    expect(link.isAffiliate).toBe(false);
    expect(link.href).toBeNull();
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
