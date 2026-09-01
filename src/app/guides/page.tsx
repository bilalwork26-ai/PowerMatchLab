import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageIntro } from "@/components/layout/PageIntro";
import { JsonLd } from "@/components/ui/JsonLd";
import { fmtDate } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "Guides",
  description:
    "Plain-English guides to sizing, running and charging portable power stations. Educational first, then a hand-off to the calculator and comparison tools.",
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
      <PageIntro
        title="Guides"
        lead="Understand the concept, size it with the calculator, compare the shortlist, then decide. No thin, mass-generated SEO — each guide is written to actually answer the question."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ]}
      />
      <div className="container-page py-10">
        <ul className="grid gap-4 md:grid-cols-2">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="card flex h-full flex-col p-5 transition-shadow hover:shadow-lg"
              >
                <h2 className="text-lg font-semibold">{g.title}</h2>
                <p className="mt-2 flex-1 text-sm text-navy-600">
                  {g.metaDescription}
                </p>
                <span className="mt-4 text-xs text-navy-500">
                  Updated {fmtDate(g.lastUpdated)} · {g.sections.length} sections
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
