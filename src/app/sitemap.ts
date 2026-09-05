import type { MetadataRoute } from "next";
import { getAllProducts } from "@/data/products";
import { GUIDES } from "@/content/guides";
import { BEST_FOR } from "@/content/best-for";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    "/",
    "/products",
    "/compare",
    "/power-calculator",
    "/power-setup-studio",
    "/guides",
    "/deals",
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

  for (const g of GUIDES) {
    entries.push({
      url: absoluteUrl(`/guides/${g.slug}`),
      lastModified: new Date(`${g.lastUpdated}T00:00:00Z`),
      changeFrequency: "monthly",
      priority: 0.6,
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
