import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPARISONS, getComparison } from "@/content/comparisons";
import { getProductsByIds } from "@/data/products";
import { pageMetadata, breadcrumbJsonLd, articleJsonLd } from "@/lib/seo";
import { earliestLastChecked } from "@/lib/comparisons";
import { BILAL_SIALI } from "@/lib/authors";
import { JsonLd } from "@/components/ui/JsonLd";
import { ModelComparisonPage } from "@/components/compare/ModelComparisonPage";

/**
 * Only the manually-curated slugs in `COMPARISONS` ever resolve — this is a
 * hand-picked editorial format, not an auto-generated combination of every
 * catalog pairing. `dynamicParams = false` makes any other slug 404 instead
 * of falling through to a dynamically rendered page.
 */
export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) {
    return pageMetadata({
      title: "Comparison not found",
      description: "",
      path: `/compare/${slug}`,
      noindex: true,
    });
  }
  return pageMetadata({
    // No manual "— PowerMatchLab" suffix here: the root layout's title
    // template (`%s · PowerMatchLab`) already appends the brand name once.
    title: comparison.h1,
    description: comparison.metaDescription,
    path: `/compare/${comparison.slug}`,
  });
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) notFound();

  const products = getProductsByIds(comparison.productIds);
  // Every curated comparison is either a 2-way or 3-way editorial page —
  // never a dynamically-sized combination of the catalog.
  if (products.length < 2 || products.length > 3) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: comparison.h1, path: `/compare/${comparison.slug}` },
  ];

  const lastChecked = earliestLastChecked(products);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          articleJsonLd({
            headline: comparison.h1,
            description: comparison.metaDescription,
            path: `/compare/${comparison.slug}`,
            datePublished: lastChecked ?? undefined,
            author: { name: BILAL_SIALI.name, path: BILAL_SIALI.path },
          }),
        ]}
      />
      <ModelComparisonPage comparison={comparison} products={products} />
    </>
  );
}
