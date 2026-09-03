import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { Callout } from "@/components/ui/Callout";

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
        lead="A template for the PowerMatchLab V1 build. The site owner should review and adapt this before public launch."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ]}
      />
      <div className="bg-navy-950 py-10">
      <div className="container-page prose-pml max-w-3xl">
        <Callout tone="warn" dark title="Pending review before public launch">
          This page is a drafted starting point, not a legally reviewed terms
          of use. The site owner — and, where required, legal counsel — must
          review and adapt it before public launch. Last updated 2026-09-01.
        </Callout>

        <h2>Information, not advice</h2>
        <p>
          PowerMatchLab provides general information and decision-support tools
          for portable power stations. It does not provide professional
          electrical, financial or safety advice. Always confirm specifications
          with the manufacturer and consult a licensed electrician for any home
          wiring, transfer switch or 240V installation.
        </p>

        <h2>Calculations are estimates</h2>
        <p>
          The Power Calculator, runtime tables and PowerMatch Score are estimates
          and editorial assessments based on stated assumptions and
          manufacturer-published specifications. They are provided “as is”, may
          contain errors, and should not be relied on as the sole basis for a
          purchase or a safety-critical decision. See the{" "}
          <Link href="/about-methodology">Methodology</Link> for exactly how each
          figure is produced.
        </p>

        <h2>No warranty</h2>
        <p>
          The site is provided without warranties of any kind, express or
          implied, including accuracy, fitness for a particular purpose, or
          uninterrupted availability. To the maximum extent permitted by law,
          PowerMatchLab is not liable for any loss arising from use of the site
          or reliance on its content.
        </p>

        <h2>Third-party links</h2>
        <p>
          Outbound links (including to Amazon) are provided for convenience.
          PowerMatchLab does not control and is not responsible for third-party
          sites, their content, pricing, availability or policies.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Site text, layout and the PowerMatchLab name are the property of the
          site owner. Brand names, model names and trademarks belong to their
          respective owners and are used for identification and comparison only.
        </p>

        <h2>Changes</h2>
        <p>
          These terms and the site’s content may change at any time. Continued
          use after a change constitutes acceptance of the updated terms.
        </p>
      </div>
      </div>
    </>
  );
}
