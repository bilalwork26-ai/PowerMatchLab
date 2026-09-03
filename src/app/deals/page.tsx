import type { Metadata } from "next";
import Link from "next/link";
import { getActiveDeals } from "@/lib/deals";
import { getProductById, productDisplayName } from "@/data/products";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Callout } from "@/components/ui/Callout";
import { JsonLd } from "@/components/ui/JsonLd";
import { AmazonCta } from "@/components/product/AmazonCta";

export const metadata: Metadata = pageMetadata({
  title: "Deals",
  description:
    "Verified price drops on portable power stations. PowerMatchLab never shows fake discounts, countdown timers or stock warnings — if nothing is verified, this page says so.",
  path: "/deals",
});

export default function DealsPage() {
  const deals = getActiveDeals();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Deals", path: "/deals" },
        ])}
      />
      <PageHero
        title="Deals"
        lead="When we can verify a genuine price drop against the retailer, it appears here with the date we checked and a link to the source."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Deals", path: "/deals" },
        ]}
      />

      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page">
        {deals.length === 0 ? (
          <Callout tone="neutral" dark title="No verified deals right now">
            <p>
              PowerMatchLab is not currently tracking any verified deals. We do
              not publish invented discounts, crossed-out “was” prices,
              percentages, countdown timers, or “only 2 left” warnings.
            </p>
            <p className="mt-2">
              In the meantime, open any product and use{" "}
              <strong>Check Price on Amazon</strong> to see the current price
              directly on Amazon, or start with the{" "}
              <Link href="/power-calculator" className="underline">
                Power Calculator
              </Link>{" "}
              to find the right unit first.
            </p>
          </Callout>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {deals.map((deal) => {
              const product = getProductById(deal.productId);
              if (!product) return null;
              return (
                <li
                  key={deal.productId}
                  className="rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4 shadow-glow-soft"
                >
                  <h2 className="text-base font-semibold text-white">
                    <Link
                      href={`/products/${product.id}`}
                      className="hover:text-cyan-300"
                    >
                      {productDisplayName(product)}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-navy-200">{deal.summary}</p>
                  <p className="mt-2 text-xs text-navy-400">
                    Verified {deal.verifiedOn}
                    {deal.endsOn ? ` · known to end ${deal.endsOn}` : ""} ·{" "}
                    <a
                      href={deal.sourceUrl}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="underline"
                    >
                      source
                    </a>
                  </p>
                  <div className="mt-3">
                    <AmazonCta product={product} size="sm" withDisclosure={false} tone="dark" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-8 rounded-lg border border-navy-700 bg-navy-900/60 p-4 text-xs text-navy-300">
          <p className="font-semibold text-white">How the Deals page works</p>
          <p className="mt-1">
            A deal is only listed after a human confirms the current price at the
            retailer. Each entry stores the product, a plain description of what
            changed, the date it was checked, an optional known end date, and the
            source URL. Nothing on this page is generated automatically or
            estimated.
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
