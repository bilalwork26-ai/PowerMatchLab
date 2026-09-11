import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/content/tools";
import { pageMetadata, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  BoltIcon,
  CalculatorIcon,
  InfoIcon,
  ScaleIcon,
  SunIcon,
} from "@/components/ui/icons";

interface HubEntry {
  href: string;
  title: string;
  body: string;
  Icon: typeof CalculatorIcon;
  badge?: string;
}

const GENERAL_TOOLS: HubEntry[] = [
  {
    href: "/power-calculator",
    title: "Power Calculator",
    body: "The general-purpose calculator: add any mix of devices, set usage and runtime, and get an explainable capacity/output recommendation from the full catalog.",
    Icon: CalculatorIcon,
  },
  {
    href: "/power-setup-studio",
    title: "Power Setup Studio",
    body: "Visualize how energy moves through a solar-charged setup in real time — pick a scenario, switch devices on and off, and see matching stations.",
    Icon: BoltIcon,
  },
  {
    href: "/guides/how-long-to-charge-power-station-with-solar",
    title: "Solar Charging Calculator",
    body: "Estimate how long a solar panel takes to recharge a station's battery, with reference tables by capacity and panel wattage. Lives inside the solar charging guide, not a separate page.",
    Icon: SunIcon,
    badge: "In a guide",
  },
  {
    href: "/compare",
    title: "Comparator",
    body: "Line up to four power stations side by side, with a PowerMatch Score where the underlying data supports one.",
    Icon: ScaleIcon,
  },
];

export const metadata: Metadata = pageMetadata({
  title: "Power Station Calculators & Tools",
  description:
    "Every PowerMatchLab calculator in one place: general power sizing, refrigerator/freezer, CPAP, RV, Starlink, home backup, solar charging time, and the product comparator.",
  path: "/tools",
});

export default function ToolsHubPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
  ];

  const allEntries: { name: string; path: string }[] = [
    ...GENERAL_TOOLS.map((t) => ({ name: t.title, path: t.href })),
    ...TOOLS.map((t) => ({ name: t.shortTitle, path: `/tools/${t.slug}` })),
  ];

  return (
    <>
      <JsonLd
        data={[breadcrumbJsonLd(crumbs), itemListJsonLd(allEntries)]}
      />
      <PageHero
        title="Power Station Calculators & Tools"
        lead="One shared, transparent calculation engine behind every specialized tool below — the same formulas, the same real catalog, applied to your specific use case."
        crumbs={crumbs}
      />

      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page">
          <p className="max-w-3xl text-sm text-navy-300">
            Every calculator on this page uses the same underlying engine: continuous
            output, daily energy, usable capacity, reserve headroom, and a
            deterministic product-matching step against the live catalog. A
            specialized tool just pre-configures that engine for one situation —
            fixing a fix to the shared math updates every tool at once. See{" "}
            <Link href="/about-methodology" className="underline hover:text-cyan-300">
              About &amp; Methodology
            </Link>{" "}
            for the full formula set and assumptions.
          </p>

          <h2 className="mt-10 text-xl font-bold text-white">General tools</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {GENERAL_TOOLS.map(({ href, title, body, Icon, badge }) => (
              <Link
                key={href}
                href={href}
                className="glass-panel group flex h-full flex-col p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-glow-cyan"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 text-navy-950 shadow-glow-soft">
                    <Icon />
                  </span>
                  {badge ? (
                    <span className="rounded-full border border-navy-700 bg-navy-900/60 px-2 py-0.5 text-[11px] font-medium text-navy-300">
                      {badge}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-navy-300">{body}</p>
                <span className="mt-3 text-sm font-semibold text-cyan-300 group-hover:underline">
                  Open →
                </span>
              </Link>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-bold text-white">Specialized calculators</h2>
          <p className="mt-1 max-w-3xl text-sm text-navy-300">
            Each one pre-loads the presets, hard requirements and result fields
            relevant to one use case, so you don&rsquo;t have to configure the
            general calculator from scratch.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="glass-panel group flex h-full flex-col p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-glow-cyan"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 text-navy-950 shadow-glow-soft">
                  <InfoIcon />
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">{t.shortTitle}</h3>
                <p className="mt-1.5 flex-1 text-sm text-navy-300">{t.shortAnswer}</p>
                <span className="mt-3 text-sm font-semibold text-cyan-300 group-hover:underline">
                  Open calculator →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 rounded-lg border border-navy-700 bg-navy-900/60 p-4 text-xs text-navy-300">
            Every result on this site is a calculation from the numbers you enter
            plus documented assumptions — never a measured or guaranteed outcome,
            and never a substitute for checking a device&rsquo;s own rating label
            or a licensed electrician for household wiring. Product recommendations
            use only <code>products.json</code> and never fabricate a price,
            rating, or availability.
          </div>
        </div>
      </div>
    </>
  );
}
