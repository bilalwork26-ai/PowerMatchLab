import type { Metadata } from "next";
import Link from "next/link";
import { BILAL_SIALI } from "@/lib/authors";
import { SITE } from "@/lib/site";
import { pageMetadata, breadcrumbJsonLd, personJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";

const PATH = BILAL_SIALI.path;
const TITLE = BILAL_SIALI.name;
const DESCRIPTION = `${BILAL_SIALI.jobTitle} of PowerMatchLab. ${BILAL_SIALI.bio}`;

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function AuthorBilalSialiPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: BILAL_SIALI.name, path: PATH },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          personJsonLd({
            name: BILAL_SIALI.name,
            path: BILAL_SIALI.path,
            email: BILAL_SIALI.email,
            jobTitle: BILAL_SIALI.jobTitle,
            worksFor: SITE.name,
            knowsAbout: BILAL_SIALI.knowsAbout,
          }),
        ]}
      />
      <PageHero
        title={BILAL_SIALI.name}
        lead={`${BILAL_SIALI.jobTitle} of PowerMatchLab.`}
        crumbs={crumbs}
      >
        <div
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/40 bg-navy-800 text-xl font-semibold text-cyan-300"
        >
          BS
        </div>
      </PageHero>

      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page prose-pml max-w-3xl">
          <p className="text-base">{BILAL_SIALI.bio}</p>

          <h2>Editorial scope</h2>
          <p>Bilal&rsquo;s work on PowerMatchLab is limited to:</p>
          <ul>
            <li>Researching manufacturer-published specifications for the products in the catalog.</li>
            <li>Maintaining the site&rsquo;s transparent calculation methodology.</li>
            <li>
              Separating manufacturer claims, PowerMatchLab calculations, and editorial
              assessments so readers can tell which is which — see{" "}
              <Link href="/about-methodology">About &amp; Methodology</Link>.
            </li>
            <li>
              Correcting information when a reliable manufacturer source shows it is
              inaccurate.
            </li>
          </ul>

          <p>
            <strong>PowerMatchLab does not physically or laboratory-test products.</strong>{" "}
            Specifications are manufacturer-published claims, attributed by source and
            recorded with a &ldquo;last checked&rdquo; date on each product page. A value
            that cannot be confirmed is shown as &ldquo;Not verified&rdquo; rather than
            estimated.
          </p>

          <h2>Learn more</h2>
          <ul>
            <li>
              <Link href="/about-methodology">About &amp; Methodology</Link> — how every
              number on the site is calculated or sourced.
            </li>
            <li>
              <Link href="/editorial-policy">Editorial Policy</Link> — how products are
              added, removed, and reviewed.
            </li>
            <li>
              <Link href="/research/portable-power-station-specs-2026">
                Catalog Dataset Report
              </Link>{" "}
              — a transparent report on the underlying product dataset.
            </li>
            <li>
              <Link href="/power-calculator">Power Calculator</Link> — size a portable
              power station to your own devices.
            </li>
          </ul>

          <h2>Contact</h2>
          <p>
            Found an error or have a question about a specific specification? Email{" "}
            <a href={`mailto:${BILAL_SIALI.email}`} className="underline">
              {BILAL_SIALI.email}
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
