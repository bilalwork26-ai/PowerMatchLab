import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { ILLUSTRATIVE_CAPTION_LONG } from "@/lib/illustrations";

export const metadata: Metadata = pageMetadata({
  title: "Editorial Policy",
  description:
    "How PowerMatchLab decides what to publish: editorial independence, product inclusion and removal criteria, source priority, corrections, and how affiliate links relate to editorial content.",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Editorial Policy", path: "/editorial-policy" },
        ])}
      />
      <PageHero
        title="Editorial Policy"
        lead="How PowerMatchLab decides what to publish, where the numbers come from, and how corrections work."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Editorial Policy", path: "/editorial-policy" },
        ]}
      />
      <div className="bg-navy-950 py-10">
        <div className="container-page prose-pml max-w-3xl">
          <h2>Editorial independence</h2>
          <p>
            PowerMatchLab is an independent editorial project. We do not accept
            payment from manufacturers or retailers for placement, ratings,
            reviews or favourable coverage. Amazon Associates commissions fund
            the site, but they do not influence which products are listed, the
            PowerMatch Score or its dimensions, Best-For rankings, or
            recommendation status in the Power Calculator — those all come
            directly from the same dataset regardless of whether a given
            product carries an affiliate link. See the{" "}
            <Link href="/affiliate-disclosure">Affiliate Disclosure</Link> for
            the full commitment.
          </p>

          <h2>How products are selected</h2>
          <p>
            A product is added to the catalog once we have a working, direct
            Amazon.com listing for that exact model and a set of manufacturer
            specifications we can cite to an official source. A product is
            removed if its exact listing stops resolving to a purchasable page
            for that model — for example if the listing goes inactive, or the
            link now redirects to a different model or a generic search page.
            When a product is removed, we do not substitute a similar model,
            variant, or bundle in its place, and we remove its references
            throughout the site (related products, comparisons, guides,
            calculator results, sitemap) rather than leave a broken link or an
            orphaned page.
          </p>

          <h2>Three kinds of statement, kept separate</h2>
          <ul>
            <li>
              <strong>Manufacturer claim</strong> — a specification published
              by the maker, tied to an official source and a last-verified
              date.
            </li>
            <li>
              <strong>PowerMatchLab calculation</strong> — a figure computed
              from documented, disclosed assumptions (the Power Calculator,
              runtime estimates).
            </li>
            <li>
              <strong>Editorial assessment</strong> — our judgement, such as
              the PowerMatch Score or pros/cons framing.
            </li>
          </ul>
          <p>
            See <Link href="/about-methodology">About &amp; Methodology</Link>{" "}
            for exactly how each figure is produced.
          </p>

          <h2>Unknown data stays unknown</h2>
          <p>
            When a specification is not confirmed by an official source, we
            show <strong>“Not verified”</strong> rather than guess, round from
            a similar model, or borrow a competitor&rsquo;s figure. A field
            reading “Not verified” is not evidence of a bad product — it means
            we have not found a manufacturer-published number for it yet.
            Every verified product record carries a “last verified” date so
            you can see how current the data is.
          </p>

          <h2>Prices, availability and ratings</h2>
          <p>
            PowerMatchLab does not display Amazon prices, discounts, stock
            levels, star ratings or review counts, because we have no
            independently verified, continuously updated mechanism for them.
            Current pricing, availability and reviews live on the
            product&rsquo;s Amazon page, one click away through our link.
          </p>

          <h2>Corrections policy</h2>
          <p>
            If a specification, link, or claim on the site is wrong or out of
            date, treat it as a bug. Email{" "}
            <a href={`mailto:${SITE.email}`} className="underline">
              {SITE.email}
            </a>{" "}
            with the product name or page URL and what looks wrong. We check
            corrections against the manufacturer&rsquo;s own source before
            changing the record, and a correction to the underlying data flows
            through every page that cites it.
          </p>

          <h2>Affiliate links and editorial content</h2>
          <p>
            Editorial content — which products are covered, how they are
            scored, and what the guides recommend — is written and maintained
            independently of whether a product currently has an Amazon
            Associates link. See the{" "}
            <Link href="/affiliate-disclosure">Affiliate Disclosure</Link> for
            how the links themselves work.
          </p>

          <h2>Illustrative images</h2>
          <p>
            {ILLUSTRATIVE_CAPTION_LONG} These are original PowerMatchLab
            renders grouped by rough size class (compact, mid-size, large,
            whole-home backup) for visual variety — never a manufacturer
            photograph, certification logo, or trust seal.
          </p>
        </div>
      </div>
    </>
  );
}
