import Link from "next/link";
import type { Product } from "@/types/product";
import type { Comparison } from "@/content/comparisons";
import { getAllProducts, productDisplayName } from "@/data/products";
import { getGuide } from "@/content/guides";
import { getBestFor } from "@/content/best-for";
import { scoreProduct } from "@/lib/score";
import { COMPARE_ROWS, rowWinner } from "@/lib/compare-rows";
import {
  evaluateUseCases,
  buildComparisonRuntimeRows,
  headlineDifferences,
  earliestLastChecked,
  capacityParity,
} from "@/lib/comparisons";
import { fmtDate, fmtHours, NOT_VERIFIED } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageHero } from "@/components/layout/PageHero";
import { Callout } from "@/components/ui/Callout";
import { Badge } from "@/components/ui/Badge";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { ProductIllustration } from "@/components/ui/ProductIllustration";
import { AmazonCta } from "@/components/product/AmazonCta";
import { EstimateFactorsDisclosure } from "@/components/ui/EstimateFactorsDisclosure";
import { CheckIcon } from "@/components/ui/icons";
import type { Crumb } from "@/lib/seo";

const JUMP_LINKS = [
  { href: "#comparison-table", label: "Spec comparison" },
  { href: "#by-use-case", label: "Winner by use case" },
  { href: "#runtime-estimates", label: "Estimated autonomy" },
  { href: "#conclusion", label: "Conclusion" },
];

export function ModelComparisonPage({
  comparison,
  products,
}: {
  comparison: Comparison;
  products: [Product, Product];
}) {
  const catalog = getAllProducts();
  const scores = products.map((p) => scoreProduct(p, catalog));
  const verdicts = evaluateUseCases(products);
  const runtimeRows = buildComparisonRuntimeRows(products);
  const allHeadlineDiffs = headlineDifferences(products);
  const headlineDiffs = allHeadlineDiffs.slice(0, 3);
  const lastChecked = earliestLastChecked(products);
  const capacity = capacityParity(products);

  const relatedGuide = getGuide(comparison.relatedGuideSlug);
  const relatedBestFor = comparison.relatedBestForSlugs
    .map((s) => getBestFor(s))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  const groups = (() => {
    const order: string[] = [];
    const map = new Map<string, typeof COMPARE_ROWS>();
    for (const row of COMPARE_ROWS) {
      if (!map.has(row.group)) {
        map.set(row.group, []);
        order.push(row.group);
      }
      map.get(row.group)!.push(row);
    }
    return order.map((g) => ({ group: g, rows: map.get(g)! }));
  })();

  // Fields most relevant to "which unit is more physically/spec-portable" —
  // named specifically in the conclusion when not verified for either unit,
  // never attributed to a fixed product (this is recomputed per-product so
  // it stays correct regardless of which two products a future comparison
  // pairs).
  const NOTABLE_UNVERIFIED_KEYS = ["weight_kg", "dimensions", "warranty", "expandable"];
  const notableRows = COMPARE_ROWS.filter((r) => NOTABLE_UNVERIFIED_KEYS.includes(r.key));
  const unverifiedByProduct = products.map((p) => ({
    product: p,
    labels: notableRows.filter((r) => r.display(p) === NOT_VERIFIED).map((r) => r.label),
  }));

  const diffsByWinnerId = new Map<string, typeof allHeadlineDiffs>();
  for (const d of allHeadlineDiffs) {
    if (!diffsByWinnerId.has(d.winnerId)) diffsByWinnerId.set(d.winnerId, []);
    diffsByWinnerId.get(d.winnerId)!.push(d);
  }
  const decisiveVerdicts = verdicts.filter((v) => v.winnerId !== null);

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: comparison.h1, path: `/compare/${comparison.slug}` },
  ];

  return (
    <>
      <PageHero title={comparison.h1} crumbs={crumbs} />

      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_300px]">
          {/*
            min-w-0 overrides the CSS Grid default of min-width:auto on grid
            items. Without it, this column's intrinsic minimum width is set
            by its widest descendant (the spec table's min-w-[480px], scoped
            to its own overflow-x-auto wrapper below) and the whole column
            refuses to shrink below that on narrow viewports — the actual
            cause of the horizontal-overflow bug, not something an
            overflow-x-hidden safety net can fix.
          */}
          <div className="min-w-0">
            <p className="text-[15px] leading-7 text-navy-200">{comparison.intro}</p>

            <p className="mt-3 text-xs text-navy-400">
              These picks are focused on the U.S. market. Before buying, confirm
              plug type, voltage (120V), warranty terms, and regional
              availability on the Amazon listing.
            </p>

            <p className="mt-2 text-xs text-navy-400">
              Last checked{" "}
              {lastChecked ? fmtDate(lastChecked) : "Not verified"} — see each
              product&rsquo;s Specifications tab for full provenance.
            </p>

            {/* Quick summary */}
            <section className="mt-6 rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4">
              <h2 className="text-base font-semibold text-white">Quick summary</h2>
              {headlineDiffs.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-200">
                  {headlineDiffs.map((d) => {
                    const winnerName = productDisplayName(
                      products.find((p) => p.id === d.winnerId)!,
                    );
                    return (
                      <li key={d.rowLabel}>
                        {winnerName} leads on {d.rowLabel.toLowerCase()} (
                        {d.winnerDisplay} vs {d.loserDisplay}).
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-navy-300">
                  On the headline specs we compare, the data on file doesn&rsquo;t
                  show a decisive difference between these two units.
                </p>
              )}
              <p className="mt-2 text-sm text-navy-300">
                A use case below only names a model as ahead when at least two
                independent, comparable fields agree (or the use case is
                defined by a single field, like solar charging). A single
                distinguishing field in an otherwise-tied or unverified
                category is named specifically, not counted as winning that
                use case.
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {JUMP_LINKS.map((j) => (
                  <li key={j.href}>
                    <a href={j.href} className="text-cyan-300 hover:underline">
                      Jump to {j.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {/* Product header cards */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {products.map((p, i) => (
                <div
                  key={p.id}
                  className="glass-panel bg-navy-900/60 p-4 text-center"
                >
                  <ProductIllustration
                    product={p}
                    size={88}
                    className="mx-auto"
                    tone="dark"
                  />
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-navy-400">
                    {p.brand}
                  </p>
                  <p className="text-sm font-semibold text-white">{p.model}</p>
                  <div className="mt-2 flex justify-center">
                    <ScoreCircle
                      value={scores[i].overall}
                      band={scores[i].band}
                      size={64}
                      tone="dark"
                    />
                  </div>
                  <Link
                    href={`/products/${p.id}`}
                    className="mt-1 inline-block text-xs font-medium text-cyan-300 hover:underline"
                  >
                    View full product page →
                  </Link>
                </div>
              ))}
            </div>

            {/* Spec comparison table */}
            <section id="comparison-table" className="mt-10 scroll-mt-24">
              <h2 className="text-lg font-bold text-white">Spec comparison</h2>
              <p className="mt-1 text-sm text-navy-300">
                Reused directly from the same catalog and winner-highlighting
                logic as the general{" "}
                <Link href="/compare" className="underline">
                  Compare
                </Link>{" "}
                page. A blank or “Not verified” cell means the data isn&rsquo;t
                on file — it is never treated as zero, and a difference is
                only highlighted when both values are actually known.
              </p>
              <p className="mt-2 text-xs text-navy-400 sm:hidden" aria-hidden="true">
                Scroll horizontally to see all columns →
              </p>
              <div
                className="mt-2 overflow-x-auto sm:mt-4"
                role="region"
                aria-label="Spec comparison table, scrollable horizontally on narrow screens"
                tabIndex={0}
              >
                <table className="w-full min-w-[480px] border-collapse text-sm">
                  <caption className="sr-only">
                    Specification comparison between {productDisplayName(products[0])} and{" "}
                    {productDisplayName(products[1])}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="sr-only">
                        Specification
                      </th>
                      {products.map((p) => (
                        <th
                          key={p.id}
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-navy-400"
                        >
                          {p.brand} {p.model}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {groups.map((g) => (
                    <tbody key={g.group}>
                      <tr>
                        <th
                          scope="colgroup"
                          colSpan={3}
                          className="bg-navy-900/80 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-navy-300"
                        >
                          {g.group}
                        </th>
                      </tr>
                      {g.rows.map((row) => {
                        const winner = rowWinner(row, products);
                        return (
                          <tr key={row.key} className="border-b border-navy-800">
                            <th
                              scope="row"
                              className="min-w-[160px] px-3 py-2.5 text-left font-medium text-navy-300"
                            >
                              {row.label}
                            </th>
                            {products.map((p) => {
                              const isWin =
                                !winner.tie && winner.winnerIds.includes(p.id);
                              return (
                                <td
                                  key={p.id}
                                  className={cn(
                                    "px-3 py-2.5 tabular-nums",
                                    isWin
                                      ? "font-semibold text-positive-500"
                                      : "text-navy-100",
                                  )}
                                >
                                  <span className="inline-flex items-center gap-1">
                                    {isWin ? (
                                      <CheckIcon
                                        width={14}
                                        height={14}
                                        className="text-positive-500"
                                      />
                                    ) : null}
                                    {row.display(p)}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  ))}
                  <tbody>
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={3}
                        className="bg-navy-900/80 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-navy-300"
                      >
                        PowerMatch Score
                      </th>
                    </tr>
                    <tr className="border-b border-navy-800">
                      <th
                        scope="row"
                        className="min-w-[160px] px-3 py-2.5 text-left font-medium text-navy-300"
                      >
                        Editorial score
                      </th>
                      {products.map((p, i) => (
                        <td key={p.id} className="px-3 py-2.5 text-navy-100">
                          {scores[i].overall == null
                            ? "Not published — insufficient verified data"
                            : `${scores[i].overall}/100 (${scores[i].band}) · ${scores[i].scoredCount}/${scores[i].totalDimensions} dimensions`}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-navy-400">
                Scores are editorial calculations normalized against the whole
                PowerMatchLab catalog — not a lab test result. See{" "}
                <Link href="/about-methodology" className="underline">
                  the methodology
                </Link>
                .
              </p>
            </section>

            {/* Winner by use case */}
            <section id="by-use-case" className="mt-10 scroll-mt-24">
              <h2 className="text-lg font-bold text-white">Winner by use case</h2>
              <p className="mt-1 text-sm text-navy-300">
                Each verdict below is derived only from the specific fields
                listed as criteria — never from overall impressions, and never
                from physical testing. A null field is neither a win nor a
                loss for either unit, and a category needs at least two
                independent fields to agree before it declares an overall
                winner (a category built around a single criterion, like
                solar charging, is the exception).
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {verdicts.map((v) => {
                  const winner = v.winnerId
                    ? products.find((p) => p.id === v.winnerId)
                    : null;
                  return (
                    <div
                      key={v.key}
                      className="rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{v.label}</p>
                      <p className="mt-1 text-sm text-navy-200">
                        {winner ? (
                          <>
                            <span className="text-positive-500">
                              {productDisplayName(winner)}
                            </span>{" "}
                            edges ahead here.
                          </>
                        ) : (
                          "No clear overall winner based on the data on file."
                        )}
                      </p>
                      {!winner && v.note ? (
                        <p className="mt-1 text-xs text-navy-300">{v.note}</p>
                      ) : null}
                      <p className="mt-1.5 text-xs text-navy-400">
                        Criteria: {v.criteria.join(", ")} ({v.comparableCount} of{" "}
                        {v.criteria.length} comparable).
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Runtime estimates */}
            <section id="runtime-estimates" className="mt-10 scroll-mt-24">
              <h2 className="text-lg font-bold text-white">Estimated autonomy</h2>
              <p className="mt-1 text-sm text-navy-300">
                Calculated the same way as each product page&rsquo;s runtime
                table:{" "}
                <span className="font-mono text-[13px] text-cyan-200">
                  capacity_wh × 0.85 ÷ device_watts
                </span>
                . These are planning estimates, not lab measurements or
                guarantees.
              </p>
              <p className="mt-2 text-xs text-navy-400 sm:hidden" aria-hidden="true">
                Scroll horizontally to see all columns →
              </p>
              <div
                className="mt-1 overflow-x-auto sm:mt-3"
                role="region"
                aria-label="Estimated autonomy table, scrollable horizontally on narrow screens"
                tabIndex={0}
              >
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <caption className="sr-only">
                    Estimated runtime for example loads
                  </caption>
                  <thead>
                    <tr className="bg-navy-900/70 text-left text-navy-300">
                      <th scope="col" className="px-3 py-2 font-medium">
                        Example load
                      </th>
                      {products.map((p) => (
                        <th key={p.id} scope="col" className="px-3 py-2 font-medium">
                          {p.brand} {p.model}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {runtimeRows.map((r) => (
                      <tr key={r.key} className="border-t border-navy-800">
                        <th
                          scope="row"
                          className="px-3 py-2.5 text-left font-medium text-navy-200"
                        >
                          {r.label} (~{r.deviceWatts} W)
                        </th>
                        {products.map((p) => (
                          <td key={p.id} className="px-3 py-2.5 font-semibold text-white">
                            {fmtHours(r.hoursByProductId[p.id])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <EstimateFactorsDisclosure className="mt-4" />
            </section>

            {/* Pros & limitations */}
            <section className="mt-10">
              <h2 className="text-lg font-bold text-white">Pros &amp; limitations</h2>
              <p className="mt-1 text-sm text-navy-300">
                From each product&rsquo;s existing catalog entry — no personal
                impressions, noise, build-quality or real-world behavior is
                added here.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {p.brand} {p.model}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-positive-500">
                      Pros
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-navy-200">
                      {p.pros.map((pro) => (
                        <li key={pro}>{pro}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
                      Limitations
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-navy-200">
                      {p.cons.map((con) => (
                        <li key={con}>{con}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Conclusion */}
            <section id="conclusion" className="mt-10 scroll-mt-24">
              <h2 className="text-lg font-bold text-white">Conclusion</h2>
              <div className="mt-2 space-y-3 text-[15px] leading-7 text-navy-200">
                <p>
                  {capacity.comparable && capacity.equal ? (
                    <>Both units share the same registered capacity ({capacity.display}). </>
                  ) : null}
                  {products.map((p) => {
                    const diffs = diffsByWinnerId.get(p.id) ?? [];
                    if (!diffs.length) return null;
                    return (
                      <span key={p.id}>
                        {productDisplayName(p)} has the higher{" "}
                        {diffs.map((d) => d.rowLabel.toLowerCase()).join(" and ")} on
                        file.{" "}
                      </span>
                    );
                  })}
                </p>
                <p>
                  {unverifiedByProduct.some((u) => u.labels.length) ? (
                    <>
                      {unverifiedByProduct
                        .filter((u) => u.labels.length)
                        .map((u) => (
                          <span key={u.product.id}>
                            {u.labels.join(", ")}{" "}
                            {u.labels.length > 1 ? "are" : "is"} not verified for
                            the {productDisplayName(u.product)}.{" "}
                          </span>
                        ))}
                      With those gaps, there is no absolute winner between
                      these two units based on the data currently on file.
                    </>
                  ) : (
                    "There is no absolute winner between these two units based on the data currently on file."
                  )}
                </p>
                <p>
                  {decisiveVerdicts.length ? (
                    <>
                      If{" "}
                      {decisiveVerdicts
                        .map((v) => v.label.toLowerCase())
                        .join(" or ")}{" "}
                      matters most to you,{" "}
                      {decisiveVerdicts
                        .map(
                          (v) =>
                            `the ${productDisplayName(
                              products.find((p) => p.id === v.winnerId)!,
                            )} has the edge on file for ${v.label.toLowerCase()}`,
                        )
                        .join("; ")}
                      . For the other use cases evaluated above, the data on
                      file doesn&rsquo;t support picking one unit over the
                      other — check which specific criteria matter for your
                      situation.
                    </>
                  ) : (
                    "None of the use cases evaluated above resolve to a decisive winner from the data on file — the right pick depends entirely on which specific criteria matter for your situation."
                  )}
                </p>
                <p>
                  Neither unit has been physically tested by PowerMatchLab.
                  Before buying, enter your own devices in the Power
                  Calculator — the numbers above use example loads, and your
                  real appliances may draw differently.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/compare?ids=${products.map((p) => p.id).join(",")}`}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Compare these models →
                </Link>
                <Link
                  href="/power-calculator"
                  className="inline-flex items-center justify-center rounded-lg border border-cyan-400/40 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-navy-800"
                >
                  Open Power Calculator
                </Link>
                {comparison.studioLinkLabel ? (
                  <Link
                    href="/power-setup-studio"
                    className="inline-flex items-center justify-center rounded-lg border border-navy-700 px-4 py-2.5 text-sm font-semibold text-navy-200 hover:bg-navy-800"
                  >
                    {comparison.studioLinkLabel}
                  </Link>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {products.map((p, i) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-navy-700 bg-navy-900/60 p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {p.brand} {p.model}
                    </p>
                    <p className="mt-1 text-[11px] text-navy-400">
                      Specs last checked {fmtDate(p.last_verified)}
                    </p>
                    <div className="mt-2 space-y-2">
                      <AmazonCta product={p} size="sm" tone="dark" />
                      <Link
                        href={`/products/${p.id}`}
                        className="block text-xs font-medium text-cyan-300 hover:underline"
                      >
                        Full product page →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {relatedGuide || relatedBestFor.length ? (
                <ul className="mt-6 space-y-1.5 text-sm">
                  {relatedBestFor.map((b) => (
                    <li key={b.slug}>
                      <Link href={`/${b.slug}`} className="text-cyan-300 hover:underline">
                        → {b.title}
                      </Link>
                    </li>
                  ))}
                  {relatedGuide ? (
                    <li>
                      <Link
                        href={`/guides/${relatedGuide.slug}`}
                        className="text-cyan-300 hover:underline"
                      >
                        → {relatedGuide.title}
                      </Link>
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </section>

            <Callout tone="warn" dark className="mt-10">
              Specifications are recorded from manufacturer-published
              information; unverified fields are shown as “Not verified”, never
              guessed. Scores, winner highlights and runtime figures are
              PowerMatchLab calculations, not tests. As an Amazon Associate we
              may earn from qualifying purchases — a commission never
              determines ranking. See the{" "}
              <Link href="/about-methodology" className="underline">
                methodology
              </Link>{" "}
              and{" "}
              <Link href="/affiliate-disclosure" className="underline">
                affiliate disclosure
              </Link>
              .
            </Callout>
          </div>

          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <div className="glass-panel bg-navy-900/60 p-4">
              <h2 className="text-sm font-semibold text-white">On this page</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {JUMP_LINKS.map((j) => (
                  <li key={j.href}>
                    <a href={j.href} className="text-cyan-300 hover:underline">
                      → {j.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-navy-700 pt-3">
                <Link
                  href={`/compare?ids=${products.map((p) => p.id).join(",")}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Compare these models
                </Link>
                <Link
                  href="/power-calculator"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-cyan-400/40 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-navy-800"
                >
                  Open Power Calculator
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
