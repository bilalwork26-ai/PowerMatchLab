import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, getGuide } from "@/content/guides";
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
import { PageIntro } from "@/components/layout/PageIntro";
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
      <PageIntro title={guide.title} crumbs={crumbs} />

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_280px]">
        <article className="prose-pml max-w-none">
          {guide.intro.map((p) => (
            <p key={p} className="text-base">
              {p}
            </p>
          ))}

          <nav aria-label="On this page" className="my-6 rounded-lg border border-navy-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              On this page
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {guide.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-brand-700 hover:underline">
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

          <Callout tone="info" title="Put a number on it" className="my-8">
            The{" "}
            <Link href="/power-calculator" className="underline">
              Power Calculator
            </Link>{" "}
            turns the ideas above into a capacity and output target for your exact
            devices, then shows which stations can deliver it.
          </Callout>

          {related.length ? (
            <section className="not-prose my-8">
              <h2 className="mb-3 text-xl font-semibold">Related products</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} score={scores.get(p.id)} />
                ))}
              </div>
              <Link
                href={`/compare?ids=${related.map((p) => p.id).join(",")}`}
                className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:underline"
              >
                Compare these →
              </Link>
            </section>
          ) : null}

          {relatedGuides.length ? (
            <section className="not-prose my-8">
              <h2 className="mb-3 text-xl font-semibold">Related guides</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {relatedGuides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="card block h-full p-4 text-sm font-semibold text-brand-700 hover:underline"
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
              <h2 className="mb-3 text-xl font-semibold">FAQ</h2>
              <dl className="space-y-3">
                {guide.faq.map((f) => (
                  <div key={f.question} className="card p-4">
                    <dt className="font-semibold text-navy-900">{f.question}</dt>
                    <dd className="mt-1 text-sm text-navy-600">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <div className="not-prose mt-8 rounded-lg border border-navy-100 bg-navy-50 p-4 text-xs text-navy-600">
            <p className="font-semibold text-navy-800">Sources</p>
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
                        className="underline hover:text-navy-800"
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
              what <code>products.json</code> verifies. PowerMatchLab may earn a
              commission from Amazon links once the Associates programme is active
              — see the{" "}
              <Link href="/affiliate-disclosure" className="underline">
                disclosure
              </Link>
              .
            </p>
          </div>
        </article>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="card p-4">
            <h2 className="text-sm font-semibold">Next steps</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/power-calculator" className="text-brand-700 hover:underline">
                  → Calculate your power needs
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-brand-700 hover:underline">
                  → Compare products side by side
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-brand-700 hover:underline">
                  → Browse the full catalog
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
