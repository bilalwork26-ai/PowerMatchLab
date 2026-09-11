import Link from "next/link";
import type { BestForContent } from "@/content/best-for";
import { selectBestFor, categoryPicksFor } from "@/lib/best-for";
import { getAllProducts } from "@/data/products";
import { getGuide } from "@/content/guides";
import { getComparison } from "@/content/comparisons";
import { COMPARE_ROWS, rowWinner } from "@/lib/compare-rows";
import { estimateRuntimeHours } from "@/lib/runtime";
import { PageHero } from "@/components/layout/PageHero";
import { ProductCard } from "@/components/product/ProductCard";
import { Callout } from "@/components/ui/Callout";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { scoreCatalog } from "@/lib/score";
import { cn } from "@/lib/cn";

/** Rows shown in the compact shortlist table — the specs that matter most across every use case. */
const SHORTLIST_ROW_KEYS = [
  "capacity_wh",
  "rated_output_w",
  "surge_output_w",
  "weight_kg",
  "solar_input_w",
];

const MAX_SHORTLIST = 8;

export function BestForPage({ content }: { content: BestForContent }) {
  const catalog = getAllProducts();
  const scores = scoreCatalog(catalog);
  const entries = selectBestFor(content.key, catalog);
  const top = entries.filter((e) => e.tagMatch);
  const others = entries.filter((e) => !e.tagMatch);
  const picks = categoryPicksFor(content.key, catalog);
  const shortlist = top.slice(0, MAX_SHORTLIST).map((e) => e.product);
  const shortlistRows = COMPARE_ROWS.filter((r) => SHORTLIST_ROW_KEYS.includes(r.key));
  const relatedGuides = (content.relatedGuideSlugs ?? [])
    .map((s) => getGuide(s))
    .filter((g): g is NonNullable<typeof g> => g !== undefined);
  const relatedComparisons = (content.relatedComparisonSlugs ?? [])
    .map((s) => getComparison(s))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: content.title, path: `/${content.slug}` },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs)]} />
      <PageHero
        title={content.title}
        crumbs={crumbs}
        lead={content.quickAnswer ?? content.intro[0]}
      />

      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          {(content.quickAnswer ? content.intro : content.intro.slice(1)).map((p) => (
            <p key={p} className="mb-4 text-[15px] leading-7 text-navy-200">
              {p}
            </p>
          ))}

          <section className="mt-4">
            <h2 className="text-lg font-bold text-white">What actually matters</h2>
            <dl className="mt-3 space-y-3">
              {content.whatMatters.map((w) => (
                <div
                  key={w.heading}
                  className="rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4"
                >
                  <dt className="font-semibold text-white">{w.heading}</dt>
                  <dd className="mt-1 text-sm text-navy-300">{w.detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-white">Common mistakes</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-navy-200">
              {content.commonMistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-white">How we pick for this use</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-navy-200">
              {content.compatibilityLogic.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <Callout tone="neutral" dark className="mt-4">
              The ranking below is derived from <code>products.json</code> using
              only verified fields. It is not a “we bought and tested these” list.
              Run the{" "}
              <Link href="/power-calculator" className="underline">
                Power Calculator
              </Link>{" "}
              for a recommendation tied to your specific load.
            </Callout>
          </section>

          {relatedGuides.length || relatedComparisons.length || content.studioLinkLabel ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-white">
                Sizing guides and interactive tools
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {relatedGuides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="text-cyan-300 hover:underline"
                    >
                      → {g.title}
                    </Link>
                  </li>
                ))}
                {relatedComparisons.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/compare/${c.slug}`}
                      className="text-cyan-300 hover:underline"
                    >
                      → Direct comparison: {c.h1}
                    </Link>
                  </li>
                ))}
                {content.studioLinkLabel ? (
                  <li>
                    <Link href="/power-setup-studio" className="text-cyan-300 hover:underline">
                      → {content.studioLinkLabel}
                    </Link>
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}

          {picks.length ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-white">
                Top picks for {content.title.replace("Best Power Stations for ", "")}
              </h2>
              {content.usMarketNotice ? (
                <p className="mt-1 text-xs text-navy-400">
                  These picks are focused on the U.S. market. Before buying, confirm
                  plug type, voltage (120V), warranty terms, and regional availability
                  on the Amazon listing — especially if you are ordering to another
                  country.
                </p>
              ) : null}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {picks.map((pick) => {
                  const fridgeHours =
                    content.key === "refrigerator-backup"
                      ? estimateRuntimeHours(pick.entry.product.capacity_wh, 150)
                      : null;
                  return (
                    <div key={pick.key}>
                      <Badge tone="brand" dark className="mb-2">
                        {pick.label}
                      </Badge>
                      <ProductCard
                        product={pick.entry.product}
                        score={scores.get(pick.entry.product.id)}
                        tone="dark"
                      />
                      <p className="mt-2 text-xs text-navy-300">{pick.reason}</p>
                      {fridgeHours != null ? (
                        <p className="mt-1 text-xs text-navy-400">
                          Estimated ~{fridgeHours.toFixed(1)} hours running a
                          full-size refrigerator (~150 W average draw) — a
                          planning calculation, not a lab measurement.
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <Callout tone="warn" dark className="mt-8">
              No catalog product is explicitly positioned for this use by its
              manufacturer. See the full catalog ranking below.
            </Callout>
          )}

          {shortlist.length >= 2 ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-white">Shortlist comparison</h2>
              <p className="mt-1 text-sm text-navy-300">
                The top {shortlist.length} matches for this use, verified specs
                only. The best value in each row is highlighted.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-navy-700 text-left text-navy-400">
                      <th scope="col" className="py-2 pr-3 font-medium">
                        Model
                      </th>
                      {shortlistRows.map((r) => (
                        <th key={r.key} scope="col" className="py-2 pr-3 font-medium">
                          {r.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shortlist.map((p) => (
                      <tr key={p.id} className="border-b border-navy-800">
                        <th scope="row" className="py-2 pr-3 text-left font-medium text-white">
                          <Link href={`/products/${p.id}`} className="hover:text-cyan-300">
                            {p.brand} {p.model}
                          </Link>
                        </th>
                        {shortlistRows.map((r) => {
                          const winner = rowWinner(r, shortlist);
                          const isWin = !winner.tie && winner.winnerIds.includes(p.id);
                          return (
                            <td
                              key={r.key}
                              className={cn(
                                "py-2 pr-3 tabular-nums",
                                isWin ? "font-semibold text-positive-500" : "text-navy-200",
                              )}
                            >
                              {r.display(p)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link
                href={`/compare?ids=${shortlist.map((p) => p.id).join(",")}`}
                className="mt-3 inline-flex text-sm font-semibold text-cyan-300 hover:underline"
              >
                Open full comparison →
              </Link>
            </section>
          ) : null}

          {others.length ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-white">Also in the catalog</h2>
              <p className="mt-1 text-sm text-navy-300">
                {others.length} more {others.length === 1 ? "model is" : "models are"}{" "}
                in the catalog but not specifically positioned for this use.{" "}
                <Link href="/products" className="underline hover:text-white">
                  Browse the full catalog
                </Link>{" "}
                to see all of them with filters, or start with the two closest
                matches below.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {others.slice(0, 2).map((e) => (
                  <div key={e.product.id}>
                    {e.caveats.length ? (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {e.caveats.map((c) => (
                          <Badge key={c} tone="warn" dark>
                            {c}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <ProductCard
                      product={e.product}
                      score={scores.get(e.product.id)}
                      tone="dark"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="text-lg font-bold text-white">FAQ</h2>
            <div className="mt-3 space-y-3">
              {content.faq.map((f) => (
                <details
                  key={f.question}
                  className="group rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4 open:shadow-glow-soft"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-white">
                    {f.question}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-cyan-300 transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-2 animate-fade-up text-sm text-navy-200">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <p className="mt-8 text-xs text-navy-400">
            Last updated {content.lastUpdated}. Specifications are manufacturer
            claims; PowerMatchLab has not physically tested these units.
          </p>
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="glass-panel bg-navy-900/60 p-4">
            <h2 className="text-sm font-semibold text-white">Size it precisely</h2>
            <p className="mt-1 text-sm text-navy-300">
              This page explains what matters. The calculator turns your actual
              devices into a capacity and output target.
            </p>
            <Link
              href="/power-calculator"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Open Power Calculator
            </Link>
            <Link
              href="/compare"
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-cyan-400/40 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-navy-800"
            >
              Compare products
            </Link>
          </div>
        </aside>
        </div>
      </div>
    </>
  );
}
