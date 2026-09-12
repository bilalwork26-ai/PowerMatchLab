import Link from "next/link";
import { groupRecommendations, type Recommendation } from "@/lib/recommend";
import type { SolarAdjustedResult } from "@/lib/tools-engine";
import { estimateAutonomyUnits } from "@/lib/tools-engine";
import { fmtWh } from "@/lib/format";
import { Callout } from "@/components/ui/Callout";
import { EstimateFactorsDisclosure } from "@/components/ui/EstimateFactorsDisclosure";
import { EnergyLines } from "@/components/ui/EnergyLines";
import { AnimatedStat } from "@/components/ui/AnimatedStat";
import { RecommendationCard } from "@/components/calculator/RecommendationCard";
import { ToolResultStat } from "./ToolPrefCheckbox";
import { formatAutonomy } from "./shared";

export interface ToolStat {
  label: string;
  value: string;
}

/**
 * Shared results + recommendations renderer for every /tools calculator.
 * Every number displayed here comes from `calculatePower` / `recommendProducts`
 * / `applySolarOffset` — this component only formats and lays them out, so a
 * future fix to the shared formulas shows up identically on every tool.
 */
export function ToolResultsBlock({
  ready,
  notReadyMessage,
  headlineLabel,
  headlineValueWh,
  formulaText,
  stats,
  solar,
  efficiency,
  autonomyDailyEnergyWh,
  autonomyUnit,
  recommendations,
}: {
  ready: boolean;
  notReadyMessage: string;
  headlineLabel: string;
  headlineValueWh: number;
  formulaText: string;
  stats: ToolStat[];
  solar?: SolarAdjustedResult | null;
  efficiency: number;
  /** Daily energy figure used for the per-product "estimated autonomy" stat. */
  autonomyDailyEnergyWh: number;
  autonomyUnit: { singular: string; plural: string };
  recommendations: Recommendation[];
}) {
  if (!ready) {
    return (
      <Callout tone="warn" dark live className="mt-4">
        {notReadyMessage}
      </Callout>
    );
  }

  const { primary, oversized, possible, notSuitable } = groupRecommendations(recommendations);

  const withAutonomy = (rec: Recommendation) => {
    const units = estimateAutonomyUnits(
      rec.product.capacity_wh,
      autonomyDailyEnergyWh,
      efficiency,
    );
    return {
      label: `Estimated ${autonomyUnit.plural} from this unit's own capacity`,
      value: formatAutonomy(units, autonomyUnit.singular, autonomyUnit.plural),
    };
  };

  return (
    <>
      <div className="surface-dark relative mt-4 overflow-hidden p-5 text-white">
        <EnergyLines className="opacity-30" />
        <div className="relative">
          <p className="text-sm text-navy-300">{headlineLabel}</p>
          <p className="mt-1 text-4xl font-bold">
            <AnimatedStat value={headlineValueWh} />{" "}
            <span className="text-xl font-medium text-navy-300">Wh</span>
          </p>
          <p className="mt-1 text-xs text-navy-400">{formulaText}</p>

          {solar ? (
            <div className="mt-3 rounded-lg border border-cyan-700/40 bg-navy-900/60 p-3 text-xs text-navy-200">
              {solar.fullyOffsetBySolar ? (
                <p>
                  Your stated solar input ({fmtWh(solar.dailySolarWh)}/day) covers the
                  full daily energy need — the battery mainly serves as a buffer for
                  overnight or low-sun periods, not the entire load.
                </p>
              ) : (
                <p>
                  Solar contributes an estimated {fmtWh(solar.solarContributionWh)}/day,
                  leaving a daily deficit of {fmtWh(solar.dailyDeficitWh)} that the
                  battery must supply. This is a planning estimate, not a guarantee of
                  actual sun conditions.
                </p>
              )}
            </div>
          ) : null}

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <ToolResultStat key={s.label} label={s.label} value={s.value} />
            ))}
          </dl>
        </div>
      </div>

      <EstimateFactorsDisclosure className="mt-4" />

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link
          href="/about-methodology#calculator"
          className="rounded-md bg-navy-800 px-2.5 py-1 font-medium text-navy-200 hover:bg-navy-700"
        >
          How this is calculated
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recommended Power Stations</h3>
          <Link href="/compare" className="text-sm font-medium text-cyan-300 hover:underline">
            Compare your shortlist →
          </Link>
        </div>
        <p className="mt-1 text-sm text-navy-300">
          Every product in the catalog is classified against your requirement using
          the same engine as the Power Calculator: first compatibility (does it meet
          every hard requirement), then how proportionate it is to your need. Units
          that fail a hard requirement are shown as <strong>Not Suitable</strong>{" "}
          with the reason, rather than hidden — and units far larger than you need
          are labeled <strong>Oversized</strong> rather than presented as a top pick.
        </p>

        {primary.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {primary.map((rec) => (
              <RecommendationCard
                key={rec.product.id}
                rec={rec}
                tone="dark"
                extraStat={withAutonomy(rec)}
              />
            ))}
          </div>
        ) : (
          <Callout tone="warn" dark live className="mt-4">
            No product in the current catalog is a proportionate match for this
            requirement.{" "}
            {oversized.length
              ? "Larger, oversized alternatives are listed below."
              : 'The closest options are listed under "Possible match" below — check their limitations carefully.'}
          </Callout>
        )}

        {oversized.length ? (
          <details className="mt-6" open={primary.length === 0}>
            <summary className="cursor-pointer text-sm font-semibold text-navy-200">
              Oversized alternatives — larger than you need ({oversized.length})
            </summary>
            <p className="mt-2 text-xs text-navy-400">
              These fully meet your requirement but carry much more capacity or
              output than your calculation needs. They can still make sense for
              future growth, but they are not the proportionate pick.
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {oversized.map((rec) => (
                <RecommendationCard
                  key={rec.product.id}
                  rec={rec}
                  tone="dark"
                  extraStat={withAutonomy(rec)}
                />
              ))}
            </div>
          </details>
        ) : null}

        {possible.length ? (
          <details className="mt-6" open={primary.length === 0 && oversized.length === 0}>
            <summary className="cursor-pointer text-sm font-semibold text-navy-200">
              Possible matches ({possible.length})
            </summary>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {possible.map((rec) => (
                <RecommendationCard
                  key={rec.product.id}
                  rec={rec}
                  tone="dark"
                  extraStat={withAutonomy(rec)}
                />
              ))}
            </div>
          </details>
        ) : null}

        {notSuitable.length ? (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-semibold text-navy-200">
              Not suitable for this requirement ({notSuitable.length})
            </summary>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {notSuitable.map((rec) => (
                <RecommendationCard key={rec.product.id} rec={rec} tone="dark" />
              ))}
            </div>
          </details>
        ) : null}
      </div>

      <Callout tone="neutral" dark className="mt-8" title="Why these results?">
        Recommendations are deterministic: your required continuous output, capacity
        (with reserve) and estimated surge are compared against each unit&rsquo;s
        manufacturer-published specs, then your stated hard requirements are applied.
        Nothing here is sponsored, and no score is invented to rank a product.
      </Callout>
    </>
  );
}
