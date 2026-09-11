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

export const metadata: Metadata = pageMetadata({
  title: "Power Stations Catalog",
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
