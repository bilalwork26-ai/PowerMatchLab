import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.mjs";

/**
 * Regression guard for the apex-vs-www canonical host split (Search Console
 * was indexing both powermatchlab.com and www.powermatchlab.com as separate
 * URLs). www is the chosen canonical — it already matches the sitemap and
 * every <link rel="canonical"> (see src/lib/site.ts's SITE.url fallback).
 *
 * Next.js's own `redirects()` matching engine isn't unit-testable in this
 * project's node-only, jsdom-free test setup (it runs inside the actual
 * request pipeline). What we CAN and must test permanently is that the
 * declared rule's shape exactly encodes the required behavior — an exact
 * host match, the correct destination, and permanent status — plus a light
 * simulation of Next.js's documented catch-all + host-matcher semantics to
 * exercise the specific request scenarios below.
 */

interface HostRedirectRule {
  source: string;
  has?: { type: string; value?: string }[];
  destination: string;
  permanent?: boolean;
}

async function getRedirects(): Promise<HostRedirectRule[]> {
  const redirects = nextConfig.redirects;
  if (typeof redirects !== "function") {
    throw new Error("next.config.mjs must export an async redirects() function");
  }
  return redirects();
}

function findHostRedirectRule(rules: HostRedirectRule[]): HostRedirectRule {
  const rule = rules.find((r) => r.has?.some((h) => h.type === "host"));
  if (!rule) throw new Error("No redirect rule with a host matcher was found");
  return rule;
}

/**
 * Minimal, faithful re-implementation of Next.js's documented semantics for
 * exactly this rule shape: an exact `has: [{ type: "host", value }]` match,
 * combined with a `/:path*` catch-all `source`/`destination` pair. Not a
 * general-purpose path-to-regexp port — only what this one rule needs.
 * Returns the redirect target, or null when the rule does not apply.
 */
function simulateRedirect(
  rule: HostRedirectRule,
  requestHost: string,
  requestPathAndQuery: string,
): string | null {
  const hostMatcher = rule.has?.find((h) => h.type === "host");
  if (!hostMatcher) return null;
  if (requestHost !== hostMatcher.value) return null; // exact match only

  const [path, query] = requestPathAndQuery.split(/\?(.*)/s);
  if (!rule.source.endsWith(":path*") || !rule.destination.endsWith(":path*")) {
    throw new Error("Simulation only supports a trailing :path* catch-all");
  }
  const destinationBase = rule.destination.replace(":path*", "");
  const capturedPath = path.replace(/^\//, ""); // strip leading slash, :path* excludes it
  const redirectedUrl = destinationBase + capturedPath;
  // Next.js forwards the original query string automatically when the
  // destination doesn't declare its own.
  return query ? `${redirectedUrl}?${query}` : redirectedUrl;
}

describe("canonical host redirect: rule shape", () => {
  it("declares an exact-match host redirect from the bare apex domain to www", async () => {
    const rule = findHostRedirectRule(await getRedirects());
    expect(rule.has).toEqual([{ type: "host", value: "powermatchlab.com" }]);
    expect(rule.destination).toBe("https://www.powermatchlab.com/:path*");
    expect(rule.source).toBe("/:path*");
  });

  it("is permanent", async () => {
    const rule = findHostRedirectRule(await getRedirects());
    expect(rule.permanent).toBe(true);
  });

  it("the matched host value is never the www host itself (the actual anti-loop invariant)", async () => {
    const rule = findHostRedirectRule(await getRedirects());
    const matchedHost = rule.has!.find((h) => h.type === "host")!.value;
    const destinationHost = new URL(rule.destination.replace(":path*", "")).host;
    expect(matchedHost).not.toBe(destinationHost);
    expect(matchedHost).not.toMatch(/^www\./);
  });

  it("the pre-existing delta-3 redirect is untouched and still present", async () => {
    const rules = await getRedirects();
    const deltaRule = rules.find((r) => r.source === "/products/ecoflow-delta-3");
    expect(deltaRule).toEqual({
      source: "/products/ecoflow-delta-3",
      destination: "/products/ecoflow-delta-3-classic",
      permanent: true,
    });
  });

  it("the host redirect is declared before the delta-3 redirect (evaluation order matters)", async () => {
    const rules = await getRedirects();
    const hostIndex = rules.findIndex((r) => r.has?.some((h) => h.type === "host"));
    const deltaIndex = rules.findIndex((r) => r.source === "/products/ecoflow-delta-3");
    // Otherwise a request to the apex domain for exactly that one path would
    // match the unconditional delta-3 rule first and redirect via a
    // host-relative destination, staying on the apex domain instead of
    // reaching www.
    expect(hostIndex).toBeLessThan(deltaIndex);
  });

  it("only one rule carries a host matcher (no duplicate/competing host rules)", async () => {
    const rules = await getRedirects();
    const hostRules = rules.filter((r) => r.has?.some((h) => h.type === "host"));
    expect(hostRules).toHaveLength(1);
  });
});

describe("canonical host redirect: simulated request scenarios", () => {
  it("bare domain root redirects to the www root", async () => {
    const rule = findHostRedirectRule(await getRedirects());
    expect(simulateRedirect(rule, "powermatchlab.com", "/")).toBe(
      "https://www.powermatchlab.com/",
    );
  });

  it("an inner path is preserved exactly", async () => {
    const rule = findHostRedirectRule(await getRedirects());
    expect(
      simulateRedirect(rule, "powermatchlab.com", "/guides/power-station-for-refrigerator"),
    ).toBe("https://www.powermatchlab.com/guides/power-station-for-refrigerator");
  });

  it("a nested path with a query string preserves both the path and the query", async () => {
    const rule = findHostRedirectRule(await getRedirects());
    expect(
      simulateRedirect(
        rule,
        "powermatchlab.com",
        "/compare?ids=ecoflow-delta-3-classic,anker-solix-c1000-gen-2",
      ),
    ).toBe(
      "https://www.powermatchlab.com/compare?ids=ecoflow-delta-3-classic,anker-solix-c1000-gen-2",
    );
  });

  it("a request already on www is never redirected by this rule", async () => {
    const rule = findHostRedirectRule(await getRedirects());
    expect(simulateRedirect(rule, "www.powermatchlab.com", "/")).toBeNull();
    expect(simulateRedirect(rule, "www.powermatchlab.com", "/products")).toBeNull();
  });

  it("an unrelated host is never redirected by this rule", async () => {
    const rule = findHostRedirectRule(await getRedirects());
    expect(simulateRedirect(rule, "example.com", "/")).toBeNull();
    expect(simulateRedirect(rule, "sub.powermatchlab.com", "/")).toBeNull();
  });

  it("re-applying the rule to its own destination host produces no further redirect (no loop)", async () => {
    const rule = findHostRedirectRule(await getRedirects());
    const first = simulateRedirect(rule, "powermatchlab.com", "/products");
    expect(first).toBe("https://www.powermatchlab.com/products");
    const destinationHost = new URL(first!).host;
    const second = simulateRedirect(rule, destinationHost, "/products");
    expect(second).toBeNull();
  });
});
