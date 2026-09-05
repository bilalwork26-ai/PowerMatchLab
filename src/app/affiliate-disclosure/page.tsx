import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Affiliate Disclosure",
  description:
    "PowerMatchLab is a participant in the Amazon Associates Program. How the Amazon links work today, and our commitment not to let commissions influence rankings or scores.",
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
      <PageHero
        title="Affiliate Disclosure"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Affiliate Disclosure", path: "/affiliate-disclosure" },
        ]}
      />
      <div className="bg-navy-950 py-10">
      <div className="container-page prose-pml max-w-3xl">
        <h2>The short version</h2>
        <p>
          PowerMatchLab is reader-supported and participates in the Amazon
          Services LLC Associates Program, an affiliate advertising program
          designed to provide a means for sites to earn advertising fees by
          advertising and linking to Amazon.com.
        </p>
        <p>
          <strong>As an Amazon Associate I earn from qualifying purchases.</strong>{" "}
          A qualifying purchase made after following a “Check Price on Amazon”
          link may earn PowerMatchLab a commission, at no extra cost to you.
        </p>

        <h2>What the links are right now</h2>
        <p>
          Every product in the catalog stores its own Amazon Associates link in
          the internal <code>amazon_affiliate_url</code> field, generated
          directly from our Associates account for that exact product page — we
          do not fabricate tracking IDs or affiliate URLs, and we do not point
          one product&rsquo;s button at a different product. If that field were
          ever empty for an item, the “Check Price on Amazon” button would fall
          back to the plain, direct <code>amazon_product_url</code> instead,
          rather than show a broken or guessed link. Every Amazon link, affiliate
          or not, carries{" "}
          <code>rel=&quot;nofollow sponsored noopener noreferrer&quot;</code> and
          opens in a new tab.
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
          <Link href="/about-methodology">Methodology</Link> and the{" "}
          <Link href="/editorial-policy">Editorial Policy</Link>, or{" "}
          <Link href="/contact">contact us</Link>.
        </p>
      </div>
      </div>
    </>
  );
}
