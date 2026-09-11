import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getAllProducts } from "@/data/products";
import { getIllustrationPath } from "@/lib/illustrations";

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
});
