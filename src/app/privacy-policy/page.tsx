import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What PowerMatchLab does and does not collect: the Power Calculator runs only in memory in your browser, the Compare tool stores your selection in local storage, and no analytics or advertising is served today beyond a loaded AdSense verification script.",
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
      <PageHero
        title="Privacy Policy"
        lead="What PowerMatchLab actually collects, in plain language. Effective and last updated: September 5, 2026."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ]}
      />
      <div className="bg-navy-950 py-10">
      <div className="container-page prose-pml max-w-3xl">
        <h2>The Power Calculator</h2>
        <p>
          The Power Calculator runs entirely in your browser. The devices you
          enter, and the assumptions you adjust, are held only in memory for
          the current page — nothing is saved. Reloading the page, closing the
          tab, or navigating away clears it. It is never sent to
          PowerMatchLab or to anyone else.
        </p>

        <h2>The Compare tool</h2>
        <p>
          When you add a product to the comparison tray, its id is saved in
          your browser&rsquo;s local storage (under the key{" "}
          <code>pml.compare.v1</code>) so your selection survives a page
          reload or a new tab on the same device. This list of product ids
          never leaves your browser — it is not sent to PowerMatchLab or to
          any third party. Clearing your browser&rsquo;s site data removes it.
        </p>

        <h2>What we do not have</h2>
        <ul>
          <li>No account system and no login.</li>
          <li>
            No contact form, no newsletter, and no mailing list — the{" "}
            <Link href="/contact">Contact</Link> page is a plain{" "}
            <code>mailto:</code> link to {SITE.email}, not a form that stores
            your message on our servers.
          </li>
          <li>No visitor comments or user reviews.</li>
          <li>We do not sell or share personal information.</li>
        </ul>

        <h2>Google AdSense</h2>
        <p>
          Every page loads Google&rsquo;s AdSense account-verification script
          (<code>adsbygoogle.js</code>), which is how Google confirms this
          site&rsquo;s ownership for the AdSense program. No ad units are
          placed on the site yet. Loading this script means your browser
          makes a request to Google, and Google may set or read cookies on
          its own domains according to its own advertising and privacy
          policies — PowerMatchLab does not control that behavior and does
          not receive any data from it. If ad units are added later, this
          section will be updated to describe what is actually shown and
          what it does. We do not run Google Analytics or any other analytics
          script.
        </p>

        <h2>Server logs</h2>
        <p>
          Our hosting provider (Hostinger) may keep standard web server logs
          for security and reliability — things like IP address, user agent,
          the page requested, and a timestamp — the way essentially every
          web host does. We do not control or know Hostinger&rsquo;s exact
          retention period for these logs; see{" "}
          <a
            href="https://www.hostinger.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Hostinger&rsquo;s own privacy policy
          </a>{" "}
          for that detail rather than a figure we would have to guess.
        </p>

        <h2>Outbound links to Amazon</h2>
        <p>
          When you follow a “Check Price on Amazon” link you leave
          PowerMatchLab and Amazon&rsquo;s own privacy policy applies.
          PowerMatchLab is a participant in the Amazon Associates Program, so
          these outbound links include an affiliate tag that lets Amazon
          attribute a qualifying purchase to PowerMatchLab. See the{" "}
          <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
        </p>

        <h2>Children</h2>
        <p>
          PowerMatchLab is a general-audience information site and is not
          directed at children under 13.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If what the site collects or loads changes, this page will be
          updated to describe it accurately, and the date at the top will
          change. We do not claim a formal legal review of this policy.
        </p>

        <h2>Contact</h2>
        <p>
          Privacy questions or requests: {" "}
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
