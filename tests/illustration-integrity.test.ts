import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getAllProducts, getProductById } from "@/data/products";
import {
  getIllustrationAlt,
  getIllustrationCaption,
  getIllustrationPath,
  isEditorialIllustration,
  isPlaceholderIllustration,
} from "@/lib/illustrations";

const ROOT = process.cwd();

/** Minimal PNG IHDR reader: width/height live at fixed byte offsets right after the signature. */
function readPngDimensions(filePath: string): { width: number; height: number } {
  const buf = readFileSync(filePath);
  const signature = buf.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`${filePath} is not a valid PNG (bad signature)`);
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

describe("every catalog product's illustration path resolves to a real, valid file", () => {
  const products = getAllProducts();

  it("the catalog is non-empty (sanity check for this test itself)", () => {
    expect(products.length).toBeGreaterThan(0);
  });

  for (const product of products) {
    it(`${product.id}: image exists, is non-empty, and has valid PNG dimensions`, () => {
      const path = getIllustrationPath(product);
      expect(path).toMatch(/^\/illustrations\/[a-z0-9-]+\.png$/);

      const absolute = join(ROOT, "public", path);
      expect(existsSync(absolute), `missing file for ${product.id}: ${path}`).toBe(true);

      const stats = statSync(absolute);
      expect(stats.size, `${path} is empty`).toBeGreaterThan(0);

      const { width, height } = readPngDimensions(absolute);
      expect(width, `${path} has invalid width`).toBeGreaterThan(0);
      expect(height, `${path} has invalid height`).toBeGreaterThan(0);
    });
  }

  it("no two different products point at the same specific illustration file (unless the path is explicitly a shared generic resource under /illustrations/generic-)", () => {
    const pathToIds = new Map<string, string[]>();
    for (const product of products) {
      const path = getIllustrationPath(product);
      if (!pathToIds.has(path)) pathToIds.set(path, []);
      pathToIds.get(path)!.push(product.id);
    }
    for (const [path, ids] of pathToIds) {
      if (ids.length > 1 && !path.startsWith("/illustrations/generic-")) {
        throw new Error(
          `${path} is used by ${ids.length} different products (${ids.join(
            ", ",
          )}) but is not declared as a shared generic resource (/illustrations/generic-*). Every product must have its own dedicated illustration.`,
        );
      }
    }
  });

  it("every illustration path is exactly /illustrations/<product-id>.png — one file per product id, nothing shared implicitly", () => {
    for (const product of products) {
      expect(getIllustrationPath(product)).toBe(`/illustrations/${product.id}.png`);
    }
  });

  it("no two products' illustration files are byte-identical, even under different filenames", () => {
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

/**
 * Regression coverage for the 2026-09-11 editorial-illustration integration:
 * the 17 products that briefly used a generated "ILLUSTRATIVE PLACEHOLDER"
 * card now have a real, brand/model-specific illustration supplied by the
 * site owner. These tests fail loudly if a placeholder ever reappears —
 * for any product, not just these 17 — or if the editorial set drifts from
 * what was actually delivered.
 */
describe("editorial illustrations replace every placeholder (2026-09-11 integration)", () => {
  const products = getAllProducts();

  const EXPECTED_EDITORIAL_IDS = [
    "anker-solix-c800x",
    "bluetti-ac70",
    "bluetti-apex-300",
    "bluetti-elite-100-v2",
    "dji-power-1000-v2",
    "dji-power-2000",
    "dji-power-500",
    "ecoflow-delta-3-plus",
    "ecoflow-delta-pro-ultra",
    "ecoflow-river-3-plus",
    "goal-zero-yeti-1500-6th-gen",
    "growatt-helios-3600",
    "jackery-explorer-300-plus",
    "jackery-explorer-3000-v2",
    "jackery-explorer-500-v2",
    "jackery-explorer-5000-plus",
    "mango-power-e",
  ];

  it("no product in the current catalog is flagged as a placeholder", () => {
    for (const product of products) {
      expect(
        isPlaceholderIllustration(product),
        `${product.id} is still flagged as a placeholder`,
      ).toBe(false);
    }
  });

  it("no product's alt text or caption ever mentions a placeholder", () => {
    for (const product of products) {
      expect(getIllustrationAlt(product)).not.toMatch(/placeholder/i);
      expect(getIllustrationCaption(product)).not.toMatch(/placeholder/i);
    }
  });

  it("exactly the 17 expected products are flagged as editorial illustrations, each with the right alt text and caption", () => {
    for (const id of EXPECTED_EDITORIAL_IDS) {
      const product = getProductById(id);
      expect(product, `${id} should exist in the catalog`).toBeDefined();
      expect(isEditorialIllustration(product!), `${id} should be an editorial illustration`).toBe(
        true,
      );
      expect(getIllustrationAlt(product!)).toBe(
        `Independent editorial illustration of the ${product!.brand} ${product!.model} — not an official manufacturer photograph.`,
      );
      expect(getIllustrationCaption(product!)).toBe(
        "Independent editorial illustration — not an official product photo.",
      );
    }
    // No product outside this list is (incorrectly) flagged as editorial.
    for (const product of products) {
      if (!EXPECTED_EDITORIAL_IDS.includes(product.id)) {
        expect(
          isEditorialIllustration(product),
          `${product.id} should not be flagged as an editorial illustration`,
        ).toBe(false);
      }
    }
  });

  it("every editorial illustration file is a real, non-trivial PNG (not a tiny stub)", () => {
    for (const id of EXPECTED_EDITORIAL_IDS) {
      const absolute = join(ROOT, "public", "illustrations", `${id}.png`);
      const stats = statSync(absolute);
      // The generated placeholder cards were tens of KB; the real editorial
      // illustrations are all well over 1MB. 100KB is a generous floor that
      // would catch an accidental placeholder-sized file slipping back in.
      expect(stats.size, `${id}.png looks too small to be a real illustration`).toBeGreaterThan(
        100_000,
      );
    }
  });
});
