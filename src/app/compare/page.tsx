import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAllProducts } from "@/data/products";
import { scoreCatalog, type ProductScore } from "@/lib/score";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { COMPARISONS } from "@/content/comparisons";
import { groupComparisonsForIndex } from "@/lib/comparisons";
import { PageHero } from "@/components/layout/PageHero";
import { CompareView } from "@/components/compare/CompareView";
import { CompareSkeleton } from "@/components/compare/CompareSkeleton";
import { Callout } from "@/components/ui/Callout";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Compare Power Stations Side by Side (Free Tool)",
  description:
    "Compare portable power stations side by side: capacity, output, surge, charging speed and weight, with the best verified value highlighted in each row.",
  path: "/compare",
});

export default function ComparePage() {
  const catalog = getAllProducts();
  const scores: Record<string, ProductScore> = Object.fromEntries(
    scoreCatalog(catalog),
  );
  const comparisonGroups = groupComparisonsForIndex(COMPARISONS);

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
      {COMPARISONS.length ? (
        <div className="bg-navy-950 pt-6 text-white">
          <div className="container-page">
            <Callout tone="info" dark>
              Prefer a focused, editorial write-up instead of building your own
              selection? Browse the direct comparisons below, grouped by
              capacity class.
            </Callout>
            <div className="mt-6 space-y-8">
              {comparisonGroups.map((g) => (
                <section key={g.tierLabel}>
                  <h2 className="text-base font-bold text-white">{g.tierLabel}</h2>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {g.entries.map((e) => (
                      <li key={e.comparison.slug}>
                        <Link
                          href={`/compare/${e.comparison.slug}`}
                          className="block h-full rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-glow-cyan"
                        >
                          <p className="text-sm font-semibold text-cyan-300">
                            {e.comparison.h1}
                          </p>
                          {e.useCaseLabel ? (
                            <p className="mt-1 text-xs text-navy-400">
                              {e.useCaseLabel}
                            </p>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <Suspense fallback={<CompareSkeleton />}>
        <CompareView catalog={catalog} scores={scores} />
      </Suspense>

      <div className="bg-navy-950 pb-16 text-white">
        <div className="container-page">
          <section className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold text-white">
              What to actually compare on a power station
            </h2>
            <dl className="mt-4 space-y-3 text-sm text-navy-200">
              <div>
                <dt className="font-semibold text-white">Capacity (Wh) vs. output (W)</dt>
                <dd className="mt-1 text-navy-300">
                  Capacity is total stored energy — how long something can run.
                  Output is the rate it can deliver — whether it can start that
                  device at all. You need to check both; see{" "}
                  <Link href="/guides/watts-vs-watt-hours" className="underline">
                    watts vs. watt-hours
                  </Link>
                  .
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Surge vs. continuous output</dt>
                <dd className="mt-1 text-navy-300">
                  Motors — a fridge compressor, a power tool — draw several times
                  their running watts for a brief startup spike. A unit&rsquo;s
                  continuous rating alone doesn&rsquo;t tell you if it can start one.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Recharge options and speed</dt>
                <dd className="mt-1 text-navy-300">
                  Wall (AC), car, and solar input watts determine how fast a unit
                  recharges between uses — relevant for multi-day outages or
                  off-grid trips.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Weight, ports and expandability</dt>
                <dd className="mt-1 text-navy-300">
                  Weight matters if you&rsquo;re carrying it (camping); expandable
                  capacity and 120/240V output matter more for stationary home
                  backup.
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-navy-300">
              Every field above comes straight from{" "}
              <code>products.json</code> — a blank cell in the tool means that
              spec isn&rsquo;t independently verified for that unit, not that
              it&rsquo;s zero. Prefer a guided result instead of comparing manually? Use
              the{" "}
              <Link href="/power-calculator" className="underline">
                Power Calculator
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
