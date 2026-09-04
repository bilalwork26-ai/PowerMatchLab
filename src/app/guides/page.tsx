import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, GUIDE_GROUP_LABELS, type GuideGroup } from "@/content/guides";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { fmtDate } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "Guides",
  description:
    "Plain-English guides to sizing, running and charging portable power stations. Educational first, then a hand-off to the calculator and comparison tools.",
  path: "/guides",
});

/** Fixed display order for the four groups, independent of GUIDES array order. */
const GROUP_ORDER: GuideGroup[] = ["basics", "runtime", "use-cases", "charging-ownership"];

export default function GuidesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
      <PageHero
        title="Guides"
        lead="Understand the concept, size it with the calculator, compare the shortlist, then decide. No thin, mass-generated SEO — each guide is written to actually answer the question."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ]}
      />
      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page space-y-12">
          {GROUP_ORDER.map((group) => {
            const guidesInGroup = GUIDES.filter((g) => g.group === group);
            if (guidesInGroup.length === 0) return null;
            return (
              <section key={group} aria-labelledby={`group-${group}`}>
                <h2
                  id={`group-${group}`}
                  className="text-xl font-bold text-white sm:text-2xl"
                >
                  {GUIDE_GROUP_LABELS[group]}
                </h2>
                <ul className="mt-4 grid gap-4 md:grid-cols-2">
                  {guidesInGroup.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/guides/${g.slug}`}
                        className="flex h-full flex-col rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-5 shadow-glow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-glow-cyan"
                      >
                        <h3 className="text-lg font-semibold text-white">{g.title}</h3>
                        <p className="mt-2 flex-1 text-sm text-navy-300">
                          {g.metaDescription}
                        </p>
                        <span className="mt-4 text-xs text-navy-400">
                          Updated {fmtDate(g.lastUpdated)} · {g.sections.length} sections
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
