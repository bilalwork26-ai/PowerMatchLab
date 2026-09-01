import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageIntro } from "@/components/layout/PageIntro";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Affiliate Disclosure",
  description:
    "How PowerMatchLab makes money, what the Amazon links are today, and our commitment not to let commissions influence rankings or scores.",
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Affiliate Disclosure", path: "/affiliate-disclosure" },
        ])}
      />
      <PageIntro
        title="Affiliate Disclosure"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Affiliate Disclosure", path: "/affiliate-disclosure" },
        ]}
      />
      <div className="container-page prose-pml max-w-3xl py-10">
        <h2>The short version</h2>
        <p>
          PowerMatchLab is reader-supported. We intend to join the Amazon
          Associates programme once the site is publicly registered. After that,
          some outbound links to Amazon will carry an affiliate tag and a
          qualifying purchase may earn us a commission at no extra cost to you.
        </p>

        <h2>What the links are right now</h2>
        <p>
          Today, no affiliate tag is applied. The “Check Price on Amazon” button
          uses the normal, direct Amazon product URL stored for each item. The
          internal <code>amazon_affiliate_url</code> field is empty and we do not
          fabricate tracking IDs or affiliate URLs. When affiliate links go live,
          this page and the button microcopy will say so, and affiliate links
          will use <code>rel=&quot;sponsored nofollow&quot;</code>.
        </p>

        <h2>What commissions do not affect</h2>
        <ul>
          <li>Which products appear in the catalog.</li>
          <li>The PowerMatch Score or its dimensions.</li>
          <li>Recommendation status in the Power Calculator.</li>
          <li>Best-For rankings, which are derived from the dataset.</li>
        </ul>
        <p>
          We do not accept payment from manufacturers or retailers for placement,
          ratings, reviews or favourable coverage.
        </p>

        <h2>Prices and availability</h2>
        <p>
          We do not display prices, discounts, stock levels or star ratings that
          we have not independently verified. Current pricing and availability
          live on Amazon and can change at any time.
        </p>

        <p>
          Questions about how the site works? See the{" "}
          <Link href="/about-methodology">Methodology</Link>.
        </p>
      </div>
    </>
  );
}
