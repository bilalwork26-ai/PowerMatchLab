import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Regression guard: these exact phrases were flagged as overclaiming
// independent verification, physical testing, or a linked manufacturer
// source that does not exist (all 22 catalog products only carry a brand
// label in `official_source`, never a URL). If any of these strings
// reappear anywhere under src/, this test fails.
const FORBIDDEN = [
  "verified manufacturer specification",
  "Verified data",
  "tied to the official source",
  "tied to an official source",
  "cite to an official source",
];

const SRC_DIR = join(process.cwd(), "src");

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

const files = walk(SRC_DIR);
const contents = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));

describe("trust language: forbidden phrases never regress", () => {
  it.each(FORBIDDEN)("no file under src/ contains %j", (phrase) => {
    const offenders = files.filter((f) => contents.get(f)!.includes(phrase));
    expect(offenders, `found in: ${offenders.join(", ")}`).toEqual([]);
  });
});
