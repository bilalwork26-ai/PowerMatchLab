import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, getProductById, productDisplayName } from "@/data/products";
import { scoreProduct } from "@/lib/score";
import {
  breadcrumbJsonLd,
  pageMetadata,
  productJsonLd,
  type Crumb,
} from "@/lib/seo";
import { fmtWh, fmtWatts, fmtKg, fmtMs, fmtText } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/ui/JsonLd";
import { Callout } from "@/components/ui/Callout";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { ProductIllustration } from "@/components/ui/ProductIllustration";
import { ILLUSTRATIVE_CAPTION_LONG } from "@/lib/illustrations";
import { AmazonCta } from "@/components/product/AmazonCta";
import { CompareToggleButton } from "@/components/product/CompareToggleButton";
import { ProductTabs } from "@/components/product/ProductTabs";
import { SpecTable } from "@/components/product/SpecTable";
import { ProsCons } from "@/components/product/ProsCons";
import { ScoreBreakdown } from "@/components/product/ScoreBreakdown";
import { RuntimeExamples } from "@/components/product/RuntimeExamples";
import { QuickComparison } from "@/components/product/QuickComparison";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return pageMetadata({ title: "Product not found", description: "", path: `/products/${id}`, noindex: true });
  const name = productDisplayName(product);
  return pageMetadata({
    title: `${name} — Specs, PowerMatch Score & Runtime`,
    description: `${name}: verified manufacturer specifications, PowerMatchLab's editorial score where the data justifies one, estimated runtime examples, pros and cons, and a direct link to Amazon.`,
    path: `/products/${product.id}`,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const catalog = getAllProducts();
  const score = scoreProduct(product, catalog);
  const name = productDisplayName(product);

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: name, path: `/products/${product.id}` },
  ];

  const keySpecs: { label: string; value: string }[] = [
    { label: "Capacity", value: fmtWh(product.capacity_wh) },
    { label: "Continuous output", value: fmtWatts(product.rated_output_w) },
    { label: "Surge output", value: fmtWatts(product.surge_output_w) },
    { label: "Weight", value: fmtKg(product.weight_kg) },
    { label: "UPS switchover", value: fmtMs(product.ups_ms) },
    { label: "Warranty", value: fmtText(product.warranty) },
  ];

  return (
    <>
      <JsonLd
        data={[productJsonLd(product), breadcrumbJsonLd(crumbs)]}
      />

      <div className="border-b border-navy-100 bg-white">
        <div className="container-page py-6">
          <Breadcrumbs crumbs={crumbs} />

          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="mx-auto flex flex-col items-center gap-2 sm:mx-0 sm:items-start">
                <ProductIllustration product={product} size={200} showCaption={false} />
                <p className="max-w-[220px] text-center text-[10px] leading-snug text-navy-400 sm:text-left">
                  {ILLUSTRATIVE_CAPTION_LONG}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium uppercase tracking-wide text-navy-500">
                  {product.brand}
                </p>
                <h1 className="text-2xl font-bold sm:text-3xl">{product.model}</h1>
                <p className="mt-1 text-sm text-navy-500">
                  Portable power station · Market: US
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.battery_chemistry ? (
                    <Badge tone="neutral">{product.battery_chemistry}</Badge>
                  ) : null}
                  {product.expandable === true ? (
                    <Badge tone="brand">Expandable</Badge>
                  ) : null}
                  {product.voltage_240v === true ? (
                    <Badge tone="brand">120/240V</Badge>
                  ) : null}
                  {product.rv_tt30 === true ? <Badge tone="brand">TT-30</Badge> : null}
                  {product.solar_input_w ? (
                    <Badge tone="positive">{product.solar_input_w} W solar</Badge>
                  ) : null}
                </div>

                <p className="mt-4 max-w-prose text-[15px] leading-7 text-navy-700">
                  The {name} is a {fmtWh(product.capacity_wh)} LiFePO4-class
                  portable power station rated for {fmtWatts(product.rated_output_w)}{" "}
                  of continuous output. PowerMatchLab summarises the verified
                  manufacturer specification below; figures we have not confirmed
                  are shown as “Not verified”.
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {keySpecs.map((s) => (
                    <div key={s.label} className="rounded-lg bg-navy-50 p-3">
                      <dt className="text-xs text-navy-500">{s.label}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-navy-900">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <aside className="lg:sticky lg:top-20 lg:h-fit">
              <div className="card p-4">
                <div className="flex items-center gap-4">
                  <ScoreCircle value={score.overall} band={score.band} size={84} />
                  <div>
                    <p className="text-sm font-semibold">PowerMatch Score</p>
                    <p className="text-xs text-navy-500">
                      {score.overall == null
                        ? "Not published — insufficient verified data"
                        : `${score.scoredCount}/${score.totalDimensions} dimensions · editorial`}
                    </p>
                    <a
                      href="#details"
                      className="text-xs font-medium text-brand-700 hover:underline"
                    >
                      See score breakdown
                    </a>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <AmazonCta product={product} size="md" />
                  <CompareToggleButton productId={product.id} />
                </div>

                {product.best_for.length ? (
                  <div className="mt-4 border-t border-navy-100 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                      Best for
                    </p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {product.best_for.map((b) => (
                        <li key={b}>
                          <Badge tone="neutral" className="capitalize">
                            {b}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="container-page py-8" id="details">
        <ProductTabs
          tabs={[
            {
              id: "overview",
              label: "Overview",
              panel: (
                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <h2 className="mb-3 text-lg font-semibold">Pros &amp; cons</h2>
                    <ProsCons product={product} />
                  </div>
                  <div>
                    <h2 className="mb-3 text-lg font-semibold">
                      Estimated runtime examples
                    </h2>
                    <RuntimeExamples product={product} />
                  </div>
                </div>
              ),
            },
            {
              id: "specs",
              label: "Specifications",
              panel: <SpecTable product={product} />,
            },
            {
              id: "scores",
              label: "Scores",
              panel: <ScoreBreakdown score={score} productName={name} />,
            },
            {
              id: "compare",
              label: "Compare",
              panel: <QuickComparison product={product} />,
            },
            {
              id: "reviews",
              label: "Reviews",
              panel: (
                <Callout tone="neutral" title="PowerMatchLab does not host user reviews">
                  We do not collect visitor reviews, and we do not republish
                  Amazon star ratings or review counts because we have not
                  independently verified them. Check the current rating and
                  reviews on the product’s Amazon page.
                  <div className="mt-3">
                    <AmazonCta product={product} size="sm" withDisclosure={false} />
                  </div>
                </Callout>
              ),
            },
            {
              id: "qa",
              label: "Q&A",
              panel: (
                <Callout tone="neutral" title="No verified questions yet">
                  When we add a moderated Q&amp;A, answers will cite the official
                  source or a PowerMatchLab calculation. For sizing questions, the{" "}
                  <Link href="/power-calculator" className="underline">
                    Power Calculator
                  </Link>{" "}
                  gives an explainable answer now.
                </Callout>
              ),
            },
          ]}
        />
      </div>

      <div className="container-page pb-12">
        <Callout tone="warn" title="How to read this page">
          Specifications are manufacturer claims tied to the official source under
          Specifications → Provenance ({fmtText(product.official_source)}, last
          verified {fmtText(product.last_verified)}). The PowerMatch Score is a
          PowerMatchLab editorial assessment. Runtime figures are calculations,
          not tests. “Check Price on Amazon” currently opens the normal Amazon
          product page; see the{" "}
          <Link href="/affiliate-disclosure" className="underline">
            affiliate disclosure
          </Link>
          .
        </Callout>
      </div>
    </>
  );
}
