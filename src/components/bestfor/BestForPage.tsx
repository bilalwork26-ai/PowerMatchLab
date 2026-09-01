import Link from "next/link";
import type { BestForContent } from "@/content/best-for";
import { selectBestFor } from "@/lib/best-for";
import { getAllProducts } from "@/data/products";
import { PageIntro } from "@/components/layout/PageIntro";
import { ProductCard } from "@/components/product/ProductCard";
import { Callout } from "@/components/ui/Callout";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { scoreCatalog } from "@/lib/score";

export function BestForPage({ content }: { content: BestForContent }) {
  const catalog = getAllProducts();
  const scores = scoreCatalog(catalog);
  const entries = selectBestFor(content.key, catalog);
  const top = entries.filter((e) => e.tagMatch);
  const others = entries.filter((e) => !e.tagMatch);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: content.title, path: `/${content.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[breadcrumbJsonLd(crumbs), faqJsonLd(content.faq)]}
      />
      <PageIntro title={content.title} crumbs={crumbs} lead={content.intro[0]} />

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          {content.intro.slice(1).map((p) => (
            <p key={p} className="mb-4 text-[15px] leading-7 text-navy-700">
              {p}
            </p>
          ))}

          <section className="mt-4">
            <h2 className="text-lg font-bold">What actually matters</h2>
            <dl className="mt-3 space-y-3">
              {content.whatMatters.map((w) => (
                <div key={w.heading} className="card p-4">
                  <dt className="font-semibold text-navy-900">{w.heading}</dt>
                  <dd className="mt-1 text-sm text-navy-600">{w.detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold">Common mistakes</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-navy-700">
              {content.commonMistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold">How we pick for this use</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-navy-700">
              {content.compatibilityLogic.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <Callout tone="neutral" className="mt-4">
              The ranking below is derived from <code>products.json</code> using
              only verified fields. It is not a “we bought and tested these” list.
              Run the{" "}
              <Link href="/power-calculator" className="underline">
                Power Calculator
              </Link>{" "}
              for a recommendation tied to your specific load.
            </Callout>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold">
              Best picks for {content.title.replace("Best Power Stations for ", "")}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {top.map((e) => (
                <div key={e.product.id}>
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone="brand">#{e.rank} for this use</Badge>
                    {e.highlights.slice(0, 2).map((h) => (
                      <Badge key={h} tone="positive">
                        {h}
                      </Badge>
                    ))}
                    {e.caveats.slice(0, 1).map((c) => (
                      <Badge key={c} tone="warn">
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <ProductCard product={e.product} score={scores.get(e.product.id)} />
                </div>
              ))}
            </div>
            {top.length === 0 ? (
              <Callout tone="warn" className="mt-3">
                No catalog product is explicitly positioned for this use by its
                manufacturer. See the full catalog ranking below.
              </Callout>
            ) : null}
          </section>

          {others.length ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold">Also in the catalog</h2>
              <p className="mt-1 text-sm text-navy-600">
                Not specifically positioned for this use, but shown for
                completeness with the relevant caveats.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {others.map((e) => (
                  <div key={e.product.id}>
                    {e.caveats.length ? (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {e.caveats.map((c) => (
                          <Badge key={c} tone="warn">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <ProductCard
                      product={e.product}
                      score={scores.get(e.product.id)}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="text-lg font-bold">FAQ</h2>
            <dl className="mt-3 space-y-3">
              {content.faq.map((f) => (
                <div key={f.question} className="card p-4">
                  <dt className="font-semibold text-navy-900">{f.question}</dt>
                  <dd className="mt-1 text-sm text-navy-600">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="mt-8 text-xs text-navy-500">
            Last updated {content.lastUpdated}. Specifications are manufacturer
            claims; PowerMatchLab has not physically tested these units.
          </p>
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="card p-4">
            <h2 className="text-sm font-semibold">Size it precisely</h2>
            <p className="mt-1 text-sm text-navy-600">
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
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              Compare products
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
