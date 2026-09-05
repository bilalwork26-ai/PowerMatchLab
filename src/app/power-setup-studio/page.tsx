import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/data/products";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { PowerSetupStudio } from "@/components/power-setup-studio/PowerSetupStudio";

export const metadata: Metadata = pageMetadata({
  title: "Power Setup Studio",
  description:
    "Visualize how energy moves through a solar-charged power station setup — pick a scenario, switch devices on and off, then calculate the capacity you need and see matching stations from the real 22-product catalog.",
  path: "/power-setup-studio",
});

export default function PowerSetupStudioPage() {
  const catalog = getAllProducts();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Power Setup Studio", path: "/power-setup-studio" },
        ])}
      />
      <PageHero
        title="Power Setup Studio"
        lead="Visualize how energy moves through your setup."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Power Setup Studio", path: "/power-setup-studio" },
        ]}
      />

      <div className="bg-navy-950 py-8 text-white">
        <div className="container-page">
          <p className="mx-auto mb-6 max-w-3xl text-sm text-navy-300">
            The illustrated battery in every scene represents the category of
            portable power station, not one specific product — PowerMatchLab
            does not manufacture or sell a battery of its own. Pick a scenario
            below, switch devices on and off, then calculate the capacity you
            need. Results are estimates based on your inputs and published
            manufacturer specifications, using the same formulas as the{" "}
            <Link href="/power-calculator" className="underline">
              Power Calculator
            </Link>
            . See{" "}
            <Link href="/about-methodology" className="underline">
              About &amp; Methodology
            </Link>{" "}
            and the{" "}
            <Link href="/editorial-policy" className="underline">
              Editorial Policy
            </Link>
            .
          </p>

          <PowerSetupStudio catalog={catalog} />
        </div>
      </div>
    </>
  );
}
