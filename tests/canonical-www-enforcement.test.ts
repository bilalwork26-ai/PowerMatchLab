import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Regression guard for a real production incident: Hostinger's
 * NEXT_PUBLIC_SITE_URL was configured to the bare apex domain
 * (https://powermatchlab.com), which the redirect in next.config.mjs
 * correctly sends visitors away from — but SITE.url (and therefore every
 * canonical tag, the sitemap, OG/Twitter metadata and JSON-LD) is computed
 * from that same env var, so the *served* page still advertised a
 * non-`www` canonical even though it was reached at `www`.
 *
 * SITE.url is a module-level singleton computed once at import time from
 * process.env.NEXT_PUBLIC_SITE_URL, so exercising different env values
 * requires resetting the module registry and re-importing fresh for each
 * case — a plain top-level `import` would only ever see whichever value
 * happened to be set when the test file first loaded. `vi.stubEnv` (rather
 * than assigning process.env.NODE_ENV directly) both sidesteps NODE_ENV's
 * read-only type and is restored automatically.
 */

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function resolveSiteUrlWith(
  envValue: string | undefined,
  nodeEnv: string = "production",
): Promise<string> {
  vi.resetModules();
  if (envValue === undefined) vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  else vi.stubEnv("NEXT_PUBLIC_SITE_URL", envValue);
  vi.stubEnv("NODE_ENV", nodeEnv);
  const { SITE } = await import("@/lib/site");
  return SITE.url;
}

describe("SITE.url: a misconfigured apex-domain env var is corrected to www", () => {
  it("the exact incident: NEXT_PUBLIC_SITE_URL=https://powermatchlab.com resolves to www", async () => {
    expect(await resolveSiteUrlWith("https://powermatchlab.com")).toBe(
      "https://www.powermatchlab.com",
    );
  });

  it("also fixes an http (non-https) apex value", async () => {
    expect(await resolveSiteUrlWith("http://powermatchlab.com")).toBe(
      "https://www.powermatchlab.com",
    );
  });

  it("strips a trailing slash on the apex value while still fixing the host", async () => {
    expect(await resolveSiteUrlWith("https://powermatchlab.com/")).toBe(
      "https://www.powermatchlab.com",
    );
  });

  it("is case-insensitive on the apex hostname", async () => {
    expect(await resolveSiteUrlWith("https://PowerMatchLab.com")).toBe(
      "https://www.powermatchlab.com",
    );
  });

  it("leaves an already-correct www value untouched", async () => {
    expect(await resolveSiteUrlWith("https://www.powermatchlab.com")).toBe(
      "https://www.powermatchlab.com",
    );
  });

  it("never rewrites a genuinely different domain (e.g. a staging URL)", async () => {
    expect(await resolveSiteUrlWith("https://staging.example.com")).toBe(
      "https://staging.example.com",
    );
  });

  it("a malformed env value (no protocol) is rejected, not passed through broken", async () => {
    // No scheme, so `new URL()` throws — must fall back rather than emit a broken base URL.
    expect(await resolveSiteUrlWith("powermatchlab.com", "production")).toBe(
      "https://www.powermatchlab.com",
    );
  });

  it("an unset env var still falls back to the www production URL in production", async () => {
    expect(await resolveSiteUrlWith(undefined, "production")).toBe(
      "https://www.powermatchlab.com",
    );
  });

  it("an unset env var falls back to localhost outside production", async () => {
    expect(await resolveSiteUrlWith(undefined, "test")).toBe("http://localhost:3000");
  });
});

describe("Every consumer of SITE.url inherits the corrected host", () => {
  async function absoluteUrlWith(envValue: string, path: string): Promise<string> {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", envValue);
    vi.stubEnv("NODE_ENV", "production");
    const { absoluteUrl } = await import("@/lib/seo");
    return absoluteUrl(path);
  }

  it("absoluteUrl() — which canonical tags, OG/Twitter and JSON-LD all call — uses www even when configured to the apex", async () => {
    expect(await absoluteUrlWith("https://powermatchlab.com", "/compare")).toBe(
      "https://www.powermatchlab.com/compare",
    );
  });

  it("metadataBase (root layout) is built from the same corrected SITE.url", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://powermatchlab.com");
    vi.stubEnv("NODE_ENV", "production");
    const { SITE } = await import("@/lib/site");
    expect(new URL(SITE.url).host).toBe("www.powermatchlab.com");
  });
});
