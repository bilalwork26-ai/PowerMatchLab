import { describe, expect, it } from "vitest";
import { HERO_TRUST, TOOLS, USE_CASES, TRUST } from "@/components/home/HomeSections";

/**
 * Regression guard for Issue #21: a React "duplicate key" warning traced to
 * USE_CASES having two entries with the same href ("/products"), used as
 * the .map() key. Two different marketing cards can legitimately point to
 * the same destination — the fix was giving each entry its own stable `id`
 * field, decoupled from `href`, and keying on that instead. This test
 * checks every homepage list-of-cards constant for duplicate values in
 * whichever field is actually used as its render key, so the same class of
 * bug can't silently return.
 */
describe("homepage list constants never contain a duplicate render key (Issue #21)", () => {
  function expectUnique<T extends string>(values: T[], label: string) {
    const seen = new Set<T>();
    const dupes: T[] = [];
    for (const v of values) {
      if (seen.has(v)) dupes.push(v);
      seen.add(v);
    }
    expect(dupes, `${label} has duplicate values: ${dupes.join(", ")}`).toEqual([]);
  }

  it("HERO_TRUST labels (key={label}) are unique", () => {
    expectUnique(HERO_TRUST.map((t) => t.label), "HERO_TRUST label");
  });

  it("TOOLS hrefs (key={href}) are unique", () => {
    expectUnique(TOOLS.map((t) => t.href), "TOOLS href");
  });

  it("USE_CASES ids (key={id}) are unique, even though hrefs may legitimately repeat", () => {
    expectUnique(USE_CASES.map((u) => u.id), "USE_CASES id");
    // Confirms the fix didn't accidentally also dedupe the (legitimately
    // shared) hrefs themselves — /products appearing twice is fine now that
    // it's no longer the key.
    const productsHrefCount = USE_CASES.filter((u) => u.href === "/products").length;
    expect(productsHrefCount).toBeGreaterThanOrEqual(2);
  });

  it("TRUST titles (key={title}) are unique", () => {
    expectUnique(TRUST.map((t) => t.title), "TRUST title");
  });
});

describe("homepage trust language (no absolute/unverified-testing claims)", () => {
  it("never claims 'unbiased' or bare 'verified specifications'", () => {
    const allText = JSON.stringify({ HERO_TRUST, TOOLS, USE_CASES, TRUST });
    expect(allText.toLowerCase()).not.toContain("unbiased");
    expect(allText).not.toMatch(/\bVerified specifications\b/);
  });
});
