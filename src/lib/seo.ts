import type { Metadata } from "next";
import { SITE } from "./site";
import type { Product } from "@/types/product";
import { productDisplayName } from "@/data/products";

/** Build a canonical absolute URL for a path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Set to true to keep a route out of search indexes. */
  noindex?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  noindex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description,
      url,
      locale: SITE.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD structured data. We NEVER emit ratings, reviewCount or price/offers
// unless the data is genuinely verified in `products.json` (currently none is).
// ---------------------------------------------------------------------------

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    slogan: SITE.tagline,
    description: SITE.description,
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "en-US",
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function productJsonLd(product: Product) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productDisplayName(product),
    brand: { "@type": "Brand", name: product.brand },
    category: "Portable Power Station",
    url: absoluteUrl(`/products/${product.id}`),
  };
  if (product.amazon_asin) node.sku = product.amazon_asin;
  if (product.model) node.model = product.model;
  // No `offers`, `aggregateRating` or `review`: those values are not verified.
  return node;
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
