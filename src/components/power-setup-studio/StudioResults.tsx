import type { CalculatorResult } from "@/lib/calculator";
import { DEFAULT_ASSUMPTIONS } from "@/lib/assumptions";
import { fmtWh, fmtWatts } from "@/lib/format";
import { Callout } from "@/components/ui/Callout";
import { EstimateFactorsDisclosure } from "@/components/ui/EstimateFactorsDisclosure";

export function StudioResults({ result }: { result: CalculatorResult }) {
  const effPct = Math.round(DEFAULT_ASSUMPTIONS.systemEfficiency * 100);
  const reservePct = Math.round(DEFAULT_ASSUMPTIONS.reserveFraction * 100);

  return (
    <div className="surface-dark p-5 text-white">
      <p className="text-sm text-navy-300">Recommended minimum capacity</p>
      <p className="mt-1 text-4xl font-bold">
        {result.recommendedMinimumCapacityWh.toLocaleString("en-US")}{" "}
        <span className="text-xl font-medium text-navy-300">Wh</span>
      </p>
      <p className="mt-1 text-xs text-navy-400">
        = ({result.dailyEnergyWh.toLocaleString("en-US")} Wh/day active load) ÷ {effPct}%
        usable × (1 + {reservePct}% reserve). Same formulas as the{" "}
        <a href="/power-calculator" className="underline">
          Power Calculator
        </a>
        .
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ResultStat label="Active load" value={fmtWatts(result.requiredContinuousOutputW)} />
        <ResultStat label="Daily energy" value={fmtWh(result.dailyEnergyWh)} />
        <ResultStat
          label="Required continuous output"
          value={fmtWatts(result.requiredContinuousOutputW)}
        />
        <ResultStat label="Required surge" value={fmtWatts(result.requiredSurgeOutputW)} />
      </dl>

      <EstimateFactorsDisclosure className="mt-4" />

      {!result.hasSurgeData ? (
        <Callout tone="warn" dark className="mt-4">
          Surge watts were not entered for these example devices, so the surge figure
          above assumes a {DEFAULT_ASSUMPTIONS.assumedSurgeMultiplier}× startup
          multiple — a real appliance&rsquo;s nameplate or manual may state a
          different value.
        </Callout>
      ) : null}

      <p className="mt-3 text-xs text-navy-400">
        Results are estimates based on your inputs and published manufacturer
        specifications — not a test or a guarantee. See{" "}
        <a href="/about-methodology" className="underline">
          About &amp; Methodology
        </a>{" "}
        and the{" "}
        <a href="/editorial-policy" className="underline">
          Editorial Policy
        </a>
        .
      </p>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-navy-800/60 p-3">
      <dt className="text-[11px] text-navy-300">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}
