import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/data/products";
import { computeCatalogStats } from "@/lib/catalog-stats";
import { pageMetadata, breadcrumbJsonLd, datasetJsonLd, absoluteUrl } from "@/lib/seo";
import { fmtDate } from "@/lib/format";
import { BILAL_SIALI } from "@/lib/authors";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { Callout } from "@/components/ui/Callout";
import { ShareBar } from "@/components/ui/ShareBar";

const PATH = "/research/portable-power-station-specs-2026";
const CSV_PATH = `${PATH}/catalog.csv`;
const TITLE = "Portable Power Station Specifications, 2026: A Catalog Dataset Report";
/** Computed once at module load so the description/copy never drifts from the real catalog size. */
const PRODUCT_COUNT = getAllProducts().length;
const DESCRIPTION =
  `A transparent, programmatically-generated report on PowerMatchLab's own ${PRODUCT_COUNT}-product catalog: capacity, output and weight distributions, battery chemistry mix, unknown-field rates, methodology, and a free CSV download.`;

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-3">
      <dt className="text-xs text-navy-400">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold text-white">{value}</dd>
    </div>
  );
}

export default function ResearchReportPage() {
  const products = getAllProducts();
  const stats = computeCatalogStats(products);
  const url = absoluteUrl(PATH);
  const csvUrl = absoluteUrl(CSV_PATH);

  // Simple, accessible capacity-range buckets for the one chart this page
  // earns — not a charting library, just proportional bars from real counts.
  const capacityBuckets = [
    { label: "Under 500 Wh", test: (v: number) => v < 500 },
    { label: "500–999 Wh", test: (v: number) => v >= 500 && v < 1000 },
    { label: "1,000–1,999 Wh", test: (v: number) => v >= 1000 && v < 2000 },
    { label: "2,000–3,999 Wh", test: (v: number) => v >= 2000 && v < 4000 },
    { label: "4,000 Wh and up", test: (v: number) => v >= 4000 },
  ].map((b) => ({
    label: b.label,
    count: products.filter((p) => p.capacity_wh !== null && b.test(p.capacity_wh)).length,
  }));
  const maxBucketCount = Math.max(...capacityBuckets.map((b) => b.count), 1);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Research", path: PATH },
          ]),
          datasetJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: PATH,
            csvPath: CSV_PATH,
            dateModified: stats.dataCurrentThrough,
            productCount: stats.productCount,
          }),
        ]}
      />
      <PageHero
        title="Portable Power Station Specifications, 2026"
        lead={`A transparent report on PowerMatchLab's own catalog dataset — not a market study, not a sales ranking. Every number below is computed live from the same ${PRODUCT_COUNT}-product dataset the rest of the site runs on.`}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Research", path: PATH },
        ]}
      />

      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page prose-pml max-w-3xl">
          <p className="not-prose -mt-2 mb-4 text-xs text-navy-400">
            Compiled and maintained by{" "}
            <Link href={BILAL_SIALI.path} className="underline hover:text-cyan-300">
              {BILAL_SIALI.name}
            </Link>{" "}
            · Data current through {fmtDate(stats.dataCurrentThrough)}
          </p>

          <Callout tone="warn" dark title="What this is, and what it isn't">
            This is a summary of specifications PowerMatchLab has collected editorially
            from manufacturer-published sources for the products currently in its own
            catalog — not an independent market study, not a measurement of sales or
            popularity, and not a laboratory test. A number being common in this dataset
            says nothing about how common it is in the wider market; it only describes
            these {PRODUCT_COUNT} products. See{" "}
            <Link href="/about-methodology">About &amp; Methodology</Link> for how each
            figure in the underlying catalog is sourced and verified.
          </Callout>

          <h2>What this dataset contains</h2>
          <dl className="not-prose my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Products" value={String(stats.productCount)} />
            <Stat label="Brands" value={String(stats.brands.length)} />
            <Stat label="Data current through" value={fmtDate(stats.dataCurrentThrough)} />
            <Stat label="Oldest record checked" value={fmtDate(stats.oldestVerifiedDate)} />
          </dl>
          <p>
            <strong>Data current through</strong> is the most recent{" "}
            <code>last_verified</code> date across every product in the catalog — computed
            from the same field every product page shows as &ldquo;Specs last checked.&rdquo;
            It is not a fixed publication date; it moves whenever a product record is
            re-verified.
          </p>

          <h3>Brands represented ({stats.brands.length})</h3>
          <p className="not-prose flex flex-wrap gap-2">
            {stats.brands.map((b) => (
              <span
                key={b.name}
                className="rounded-full border border-navy-700 bg-navy-900/60 px-3 py-1 text-sm text-navy-200"
              >
                {b.name} <span className="text-navy-400">({b.count})</span>
              </span>
            ))}
          </p>

          <h2>Distributions</h2>
          <p>
            Median, minimum and maximum are calculated only from products with a
            verified (non-null) value for that field — an unknown field is never treated
            as zero, and is reported separately as its own percentage below.
          </p>
          <div className="not-prose my-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-left text-navy-400">
                  <th className="py-2 pr-3 font-medium">Field</th>
                  <th className="py-2 pr-3 font-medium">Known</th>
                  <th className="py-2 pr-3 font-medium">Unknown</th>
                  <th className="py-2 pr-3 font-medium">Min</th>
                  <th className="py-2 pr-3 font-medium">Median</th>
                  <th className="py-2 pr-3 font-medium">Max</th>
                </tr>
              </thead>
              <tbody>
                {stats.numericFields.map((f) => (
                  <tr key={f.field} className="border-b border-navy-800">
                    <td className="py-2 pr-3 font-medium text-white">{f.label}</td>
                    <td className="py-2 pr-3 text-navy-200">
                      {f.knownCount}/{stats.productCount}
                    </td>
                    <td className="py-2 pr-3 text-navy-200">{f.unknownPct}%</td>
                    <td className="py-2 pr-3 text-navy-200">
                      {f.min !== null ? `${f.min.toLocaleString("en-US")} ${f.unit}` : "—"}
                    </td>
                    <td className="py-2 pr-3 font-medium text-white">
                      {f.median !== null ? `${f.median.toLocaleString("en-US")} ${f.unit}` : "—"}
                    </td>
                    <td className="py-2 pr-3 text-navy-200">
                      {f.max !== null ? `${f.max.toLocaleString("en-US")} ${f.unit}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Capacity distribution</h3>
          <div className="not-prose my-4 space-y-2" role="img" aria-label="Bar chart of product count by battery capacity range">
            {capacityBuckets.map((b) => (
              <div key={b.label} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 text-navy-300">{b.label}</span>
                <div className="h-4 flex-1 rounded bg-navy-800">
                  <div
                    className="h-4 rounded bg-cyan-400"
                    style={{ width: `${Math.max((b.count / maxBucketCount) * 100, b.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-medium text-white">{b.count}</span>
              </div>
            ))}
          </div>

          <h3>Battery chemistry</h3>
          <div className="not-prose my-4 overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-left text-navy-400">
                  <th className="py-2 pr-3 font-medium">Chemistry</th>
                  <th className="py-2 pr-3 font-medium">Products</th>
                  <th className="py-2 pr-3 font-medium">Share of catalog</th>
                </tr>
              </thead>
              <tbody>
                {stats.categoricalFields[0]?.buckets.map((b) => (
                  <tr key={b.value} className="border-b border-navy-800">
                    <td className="py-2 pr-3 font-medium text-white">{b.value}</td>
                    <td className="py-2 pr-3 text-navy-200">{b.count}</td>
                    <td className="py-2 pr-3 text-navy-200">{b.pct}%</td>
                  </tr>
                ))}
                {stats.categoricalFields[0]?.unknownCount ? (
                  <tr>
                    <td className="py-2 pr-3 text-navy-400">Not verified</td>
                    <td className="py-2 pr-3 text-navy-200">
                      {stats.categoricalFields[0].unknownCount}
                    </td>
                    <td className="py-2 pr-3 text-navy-200">
                      {stats.categoricalFields[0].unknownPct}%
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <h2>Full catalog summary</h2>
          <p>
            Every product in the dataset, with the fields this report analyzes. The
            complete field set — including ports, warranty, and every other
            manufacturer-published spec — is on each product&rsquo;s own page, linked
            below.
          </p>
          <div className="not-prose my-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-left text-navy-400">
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="py-2 pr-3 font-medium">Capacity (Wh)</th>
                  <th className="py-2 pr-3 font-medium">Output (W)</th>
                  <th className="py-2 pr-3 font-medium">Weight (kg)</th>
                  <th className="py-2 pr-3 font-medium">Chemistry</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-navy-800">
                    <td className="py-2 pr-3">
                      <Link href={`/products/${p.id}`} className="font-medium text-cyan-300 hover:underline">
                        {p.brand} {p.model}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-navy-200">
                      {p.capacity_wh?.toLocaleString("en-US") ?? "—"}
                    </td>
                    <td className="py-2 pr-3 text-navy-200">
                      {p.rated_output_w?.toLocaleString("en-US") ?? "—"}
                    </td>
                    <td className="py-2 pr-3 text-navy-200">{p.weight_kg ?? "—"}</td>
                    <td className="py-2 pr-3 text-navy-200">{p.battery_chemistry ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Download the dataset</h2>
          <p>
            The full CSV underlying every number above — same 39 rows, manufacturer
            specification columns only. No affiliate links, no Amazon URLs, no ASINs,
            and no internal editorial notes are included in this file.
          </p>
          <div className="not-prose my-4 rounded-xl border border-navy-700 bg-navy-900/60 p-4">
            <ShareBar url={url} title={TITLE} contentKey="research_report" csvHref={CSV_PATH} csvLabel="Download CSV" />
          </div>

          <h2>Methodology</h2>
          <ul>
            <li>
              Every figure comes directly from products.json, the same dataset that
              powers every product page, the comparator, and the Power Calculator on
              this site — there is no separate or hand-edited copy of this data.
            </li>
            <li>
              Specifications are manufacturer-published claims, attributed by source on
              each product&rsquo;s own page, gathered and verified editorially — never a
              PowerMatchLab laboratory measurement or independent test result.
            </li>
            <li>
              Median, minimum and maximum are calculated programmatically from only the
              products with a verified (non-null) value for that specific field; unknown
              values are excluded from the calculation, never treated as zero.
            </li>
            <li>
              &ldquo;Unknown&rdquo; means PowerMatchLab has not found or confirmed a
              manufacturer-published figure for that field on that product — it is not
              evidence the product lacks that feature.
            </li>
          </ul>

          <h2>Limitations</h2>
          <ul>
            <li>
              This describes PowerMatchLab&rsquo;s own {PRODUCT_COUNT}-product catalog only — it is not
              a survey of the wider portable power station market, and no claim here
              should be read as one.
            </li>
            <li>
              No sales, popularity, market-share, or ranking claim is made anywhere in
              this report — the site has no verified access to that data for any
              product.
            </li>
            <li>
              The catalog changes over time (products are added when a working Amazon
              listing exists, and removed when one stops resolving) — figures here
              reflect the catalog as of the &ldquo;data current through&rdquo; date
              above, not a permanent snapshot.
            </li>
            <li>
              See{" "}
              <Link href="/editorial-policy">Editorial Policy</Link> for how products
              enter or leave the catalog, and{" "}
              <Link href="/about-methodology">About &amp; Methodology</Link> for how
              individual figures are sourced.
            </li>
          </ul>

          <div className="not-prose my-8 rounded-xl border border-navy-700 bg-navy-900/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              To cite this resource
            </p>
            <p className="mt-2 text-sm text-navy-200">
              <strong className="text-white">{TITLE}</strong>
              <br />
              PowerMatchLab
              <br />
              <Link href={PATH} className="text-cyan-300 hover:underline">
                {url}
              </Link>
              <br />
              Data current through {fmtDate(stats.dataCurrentThrough)}
            </p>
          </div>

          <p className="text-sm text-navy-400">
            Found an error in a specific product&rsquo;s specifications? See the{" "}
            <Link href="/editorial-policy">Editorial Policy</Link> for how corrections
            work — corrections to the underlying data flow through this report
            automatically the next time it is generated.
          </p>
        </div>
      </div>
    </>
  );
}
