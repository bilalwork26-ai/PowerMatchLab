import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageIntro } from "@/components/layout/PageIntro";
import { JsonLd } from "@/components/ui/JsonLd";
import { Callout } from "@/components/ui/Callout";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What PowerMatchLab does and does not collect. The Power Calculator and Compare tools run in your browser; your device list and selections stay local.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ])}
      />
      <PageIntro
        title="Privacy Policy"
        lead="This is a template privacy policy for the PowerMatchLab V1 build. It must be reviewed by the site owner (and, where required, legal counsel) before public launch."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ]}
      />
      <div className="container-page prose-pml max-w-3xl py-10">
        <Callout tone="warn" title="Pending review before public launch">
          This page is a drafted starting point, not a legally reviewed
          policy. It must be reviewed by the site owner — and, where
          required, legal counsel — before launch. Outstanding items are
          flagged inline below (contact method, hosting provider log
          retention, analytics). Last updated 2026-09-01.
        </Callout>

        <h2>Tools run in your browser</h2>
        <p>
          The Power Calculator and the Compare tool run entirely in your browser.
          The devices you enter and the products you select to compare are stored
          only in your browser’s local storage on your device. They are not sent
          to PowerMatchLab and are not shared. Clearing your browser storage
          removes them.
        </p>

        <h2>What we do not do in V1</h2>
        <ul>
          <li>No account system and no login.</li>
          <li>No newsletter or contact form collecting personal data.</li>
          <li>No advertising or advertising cookies.</li>
          <li>No selling or sharing of personal information.</li>
        </ul>

        <h2>Server logs</h2>
        <Callout tone="warn" title="Not yet confirmed">
          The hosting provider may keep standard technical logs (IP address,
          user agent, requested URL, timestamp) for security and reliability.
          The site owner must confirm the actual provider&rsquo;s retention
          period and document it here before launch — no retention period is
          stated yet because none has been verified.
        </Callout>

        <h2>Analytics</h2>
        <p>
          No analytics service is bundled in this build. If privacy-respecting
          analytics are added later, this section must be updated to name the
          provider, the data collected, and how to opt out.
        </p>

        <h2>Outbound links to Amazon</h2>
        <p>
          When you follow a “Check Price on Amazon” link you leave PowerMatchLab
          and Amazon’s own privacy policy applies. Once the Amazon Associates
          programme is active, outbound links may include an affiliate tag that
          lets Amazon attribute a purchase to PowerMatchLab. See the{" "}
          <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
        </p>

        <h2>Children</h2>
        <p>
          PowerMatchLab is a general-audience information site and is not directed
          at children under 13.
        </p>

        <h2>Contact</h2>
        <Callout tone="warn" title="No contact method published yet">
          No email address or contact form is published for this site yet.
          One must be added here before launch so visitors have a real way to
          raise privacy questions or corrections — this section intentionally
          does not display a placeholder or invented address in the meantime.
        </Callout>
      </div>
    </>
  );
}
