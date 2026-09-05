import Link from "next/link";
import type { BestForContent } from "@/content/best-for";
import { selectBestFor } from "@/lib/best-for";
import { getAllProducts } from "@/data/products";
import { getGuide } from "@/content/guides";
import { PageHero } from "@/components/layout/PageHero";
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
  const relatedGuides = (content.relatedGuideSlugs ?? [])
    .map((s) => getGuide(s))
    .filter((g): g is NonNullable<typeof g> => g !== undefined);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: content.title, path: `/${content.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[breadcrumbJsonLd(crumbs), faqJsonLd(content.faq)]}
      />
      <PageHero title={content.title} crumbs={crumbs} lead={content.intro[0]} />

      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          {content.intro.slice(1).map((p) => (
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

          {relatedGuides.length || content.studioLinkLabel ? (
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

          <section className="mt-8">
            <h2 className="text-lg font-bold text-white">
              Best picks for {content.title.replace("Best Power Stations for ", "")}
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
              {top.map((e) => (
                <div key={e.product.id}>
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone="brand" dark>#{e.rank} for this use</Badge>
                    {e.highlights.slice(0, 2).map((h) => (
                      <Badge key={h} tone="positive" dark>
                        {h}
                      </Badge>
                    ))}
                    {e.caveats.slice(0, 1).map((c) => (
                      <Badge key={c} tone="warn" dark>
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <ProductCard product={e.product} score={scores.get(e.product.id)} tone="dark" />
                </div>
              ))}
            </div>
            {top.length === 0 ? (
              <Callout tone="warn" dark className="mt-3">
                No catalog product is explicitly positioned for this use by its
                manufacturer. See the full catalog ranking below.
              </Callout>
            ) : null}
          </section>

          {others.length ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-white">Also in the catalog</h2>
              <p className="mt-1 text-sm text-navy-300">
                Not specifically positioned for this use, but shown for
                completeness with the relevant caveats.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {others.map((e) => (
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
