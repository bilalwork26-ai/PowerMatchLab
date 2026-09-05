import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "How to reach PowerMatchLab: questions about how the site works, corrections to product specifications or broken retailer links, privacy requests, and general feedback.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <PageHero
        title="Contact"
        lead="PowerMatchLab is an independent editorial project, not a company with a support team — but every message is read, and corrections are always welcome."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />
      <div className="bg-navy-950 py-10">
        <div className="container-page prose-pml max-w-3xl">
          <h2>Email</h2>
          <p>
            <a
              href={`mailto:${SITE.email}`}
              className="text-lg font-semibold underline"
            >
              {SITE.email}
            </a>
          </p>

          <h2>What this address is for</h2>
          <ul>
            <li>Questions about how PowerMatchLab works.</li>
            <li>
              Corrections to product specifications, or a broken/incorrect
              retailer link on a product page.
            </li>
            <li>Privacy-related requests.</li>
            <li>General feedback.</li>
          </ul>

          <h2>Corrections</h2>
          <p>
            If a specification, a link, or a claim on this site is wrong or out
            of date, that is a bug we want to fix. Include the product name (or
            page URL) and what looks wrong, and we will check it against the
            manufacturer&rsquo;s own source. See the{" "}
            <Link href="/editorial-policy">Editorial Policy</Link> for how
            corrections are handled, and{" "}
            <Link href="/about-methodology">About &amp; Methodology</Link> for
            how the site is built.
          </p>

          <h2>What this is not</h2>
          <p>
            This address does not create an account, subscribe you to a
            newsletter, or add you to any mailing list — PowerMatchLab does not
            operate one. There is no contact form on this page and no message
            is stored anywhere except in the inbox that receives it.
          </p>
        </div>
      </div>
    </>
  );
}
