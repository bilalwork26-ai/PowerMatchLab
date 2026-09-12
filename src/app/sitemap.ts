import type { MetadataRoute } from "next";
import { getAllProducts } from "@/data/products";
import { GUIDES } from "@/content/guides";
import { BEST_FOR } from "@/content/best-for";
import { COMPARISONS } from "@/content/comparisons";
import { TOOLS } from "@/content/tools";
import { getProductsByIds } from "@/data/products";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    "/",
    "/products",
    "/compare",
    "/power-calculator",
    "/power-setup-studio",
    "/tools",
    "/guides",
    "/research/portable-power-station-specs-2026",
    "/authors/bilal-siali",
    "/about-methodology",
    "/editorial-policy",
    "/contact",
    "/affiliate-disclosure",
    "/privacy-policy",
    "/terms",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  for (const b of BEST_FOR) {
    entries.push({
      url: absoluteUrl(`/${b.slug}`),
      lastModified: new Date(`${b.lastUpdated}T00:00:00Z`),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const t of TOOLS) {
    entries.push({
      url: absoluteUrl(`/tools/${t.slug}`),
      lastModified: new Date(`${t.lastUpdated}T00:00:00Z`),
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  for (const g of GUIDES) {
    entries.push({
      url: absoluteUrl(`/guides/${g.slug}`),
      lastModified: new Date(`${g.lastUpdated}T00:00:00Z`),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const c of COMPARISONS) {
    const products = getProductsByIds(c.productIds);
    const dates = products
      .map((p) => p.last_verified)
      .filter((d): d is string => Boolean(d))
      .sort();
    entries.push({
      url: absoluteUrl(`/compare/${c.slug}`),
      lastModified: dates.length ? new Date(`${dates[0]}T00:00:00Z`) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const p of getAllProducts()) {
    entries.push({
      url: absoluteUrl(`/products/${p.id}`),
      lastModified: p.last_verified
        ? new Date(`${p.last_verified}T00:00:00Z`)
        : now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
