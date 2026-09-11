import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/**
 * SITE.url (and therefore every canonical-host check in lib/indexnow.ts) is
 * a module-level singleton computed once from process.env.NEXT_PUBLIC_SITE_URL
 * — see tests/canonical-www-enforcement.test.ts for why exercising it
 * requires resetting the module registry and re-importing fresh under a
 * stubbed production env, rather than relying on whatever URL happens to be
 * configured in this environment (typically localhost in dev/test).
 */
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function importIndexNowAsProduction() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.powermatchlab.com");
  vi.stubEnv("NODE_ENV", "production");
  return import("@/lib/indexnow");
}

describe("IndexNow key: valid format, published verification file, no invented external credential", () => {
  it("the key matches IndexNow's required shape (8-128 hex chars)", async () => {
    const { INDEXNOW_KEY, isValidIndexNowKey } = await importIndexNowAsProduction();
    expect(isValidIndexNowKey(INDEXNOW_KEY)).toBe(true);
  });

  it("a malformed key is rejected", async () => {
    const { isValidIndexNowKey } = await importIndexNowAsProduction();
    expect(isValidIndexNowKey("too-short")).toBe(false);
    expect(isValidIndexNowKey("not-hex-chars-zzzzzzzz")).toBe(false);
    expect(isValidIndexNowKey("")).toBe(false);
  });

  it("the verification file public/<key>.txt exists and contains exactly the key, nothing else", async () => {
    const { INDEXNOW_KEY } = await importIndexNowAsProduction();
    const path = join(ROOT, "public", `${INDEXNOW_KEY}.txt`);
    const content = readFileSync(path, "utf8");
    expect(content).toBe(INDEXNOW_KEY);
  });

  it("indexNowKeyLocation points at the canonical www host, matching the published file", async () => {
    const { INDEXNOW_KEY, indexNowKeyLocation } = await importIndexNowAsProduction();
    expect(indexNowKeyLocation()).toBe(`https://www.powermatchlab.com/${INDEXNOW_KEY}.txt`);
  });

  it("the manual submission script's hardcoded key literal matches the library constant (can't silently drift)", async () => {
    const { INDEXNOW_KEY } = await importIndexNowAsProduction();
    const scriptSrc = readFileSync(join(ROOT, "scripts", "submit-indexnow.mjs"), "utf8");
    expect(scriptSrc).toContain(`const INDEXNOW_KEY = "${INDEXNOW_KEY}";`);
  });

  it("submits to the real IndexNow API endpoint, not a placeholder", async () => {
    const { INDEXNOW_ENDPOINT } = await importIndexNowAsProduction();
    expect(INDEXNOW_ENDPOINT).toBe("https://api.indexnow.org/indexnow");
  });
});

describe("isSubmittableUrl: only the canonical www host, https, absolute URLs", () => {
  it("accepts a real page URL on the canonical host", async () => {
    const { isSubmittableUrl } = await importIndexNowAsProduction();
    expect(isSubmittableUrl("https://www.powermatchlab.com/guides/watts-vs-watt-hours")).toBe(true);
  });

  it("rejects the bare apex domain (not the canonical www host)", async () => {
    const { isSubmittableUrl } = await importIndexNowAsProduction();
    expect(isSubmittableUrl("https://powermatchlab.com/guides/watts-vs-watt-hours")).toBe(false);
  });

  it("rejects http (non-https)", async () => {
    const { isSubmittableUrl } = await importIndexNowAsProduction();
    expect(isSubmittableUrl("http://www.powermatchlab.com/")).toBe(false);
  });

  it("rejects a completely different domain — this is the abuse-prevention case", async () => {
    const { isSubmittableUrl } = await importIndexNowAsProduction();
    expect(isSubmittableUrl("https://example.com/")).toBe(false);
    expect(isSubmittableUrl("https://evil.com/www.powermatchlab.com")).toBe(false);
  });

  it("rejects a relative path (not an absolute URL)", async () => {
    const { isSubmittableUrl } = await importIndexNowAsProduction();
    expect(isSubmittableUrl("/guides/watts-vs-watt-hours")).toBe(false);
  });

  it("rejects garbage input without throwing", async () => {
    const { isSubmittableUrl } = await importIndexNowAsProduction();
    expect(isSubmittableUrl("not a url at all")).toBe(false);
  });
});

describe("buildIndexNowPayload: correct shape, rejects unsubmittable input rather than silently filtering", () => {
  it("builds the exact JSON shape the IndexNow API expects", async () => {
    const { buildIndexNowPayload, INDEXNOW_KEY } = await importIndexNowAsProduction();
    const payload = buildIndexNowPayload(["https://www.powermatchlab.com/guides/watts-vs-watt-hours"]);
    expect(payload).toEqual({
      host: "www.powermatchlab.com",
      key: INDEXNOW_KEY,
      keyLocation: `https://www.powermatchlab.com/${INDEXNOW_KEY}.txt`,
      urlList: ["https://www.powermatchlab.com/guides/watts-vs-watt-hours"],
    });
  });

  it("throws on an empty list rather than submitting nothing silently", async () => {
    const { buildIndexNowPayload } = await importIndexNowAsProduction();
    expect(() => buildIndexNowPayload([])).toThrow();
  });

  it("throws when any URL is not submittable (external domain), rather than dropping it silently", async () => {
    const { buildIndexNowPayload } = await importIndexNowAsProduction();
    expect(() =>
      buildIndexNowPayload([
        "https://www.powermatchlab.com/guides/watts-vs-watt-hours",
        "https://example.com/steal-my-index-budget",
      ]),
    ).toThrow(/not submittable/);
  });
});
