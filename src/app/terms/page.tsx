import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "The terms for using PowerMatchLab: information is provided as-is for guidance, calculations are estimates, and you are responsible for verifying specs and electrical safety.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ])}
      />
      <PageHero
        title="Terms of Use"
        lead="Effective and last updated: September 5, 2026."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ]}
      />
      <div className="bg-navy-950 py-10">
      <div className="container-page prose-pml max-w-3xl">
        <h2>Information, not advice</h2>
        <p>
          PowerMatchLab provides general information and decision-support tools
          for portable power stations. It does not provide professional
          electrical, financial or safety advice. Always confirm specifications
          with the manufacturer, and consult a licensed electrician for any home
          wiring, transfer switch, or 240V installation.
        </p>

        <h2>Calculations are estimates</h2>
        <p>
          The Power Calculator, runtime tables and PowerMatch Score are estimates
          and editorial assessments based on stated assumptions and
          manufacturer-published specifications. They are provided “as is”, may
          contain errors, and should not be relied on as the sole basis for a
          purchase or a safety-critical decision. See{" "}
          <Link href="/about-methodology">About &amp; Methodology</Link> for
          exactly how each figure is produced.
        </p>

        <h2>No warranty</h2>
        <p>
          The site is provided without warranties of any kind, express or
          implied, including accuracy, fitness for a particular purpose, or
          uninterrupted availability. To the maximum extent permitted by
          applicable law, PowerMatchLab is not liable for any loss arising from
          use of the site or reliance on its content.
        </p>

        <h2>Third-party links</h2>
        <p>
          Outbound links (including to Amazon) are provided for convenience.
          PowerMatchLab does not control and is not responsible for third-party
          sites, their content, pricing, availability or policies. See the{" "}
          <Link href="/affiliate-disclosure">Affiliate Disclosure</Link> for how
          Amazon links specifically work.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Site text, layout, illustrations and the PowerMatchLab name belong to
          PowerMatchLab. Brand names, model names and trademarks referenced for
          comparison belong to their respective owners; PowerMatchLab is not
          affiliated with or endorsed by any of the manufacturers whose
          products it covers, except through the Amazon Associates Program
          described in the Affiliate Disclosure.
        </p>

        <h2>Changes</h2>
        <p>
          These terms and the site&rsquo;s content may change at any time.
          Continued use after a change constitutes acceptance of the updated
          terms. We do not claim these terms have been reviewed by a lawyer.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms: {" "}
          <a href={`mailto:${SITE.email}`} className="underline">
            {SITE.email}
          </a>
          .
        </p>
      </div>
      </div>
    </>
  );
}
