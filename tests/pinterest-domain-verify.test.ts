import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Pinterest requires a site-ownership meta tag
 * (`<meta name="p:domain_verify" content="...">`) present in the raw HTML
 * of the homepage's <head>, reachable by its crawler without JavaScript or
 * cookie consent — the same requirement the existing Google AdSense
 * verification tag already satisfies via the root layout's Metadata API
 * `other` field, so this tag follows that identical, already-proven
 * mechanism rather than a new one.
 */
const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const LAYOUT_PATH = join(SRC_DIR, "app/layout.tsx");
const EXPECTED_CONTENT = "08e12e8703f4aff19fa13a58705211bc";

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("Pinterest domain verification meta tag", () => {
  it("the root layout declares p:domain_verify with the exact value Pinterest issued", () => {
    const src = read("src/app/layout.tsx");
    expect(src).toContain(`"p:domain_verify": "${EXPECTED_CONTENT}"`);
  });

  it("p:domain_verify is declared inside the metadata `other` field, not a standalone element", () => {
    const src = read("src/app/layout.tsx");
    const otherIdx = src.indexOf("other: {");
    const tagIdx = src.indexOf('"p:domain_verify"');
    expect(otherIdx).toBeGreaterThan(-1);
    expect(tagIdx).toBeGreaterThan(otherIdx);
  });

  it("p:domain_verify appears exactly once across the whole app (no duplicate tags)", () => {
    const files = walk(SRC_DIR);
    const offenders: { file: string; count: number }[] = [];
    let total = 0;
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      const matches = src.match(/p:domain_verify/g) ?? [];
      if (matches.length > 0) offenders.push({ file, count: matches.length });
      total += matches.length;
    }
    expect(total).toBe(1);
    expect(offenders).toEqual([{ file: LAYOUT_PATH, count: 1 }]);
  });

  it("the tag sits alongside the existing AdSense verification tag using the same mechanism", () => {
    const src = read("src/app/layout.tsx");
    const adsenseIdx = src.indexOf('"google-adsense-account"');
    const pinterestIdx = src.indexOf('"p:domain_verify"');
    expect(adsenseIdx).toBeGreaterThan(-1);
    expect(pinterestIdx).toBeGreaterThan(adsenseIdx);
  });
});
