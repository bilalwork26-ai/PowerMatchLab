import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TOOLS, getTool } from "@/content/tools";
import { getGuide } from "@/content/guides";
import { getBestFor } from "@/content/best-for";
import { getComparison } from "@/content/comparisons";
import { getAllProducts } from "@/data/products";
import { pageMetadata, breadcrumbJsonLd, articleJsonLd, type Crumb } from "@/lib/seo";
import { BILAL_SIALI } from "@/lib/authors";
import { fmtDate } from "@/lib/format";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { LoadListCalculator, type LoadListCalculatorConfig } from "@/components/tools/LoadListCalculator";
import { CpapCalculator } from "@/components/tools/CpapCalculator";
import { StarlinkCalculator } from "@/components/tools/StarlinkCalculator";
import { ToolCalculatorSkeleton } from "@/components/tools/ToolCalculatorSkeleton";
import {
  REFRIGERATOR_PRESETS,
  RV_DEVICE_PRESETS,
  RV_AC_PRESETS,
  HOME_BACKUP_PRESETS,
} from "@/lib/tool-presets";

const LOAD_LIST_CONFIGS: Record<string, LoadListCalculatorConfig> = {
  "refrigerator-runtime-calculator": {
    calculatorType: "refrigerator_runtime",
    presets: REFRIGERATOR_PRESETS,
    seedKeys: ["household-fridge"],
    daysLabel: "Days of outage (no recharge)",
    daysMax: 10,
    quantityLabel: "Qty",
    showSimultaneousToggle: false,
    solarLabel: "Daily solar recharge (Wh, optional)",
    prefsConfig: { wantsExpandable: true, prioritisePortability: true },
    autonomyUnit: { singular: "day", plural: "days" },
    addExampleLabel: "Add example refrigerator/freezer",
    addCustomLabel: "Add custom unit",
    toolTitle: "Refrigerator & Freezer Runtime Calculator",
    toolPath: "/tools/refrigerator-runtime-calculator",
    allowDailyEnergyMode: true,
    allowSolarEstimator: true,
    showRuntimeIndexTable: true,
    allowShareAndExport: true,
    allowHoursDuration: true,
  },
  "rv-power-calculator": {
    calculatorType: "rv_power",
    presets: RV_DEVICE_PRESETS,
    seedKeys: ["rv-lights", "rv-fridge-12v", "rv-router"],
    daysLabel: "Days without shore power / recharge",
    daysMax: 14,
    quantityLabel: "Qty",
    showSimultaneousToggle: true,
    solarLabel: "Daily solar recharge (Wh, optional)",
    prefsConfig: { needsTT30: true, wantsExpandable: true, prioritisePortability: true },
    autonomyUnit: { singular: "day", plural: "days" },
    addExampleLabel: "Add example RV device",
    addCustomLabel: "Add custom device",
    toolTitle: "RV & Van Life Power Calculator",
    toolPath: "/tools/rv-power-calculator",
  },
  "rv-air-conditioner-runtime-calculator": {
    calculatorType: "rv_ac_runtime",
    presets: RV_AC_PRESETS,
    seedKeys: ["rv-ac-13500btu-typical"],
    daysLabel: "Days without shore power / recharge",
    daysMax: 7,
    quantityLabel: "Qty",
    showSimultaneousToggle: true,
    solarLabel: "Daily solar recharge (Wh, optional)",
    prefsConfig: { needsTT30: true, wantsExpandable: true, prioritisePortability: true },
    autonomyUnit: { singular: "day", plural: "days" },
    addExampleLabel: "Add example AC (by BTU)",
    addCustomLabel: "Add custom AC or load",
    toolTitle: "RV Air Conditioner Runtime & Surge Calculator",
    toolPath: "/tools/rv-air-conditioner-runtime-calculator",
    allowSolarEstimator: true,
    showRuntimeIndexTable: true,
    allowDutyCycleEstimator: true,
  },
  "home-backup-calculator": {
    calculatorType: "home_backup",
    presets: HOME_BACKUP_PRESETS,
    seedKeys: ["hb-fridge", "hb-lights", "hb-router"],
    daysLabel: "Days of outage (no recharge)",
    daysMax: 14,
    quantityLabel: "Qty",
    showSimultaneousToggle: true,
    solarLabel: "Daily solar recharge (Wh, optional)",
    prefsConfig: { needs240V: true, needsUpsTransfer: true, wantsExpandable: true },
    autonomyUnit: { singular: "day", plural: "days" },
    addExampleLabel: "Add essential home load",
    addCustomLabel: "Add custom load",
    toolTitle: "Home Backup Power Calculator",
    toolPath: "/tools/home-backup-calculator",
  },
};

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool)
    return pageMetadata({ title: "Tool not found", description: "", path: `/tools/${slug}`, noindex: true });
  return pageMetadata({ title: tool.title, description: tool.metaDescription, path: `/tools/${tool.slug}` });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const catalog = getAllProducts();
  const relatedGuides = tool.relatedGuideSlugs
    .map((s) => getGuide(s))
    .filter((g): g is NonNullable<typeof g> => g !== undefined);
  const relatedBestFor = tool.relatedBestForSlug ? getBestFor(tool.relatedBestForSlug) : undefined;
  const relatedComparison = tool.relatedComparisonSlug
    ? getComparison(tool.relatedComparisonSlug)
    : undefined;

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: tool.shortTitle, path: `/tools/${tool.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          articleJsonLd({
            headline: tool.title,
            description: tool.metaDescription,
            path: `/tools/${tool.slug}`,
            datePublished: tool.lastUpdated,
            author: { name: BILAL_SIALI.name, path: BILAL_SIALI.path },
          }),
        ]}
      />
      <PageHero title={tool.title} lead={tool.shortAnswer} crumbs={crumbs} />

      <div className="bg-navy-950 py-10 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <p className="text-sm text-navy-300">{tool.forWhom}</p>
            <p className="mt-1 text-xs text-navy-400">
              By{" "}
              <Link href={BILAL_SIALI.path} className="underline hover:text-cyan-300">
                {BILAL_SIALI.name}
              </Link>{" "}
              · Last updated {fmtDate(tool.lastUpdated)}
            </p>
            <p className="mt-1 text-xs text-navy-400">
              Compared dynamically against all {catalog.length} products currently in the
              PowerMatchLab catalog — never a fixed list.
            </p>

            <div className="mt-6 rounded-xl border border-navy-700 bg-navy-900/40 p-4 sm:p-6">
              <Suspense fallback={<ToolCalculatorSkeleton />}>
                {tool.calculatorKind === "load-list" ? (
                  <LoadListCalculator catalog={catalog} config={LOAD_LIST_CONFIGS[tool.slug]} />
                ) : tool.calculatorKind === "cpap" ? (
                  <CpapCalculator catalog={catalog} />
                ) : (
                  <StarlinkCalculator catalog={catalog} />
                )}
              </Suspense>
            </div>

            <article className="prose-pml mt-10 max-w-none">
              <div className="not-prose rounded-lg border border-cyan-700/40 bg-navy-900/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Formula</p>
                <p className="mt-1 text-sm text-navy-200">{tool.formula}</p>
              </div>

              {tool.sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2>{s.heading}</h2>
                  {s.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  {s.bullets ? (
                    <ul>
                      {s.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              <section className="not-prose my-8">
                <h2 className="mb-3 text-xl font-semibold text-white">Common mistakes</h2>
                <ul className="space-y-2 text-sm text-navy-200">
                  {tool.commonMistakes.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span aria-hidden="true" className="text-amber-300">
                        !
                      </span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {relatedGuides.length ? (
                <section className="not-prose my-8">
                  <h2 className="mb-3 text-xl font-semibold text-white">Related guides</h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {relatedGuides.map((g) => (
                      <li key={g.slug}>
                        <Link
                          href={`/guides/${g.slug}`}
                          className="block h-full rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4 text-sm font-semibold text-cyan-300 shadow-glow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-glow-cyan hover:underline"
                        >
                          {g.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="not-prose my-8">
                <h2 className="mb-3 text-xl font-semibold text-white">FAQ</h2>
                <div className="space-y-3">
                  {tool.faq.map((f) => (
                    <details
                      key={f.question}
                      className="group rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4 open:shadow-glow-soft"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-white">
                        {f.question}
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-cyan-300 transition-transform duration-200 group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-2 animate-fade-up text-sm text-navy-200">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <div className="not-prose mt-8 rounded-lg border border-navy-700 bg-navy-900/60 p-4 text-xs text-navy-300">
                <p className="font-semibold text-white">Sources</p>
                <ul className="mt-1 list-disc pl-5">
                  {tool.sources.map((s) => {
                    const label = typeof s === "string" ? s : s.label;
                    const url = typeof s === "string" ? undefined : s.url;
                    return (
                      <li key={label}>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-white"
                          >
                            {label}
                          </a>
                        ) : (
                          label
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3">
                  Last updated{" "}
                  {new Date(`${tool.lastUpdated}T00:00:00Z`).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                  . This tool performs calculations from the numbers you enter — it does
                  not measure, test or guarantee real-world performance. See{" "}
                  <Link href="/about-methodology" className="underline">
                    About &amp; Methodology
                  </Link>
                  .
                </p>
              </div>
            </article>
          </div>

          <aside className="order-first lg:order-none lg:sticky lg:top-20 lg:h-fit">
            <div className="glass-panel bg-navy-900/60 p-4">
              <h2 className="text-sm font-semibold text-white">Next steps</h2>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <Link href="/tools" className="text-cyan-300 hover:underline">
                    → All calculators
                  </Link>
                </li>
                {relatedBestFor ? (
                  <li>
                    <Link href={`/${relatedBestFor.slug}`} className="text-cyan-300 hover:underline">
                      → {relatedBestFor.title}
                    </Link>
                  </li>
                ) : null}
                {relatedComparison ? (
                  <li>
                    <Link
                      href={`/compare/${relatedComparison.slug}`}
                      className="text-cyan-300 hover:underline"
                    >
                      → {relatedComparison.h1}
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link href="/compare" className="text-cyan-300 hover:underline">
                    → Compare products side by side
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-cyan-300 hover:underline">
                    → Browse the full catalog
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
