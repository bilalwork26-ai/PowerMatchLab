import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getAllProducts,
  getBrands,
  getChemistries,
  getUseCaseTags,
} from "@/data/products";
import { scoreCatalog, type ProductScore } from "@/lib/score";
import { pageMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { productDisplayName } from "@/data/products";
import { PageHero } from "@/components/layout/PageHero";
import { ProductsBrowser } from "@/components/product/ProductsBrowser";
import { JsonLd } from "@/components/ui/JsonLd";

// "Power Stations Catalog" tested no clicks across 10 impressions at an
// average position of 5.9 — a generic, self-referential title with no
// value proposition. Naming the real, current catalog size gives a
// searcher a concrete reason to click; computed from the catalog itself so
// it can never drift out of sync as products are added or removed.
const PRODUCT_COUNT = getAllProducts().length;

export const metadata: Metadata = pageMetadata({
  title: `Portable Power Station Catalog: Compare ${PRODUCT_COUNT} Models by Spec`,
  description:
    "Browse and filter every portable power station in the PowerMatchLab catalog by brand, capacity, output, chemistry, weight, solar input, 240V, TT-30 and more.",
  path: "/products",
});

export default function ProductsPage() {
  const products = getAllProducts();
  const scoreMap = scoreCatalog(products);
  const scores: Record<string, ProductScore> = Object.fromEntries(scoreMap);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
          ]),
          itemListJsonLd(
            products.map((p) => ({
              name: productDisplayName(p),
              path: `/products/${p.id}`,
            })),
          ),
        ]}
      />
      <PageHero
        title="Power Stations Catalog"
        lead="Every portable power station we track, with the specs manufacturers publish. Filters only act on data we have actually verified — an unverified field never counts as a yes or a no."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ]}
      />
      <Suspense fallback={null}>
        <ProductsBrowser
          products={products}
          scores={scores}
          brands={getBrands()}
          chemistries={getChemistries()}
          useCaseTags={getUseCaseTags()}
        />
      </Suspense>
    </>
  );
}
