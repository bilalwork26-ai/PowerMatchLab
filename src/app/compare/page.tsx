import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProducts } from "@/data/products";
import { scoreCatalog, type ProductScore } from "@/lib/score";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { CompareView } from "@/components/compare/CompareView";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Compare Power Stations",
  description:
    "Compare up to four portable power stations side by side: capacity, output, ports, charging, weight and PowerMatchLab's editorial score. No fabricated numbers — unverified fields stay blank.",
  path: "/compare",
});

export default function ComparePage() {
  const catalog = getAllProducts();
  const scores: Record<string, ProductScore> = Object.fromEntries(
    scoreCatalog(catalog),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ])}
      />
      <PageHero
        title="Compare Power Stations"
        lead="See models side by side and check which one actually fits your needs. Highlighted cells hold the best verified value in that row."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ]}
      />
      <Suspense
        fallback={
          <div className="container-page py-12 text-sm text-navy-500">
            Loading comparison…
          </div>
        }
      >
        <CompareView catalog={catalog} scores={scores} />
      </Suspense>
    </>
  );
}
