import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GUIDES } from "@/content/guides";
import { COMPARISONS } from "@/content/comparisons";

const ROOT = process.cwd();

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function fetchFeedXmlAsProduction(): Promise<string> {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.powermatchlab.com");
  vi.stubEnv("NODE_ENV", "production");
  const { GET } = await import("@/app/feed.xml/route");
  const res = await GET();
  return res.text();
}

describe("RSS feed: valid XML, editorial content only, canonical www links", () => {
  it("is well-formed RSS 2.0 with the required channel elements", async () => {
    const xml = await fetchFeedXmlAsProduction();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<rss version=\"2.0\"");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("<title>");
    expect(xml).toContain("<link>https://www.powermatchlab.com</link>");
    expect(xml).toContain("</channel>");
    expect(xml).toContain("</rss>");
  });

  it("carries exactly one <item> per guide plus one per comparison — no product pages, no duplicates", async () => {
    const xml = await fetchFeedXmlAsProduction();
    const itemCount = (xml.match(/<item>/g) ?? []).length;
    expect(itemCount).toBe(GUIDES.length + COMPARISONS.length);
  });

  it("every item link is an absolute URL on the canonical www host", async () => {
    const xml = await fetchFeedXmlAsProduction();
    const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]);
    // First <link> belongs to the channel itself; every item link follows the same rule.
    for (const link of links) {
      expect(link.startsWith("https://www.powermatchlab.com/") || link === "https://www.powermatchlab.com").toBe(
        true,
      );
    }
  });

  it("includes a self-referencing atom:link for feed-reader autodiscovery", async () => {
    const xml = await fetchFeedXmlAsProduction();
    expect(xml).toContain('rel="self"');
    expect(xml).toContain("application/rss+xml");
  });

  it("contains no amazon.com URL, affiliate tag, or ASIN anywhere in the feed", async () => {
    const xml = await fetchFeedXmlAsProduction();
    expect(xml).not.toMatch(/amazon\.com/i);
    expect(xml).not.toMatch(/amzn\.to/i);
    expect(xml).not.toMatch(/tag=powermatchlab/i);
  });

  it("special characters in titles/descriptions are XML-escaped, not raw", async () => {
    const xml = await fetchFeedXmlAsProduction();
    // Every guide/comparison title or description containing a bare ampersand
    // must appear escaped, not as a raw "&" that would break XML parsing.
    const rawAmpersands = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;)/g) ?? [];
    expect(rawAmpersands).toEqual([]);
  });

  it("is served with an RSS content type", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.powermatchlab.com");
    vi.stubEnv("NODE_ENV", "production");
    const { GET } = await import("@/app/feed.xml/route");
    const res = await GET();
    expect(res.headers.get("Content-Type")).toContain("application/rss+xml");
  });
});

describe("RSS discovery: linked from <head> and the footer", () => {
  it("the root layout declares an RSS alternate link via the Metadata API", () => {
    const src = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
    expect(src).toContain("application/rss+xml");
    expect(src).toContain('absoluteUrl("/feed.xml")');
  });

  it("the footer links to /feed.xml", () => {
    const src = readFileSync(join(ROOT, "src/components/layout/Footer.tsx"), "utf8");
    expect(src).toContain('href="/feed.xml"');
  });
});
