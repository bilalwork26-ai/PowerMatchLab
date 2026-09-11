import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What PowerMatchLab does and does not collect: the Power Calculator runs only in memory in your browser, the Compare tool stores your selection in local storage, and how the cookie-consent banner, Cloudflare Web Analytics and Google Analytics work.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  // Computed once per deployment from the build-time env var — this section
  // describes what this specific deployment actually does, not a hypothetical.
  const gaEnabled = Boolean(GA_MEASUREMENT_ID);
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

        <h2>Cookie consent</h2>
        <p>
          A banner appears on your first visit asking you to accept or reject
          optional cookies —{" "}
          {gaEnabled
            ? "currently Google Analytics and Google AdSense's advertising signals; see below for exactly what each does."
            : "currently only Google AdSense's advertising signals, since Google Analytics is not active on this deployment (see below)."}{" "}
          Until you choose, every consent-related signal (
          <code>analytics_storage</code>, <code>ad_storage</code>,{" "}
          <code>ad_user_data</code> and <code>ad_personalization</code>,
          using Google&rsquo;s Consent Mode v2) is set to{" "}
          <strong>denied</strong>
          {gaEnabled
            ? ", and Google Analytics is not loaded at all — not a reduced or anonymized version of it, nothing is requested from Google's analytics servers until you accept."
            : "."}{" "}
          Rejecting keeps it that way. Your choice is stored in your
          browser&rsquo;s local storage so you are not asked again, and you
          can change it at any time using the &ldquo;Cookie
          preferences&rdquo; link in the footer of every page.
        </p>

        <h2>Google AdSense</h2>
        <p>
          Every page loads Google&rsquo;s AdSense account-verification script
          (<code>adsbygoogle.js</code>), which is how Google confirms this
          site&rsquo;s ownership for the AdSense program — this one script
          loads regardless of your cookie choice, but the Consent Mode
          signals above are already set to <em>denied</em> by default before
          it runs, and updated the moment you accept or reject, so AdSense
          receives your real preference either way. No ad units are placed on
          the site yet. Loading this script means your browser makes a
          request to Google, and Google may set or read cookies on its own
          domains according to its own advertising and privacy policies —
          PowerMatchLab does not control that behavior and does not receive
          any data from it. If ad units are added later, this section will be
          updated to describe what is actually shown and what it does.
        </p>

        <h2>Cloudflare Web Analytics</h2>
        <p>
          Every page loads Cloudflare Web Analytics, which reports aggregated
          traffic statistics — things like page views, approximate visitor
          origin and country, device type, and page performance. As described
          in Cloudflare&rsquo;s own documentation, Web Analytics does not use
          cookies or <code>localStorage</code>, does not build individual
          visitor profiles, and does not use fingerprinting to identify
          returning visitors. Because it is cookie-free and does not process
          personal data the way Google Analytics does, it is not gated by the
          cookie-consent banner. It provides a smaller, coarser picture
          (aggregate traffic and performance only) than Google Analytics —
          {gaEnabled
            ? " see below for what GA4 adds on top of it."
            : " Google Analytics is not currently active on this deployment (see below), so this aggregate view is the only traffic measurement running right now."}
        </p>

        <h2>Google Analytics (GA4)</h2>
        {gaEnabled ? (
          <p>
            Only after you accept in the cookie banner does this site load
            Google Analytics 4, which uses first-party cookies (for example{" "}
            <code>_ga</code>) to measure traffic and understand how the
            site&rsquo;s tools are used. Beyond standard page views, we track
            a fixed set of interactions: starting or completing the Power
            Calculator, adding a product to or completing a Compare
            selection, viewing a product page, clicking a &ldquo;Check Price
            on Amazon&rdquo; link, and clicking a calculator link from a
            guide. These events record which action happened and, where
            relevant, a product id or guide slug from our own catalog —
            never the devices you entered, free-text search input, or
            anything else you typed. You can opt out of Google Analytics
            tracking across all sites using{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google&rsquo;s browser opt-out add-on
            </a>
            , or by using your browser&rsquo;s tracking-protection or
            cookie-blocking settings. See{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google&rsquo;s Privacy Policy
            </a>{" "}
            for how Google itself handles this data.
          </p>
        ) : (
          <p>
            <strong>Google Analytics is not currently active on this
            site.</strong> No Measurement ID is configured for this
            deployment, so no Google Analytics script is ever requested and
            no <code>_ga</code> cookie or similar is ever set — the cookie
            banner above only affects Google AdSense&rsquo;s advertising
            signals while this is the case. If Google Analytics is enabled
            on a future deployment, this section will be updated to describe
            exactly what it tracks, the same way it already does for AdSense
            above.
          </p>
        )}

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
