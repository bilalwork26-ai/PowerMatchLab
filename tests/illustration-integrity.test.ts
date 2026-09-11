import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";
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

/**
 * Minimal self-contained PNG decoder for 8-bit, non-interlaced RGBA
 * (colorType 6) images — enough to inspect the real alpha channel of the
 * editorial illustrations without depending on an optional/transitive
 * package (`sharp` is only an optional dependency of `next` and isn't
 * guaranteed to be installed in every environment this suite runs in).
 * Implements the PNG scanline defilter (None/Sub/Up/Average/Paeth) per the
 * PNG spec; unsupported formats (different bit depth/color type/interlace)
 * throw rather than silently returning wrong data.
 */
function decodePngRgba(filePath: string): { width: number; height: number; pixels: Buffer } {
  const buf = readFileSync(filePath);
  if (buf.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${filePath} is not a valid PNG (bad signature)`);
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf.readUInt8(24);
  const colorType = buf.readUInt8(25);
  const interlace = buf.readUInt8(28);
  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error(
      `${filePath}: unsupported PNG format for this test's decoder (bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlace}) — expected 8-bit non-interlaced RGBA`,
    );
  }

  const idatChunks: Buffer[] = [];
  let offset = 8;
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === "IDAT") idatChunks.push(data);
    offset += 8 + len + 4;
    if (type === "IEND") break;
  }
  const raw = inflateSync(Buffer.concat(idatChunks));

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const pixels = Buffer.alloc(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filterType = raw[pos];
    pos += 1;
    const scanline = raw.subarray(pos, pos + stride);
    pos += stride;
    const prevRowStart = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bytesPerPixel ? pixels[y * stride + x - bytesPerPixel] : 0;
      const b = y > 0 ? pixels[prevRowStart + x] : 0;
      const c = y > 0 && x >= bytesPerPixel ? pixels[prevRowStart + x - bytesPerPixel] : 0;
      let value = scanline[x];
      switch (filterType) {
        case 0:
          break;
        case 1:
          value = (value + a) & 0xff;
          break;
        case 2:
          value = (value + b) & 0xff;
          break;
        case 3:
          value = (value + Math.floor((a + b) / 2)) & 0xff;
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          value = (value + pred) & 0xff;
          break;
        }
        default:
          throw new Error(`${filePath}: unsupported PNG filter type ${filterType}`);
      }
      pixels[y * stride + x] = value;
    }
  }
  return { width, height, pixels };
}

/** Alpha-channel summary used to distinguish real transparency from a flat opaque image. */
function alphaStats(filePath: string): {
  min: number;
  max: number;
  transparentFraction: number;
  opaqueFraction: number;
} {
  const { width, height, pixels } = decodePngRgba(filePath);
  const total = width * height;
  let min = 255;
  let max = 0;
  let transparent = 0;
  let opaque = 0;
  for (let i = 3; i < pixels.length; i += 4) {
    const a = pixels[i];
    if (a < min) min = a;
    if (a > max) max = a;
    if (a === 0) transparent++;
    if (a === 255) opaque++;
  }
  return { min, max, transparentFraction: transparent / total, opaqueFraction: opaque / total };
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

/**
 * Regression coverage for the 2026-09-11 transparency fix: the 17 editorial
 * illustrations originally arrived as opaque RGB PNGs with a visible light
 * studio background baked in, which rendered as a light rectangular box
 * inside PowerMatchLab's dark product cards. Every one of the 17 files was
 * reprocessed to carry a real alpha channel (matching the palette-based
 * transparency the site's original V1/V2 renders already use) with the
 * light background removed. These tests decode each file's actual pixel
 * data — not just its declared color type — so a future edit that
 * flattens one of these files back onto an opaque background fails loudly.
 */
describe("editorial illustrations use real transparency, not a flattened background (2026-09-11 fix)", () => {
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

  for (const id of EXPECTED_EDITORIAL_IDS) {
    it(`${id}.png decodes as 8-bit RGBA with a genuinely transparent background`, () => {
      const absolute = join(ROOT, "public", "illustrations", `${id}.png`);
      const { min, max, transparentFraction, opaqueFraction } = alphaStats(absolute);

      // A fully-opaque flattened image (the bug being regression-tested)
      // has alpha === 255 everywhere, i.e. min === 255 and
      // transparentFraction === 0. Requiring a real chunk of fully
      // transparent pixels (not just a few anti-aliased edge pixels)
      // confirms the studio background was actually cut out, not merely
      // that the file carries an unused alpha channel.
      expect(min, `${id}.png has no fully transparent pixels — background was not removed`).toBe(
        0,
      );
      expect(
        transparentFraction,
        `${id}.png is only ${(transparentFraction * 100).toFixed(1)}% transparent — background removal looks incomplete`,
      ).toBeGreaterThan(0.15);

      // The product itself should still render as solid, opaque artwork —
      // this rules out an over-aggressive matte that leaves the whole
      // image semi-transparent (a "patchy" or washed-out result).
      expect(max, `${id}.png has no fully opaque pixels — the product itself looks washed out`).toBe(
        255,
      );
      expect(
        opaqueFraction,
        `${id}.png is only ${(opaqueFraction * 100).toFixed(1)}% opaque — the product doesn't render as solid artwork`,
      ).toBeGreaterThan(0.15);
    });
  }
});
