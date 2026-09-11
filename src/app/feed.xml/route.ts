import { GUIDES } from "@/content/guides";
import { COMPARISONS } from "@/content/comparisons";
import { getProductsByIds } from "@/data/products";
import { SITE } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

/**
 * RSS 2.0 feed of PowerMatchLab's editorial content — guides and model
 * comparisons only. No product pages (those aren't editorial articles, and
 * churn as the catalog changes), no private/internal fields, canonical on
 * the www host like every other URL on the site.
 */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toUTCString();
}

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string; // ISO date
}

function buildItems(): FeedItem[] {
  const guideItems: FeedItem[] = GUIDES.map((g) => ({
    title: g.title,
    link: absoluteUrl(`/guides/${g.slug}`),
    description: g.metaDescription,
    pubDate: g.lastUpdated,
  }));

  const comparisonItems: FeedItem[] = COMPARISONS.map((c) => {
    const products = getProductsByIds(c.productIds);
    const dates = products
      .map((p) => p.last_verified)
      .filter((d): d is string => Boolean(d))
      .sort();
    return {
      title: c.h1,
      link: absoluteUrl(`/compare/${c.slug}`),
      description: c.metaDescription,
      pubDate: dates[0] ?? new Date().toISOString().slice(0, 10),
    };
  });

  return [...guideItems, ...comparisonItems].sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1));
}

export async function GET() {
  const items = buildItems();
  const now = new Date().toUTCString();

  const itemsXml = items
    .map(
      (item) => `  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${escapeXml(item.link)}</link>
    <guid isPermaLink="true">${escapeXml(item.link)}</guid>
    <description>${escapeXml(item.description)}</description>
    <pubDate>${toRfc822(item.pubDate)}</pubDate>
  </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(SITE.name)} — Guides &amp; Comparisons</title>
  <link>${escapeXml(SITE.url)}</link>
  <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
  <description>${escapeXml(
    "Plain-English guides to sizing, running and charging portable power stations, plus editorial model-to-model comparisons — from PowerMatchLab.",
  )}</description>
  <language>en-us</language>
  <lastBuildDate>${now}</lastBuildDate>
${itemsXml}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
