import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, getGuide } from "@/content/guides";
import { getBestFor } from "@/content/best-for";
import { getProductsByIds } from "@/data/products";
import { scoreCatalog } from "@/lib/score";
import { getAllProducts } from "@/data/products";
import {
  pageMetadata,
  breadcrumbJsonLd,
  articleJsonLd,
  faqJsonLd,
  type Crumb,
} from "@/lib/seo";
import { fmtDate } from "@/lib/format";
import { resolveAmazonLink } from "@/lib/amazon";
import { PageHero } from "@/components/layout/PageHero";
import { ProductCard } from "@/components/product/ProductCard";
import { Callout } from "@/components/ui/Callout";
import { JsonLd } from "@/components/ui/JsonLd";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide)
    return pageMetadata({
      title: "Guide not found",
      description: "",
      path: `/guides/${slug}`,
      noindex: true,
    });
  return pageMetadata({
    title: guide.title,
    description: guide.metaDescription,
    path: `/guides/${guide.slug}`,
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = getProductsByIds(guide.relatedProductIds);
  const scores = scoreCatalog(getAllProducts());
  const relatedGuides = (guide.relatedGuideSlugs ?? [])
    .map((s) => getGuide(s))
    .filter((g): g is NonNullable<typeof g> => g !== undefined);
  const relatedBestFor = guide.relatedBestForSlug
    ? getBestFor(guide.relatedBestForSlug)
    : undefined;
  const anyAffiliateLink = related.some((p) => resolveAmazonLink(p).isAffiliate);
  const allAffiliateLinks =
    related.length > 0 && related.every((p) => resolveAmazonLink(p).isAffiliate);

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          articleJsonLd({
            headline: guide.title,
            description: guide.metaDescription,
            path: `/guides/${guide.slug}`,
            datePublished: guide.lastUpdated,
          }),
          faqJsonLd(guide.faq),
        ]}
      />
      <PageHero title={guide.title} crumbs={crumbs} />

      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_280px]">
        <article className="prose-pml max-w-none">
          <p className="not-prose -mt-2 mb-4 text-xs text-navy-400">
            By{" "}
            <Link href="/editorial-policy" className="underline hover:text-cyan-300">
              PowerMatchLab Editorial
            </Link>{" "}
            · Last updated {fmtDate(guide.lastUpdated)}
          </p>

          {guide.intro.map((p) => (
            <p key={p} className="text-base">
              {p}
            </p>
          ))}

          {guide.keyTakeaways?.length ? (
            <div className="not-prose my-6 rounded-lg border border-cyan-700/40 bg-navy-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                Key takeaways
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-navy-200">
                {guide.keyTakeaways.map((k) => (
                  <li key={k} className="flex gap-2">
                    <span aria-hidden="true" className="text-cyan-300">
                      ✓
                    </span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <nav
            aria-label="On this page"
            className="my-6 rounded-lg border border-navy-700 bg-navy-900/60 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              On this page
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {guide.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-cyan-300 hover:underline">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {guide.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2>{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.bullets ? (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <Callout tone="info" dark title="Put a number on it" className="my-8">
            The{" "}
            <Link href="/power-calculator" className="underline">
              Power Calculator
            </Link>{" "}
            turns the ideas above into a capacity and output target for your exact
            devices, then shows which stations can deliver it.
          </Callout>

          {related.length ? (
            <section className="not-prose my-8">
              <h2 className="mb-3 text-xl font-semibold text-white">Related products</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} score={scores.get(p.id)} tone="dark" />
                ))}
              </div>
              <Link
                href={`/compare?ids=${related.map((p) => p.id).join(",")}`}
                className="mt-3 inline-flex text-sm font-semibold text-cyan-300 hover:underline"
              >
                Compare these →
              </Link>
            </section>
          ) : null}

          {relatedGuides.length ? (
            <section className="not-prose my-8">
              <h2 className="mb-3 text-xl font-semibold text-white">Related guides</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {relatedGuides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="block h-full rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4 text-sm font-semibold text-cyan-300 shadow-glow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-glow-cyan hover:underline"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {guide.faq.length ? (
            <section className="not-prose my-8">
              <h2 className="mb-3 text-xl font-semibold text-white">FAQ</h2>
              <div className="space-y-3">
                {guide.faq.map((f) => (
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
          ) : null}

          <div className="not-prose mt-8 rounded-lg border border-navy-700 bg-navy-900/60 p-4 text-xs text-navy-300">
            <p className="font-semibold text-white">Sources</p>
            <ul className="mt-1 list-disc pl-5">
              {guide.sources.map((s) => {
                const label = typeof s === "string" ? s : s.label;
                const url = typeof s === "string" ? undefined : s.url;
                return (
                  <li key={label}>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                      >
                        {label}
                      </a>
                    ) : (
                      label
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3">
              Last updated {fmtDate(guide.lastUpdated)}. This guide is educational
              and general; it does not assert product-specific performance beyond
              what <code>products.json</code> verifies.{" "}
              {allAffiliateLinks
                ? "As an Amazon Associate, PowerMatchLab earns from qualifying purchases made through the Amazon links on this page"
                : anyAffiliateLink
                  ? "Some Amazon links on this page are PowerMatchLab Associates links (we may earn from qualifying purchases); others are normal Amazon product links with no affiliate tracking yet"
                  : "The Amazon links on this page are normal product links; affiliate tracking has not been added for these products yet"}{" "}
              — see the{" "}
              <Link href="/affiliate-disclosure" className="underline">
                disclosure
              </Link>
              .
            </p>
          </div>
        </article>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="glass-panel bg-navy-900/60 p-4">
            <h2 className="text-sm font-semibold text-white">Next steps</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/power-calculator" className="text-cyan-300 hover:underline">
                  → Calculate your power needs
                </Link>
              </li>
              {relatedBestFor ? (
                <li>
                  <Link
                    href={`/${relatedBestFor.slug}`}
                    className="text-cyan-300 hover:underline"
                  >
                    → {relatedBestFor.title}
                  </Link>
                </li>
              ) : null}
              {guide.studioLinkLabel ? (
                <li>
                  <Link href="/power-setup-studio" className="text-cyan-300 hover:underline">
                    → {guide.studioLinkLabel}
                  </Link>
                </li>
              ) : null}
              <li>
                <Link href="/compare" className="text-cyan-300 hover:underline">
                  → Compare products side by side
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-cyan-300 hover:underline">
                  → Browse the full catalog
                </Link>
              </li>
            </ul>
          </div>
        </aside>
        </div>
      </div>
    </>
  );
}
