import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAllProducts } from "@/data/products";
import { resolveAmazonLink } from "@/lib/amazon";

const ROOT = process.cwd();
function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

/**
 * Definitive rule (corrected after an earlier round wrongly let a
 * "confirmed" product fall back to its plain amazon_product_url as a
 * clickable CTA): amazon_affiliate_url is the ONLY field any purchase CTA
 * may ever use. amazon_product_url/amazon_asin exist purely for
 * research/product-matching -- confirming which real Amazon listing a
 * catalog entry corresponds to -- and must never be rendered as a
 * clickable destination, regardless of amazon_verification_status.
 */
describe("resolveAmazonLink: amazon_product_url is never surfaced as a CTA href", () => {
  const products = getAllProducts();

  it("never returns amazon_product_url as href, for any of the 40 catalog products", () => {
    for (const p of products) {
      const link = resolveAmazonLink(p);
      if (p.amazon_product_url !== null) {
        expect(
          link.href,
          `${p.id}: href must never equal amazon_product_url`,
        ).not.toBe(p.amazon_product_url);
      }
    }
  });

  it("returns a non-null href only when amazon_affiliate_url is set, and it's always that exact value", () => {
    for (const p of products) {
      const link = resolveAmazonLink(p);
      if (p.amazon_affiliate_url === null) {
        expect(link.href, `${p.id}: no affiliate link -> no href, ever`).toBeNull();
      } else {
        expect(link.href).toBe(p.amazon_affiliate_url);
        expect(link.isAffiliate).toBe(true);
      }
    }
  });

  it("a confirmed product with no affiliate link yet (e.g. anker-solix-c800-plus) still gets no purchase link", () => {
    const p = products.find((x) => x.id === "anker-solix-c800-plus")!;
    expect(p.amazon_verification_status).toBe("confirmed");
    expect(p.amazon_affiliate_url).toBeNull();
    const link = resolveAmazonLink(p);
    expect(link.href).toBeNull();
  });

  it("a synthetic product proves the rule structurally: confirmed status + populated product_url still yields no href", () => {
    const link = resolveAmazonLink({
      // Minimal shape exercised by resolveAmazonLink -- only the fields it reads.
      amazon_affiliate_url: null,
      amazon_product_url: "https://www.amazon.com/dp/B0TESTUNIT",
      amazon_verification_status: "confirmed",
    } as never);
    expect(link.href).toBeNull();
  });
});

/** Strips /** block comments so doc-comment prose mentioning a field name (as documentation of what NOT to do) doesn't trip a "never references this field" check aimed at actual code. */
function stripBlockComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("AmazonCta / MobileBuyBar source never treats amazon_product_url as a CTA destination", () => {
  it("AmazonCta.tsx's actual code (outside doc comments) never accesses amazon_product_url", () => {
    const src = stripBlockComments(read("src/components/product/AmazonCta.tsx"));
    expect(src).not.toContain("amazon_product_url");
  });

  it("MobileBuyBar.tsx does not reference amazon_product_url at all", () => {
    const src = read("src/components/product/MobileBuyBar.tsx");
    expect(src).not.toContain("amazon_product_url");
  });

  it("resolveAmazonLink's implementation only reads amazon_affiliate_url, never amazon_product_url, to build href", () => {
    const src = read("src/lib/amazon.ts");
    // The function body itself (not the doc comment) must not reference
    // amazon_product_url when computing href.
    const fnBody = src.slice(src.indexOf("export function resolveAmazonLink"));
    expect(fnBody).not.toContain("amazon_product_url");
    expect(fnBody).toContain("amazon_affiliate_url");
  });
});

describe("Disclosure copy never claims a link is shown when none is", () => {
  it("AmazonCta's no-href copy does not mention a 'normal Amazon product link' (that state no longer produces a link)", () => {
    const src = read("src/components/product/AmazonCta.tsx");
    expect(src).not.toMatch(/normal Amazon product link/i);
    expect(src).not.toMatch(/affiliate tracking will be added later/i);
  });

  it("the guide template's summary copy does not claim non-affiliate products still have a purchase link", () => {
    const src = read("src/app/guides/[slug]/page.tsx");
    expect(src).not.toMatch(/normal Amazon product links? with no affiliate tracking/i);
  });
});
