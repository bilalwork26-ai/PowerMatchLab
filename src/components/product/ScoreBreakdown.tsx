import Link from "next/link";
import type { ProductScore } from "@/lib/score";
import { MIN_DIMENSIONS_FOR_OVERALL } from "@/lib/score";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { RadarChart } from "@/components/ui/RadarChart";
import { Callout } from "@/components/ui/Callout";

export function ScoreBreakdown({
  score,
  productName,
}: {
  score: ProductScore;
  productName: string;
}) {
  const canRadar = score.dimensions.length >= 3;

  return (
    <div className="space-y-6">
      <Callout tone="neutral" dark title="What the PowerMatch Score is">
        An editorial assessment calculated by PowerMatchLab, normalised against
        the other products we list. It is not a lab test result and not a
        manufacturer figure. A dimension is only scored when the underlying data
        exists; if fewer than {MIN_DIMENSIONS_FOR_OVERALL} dimensions can be
        scored, we publish no overall number. See the{" "}
        <Link href="/about-methodology#scoring" className="underline">
          full methodology
        </Link>
        .
      </Callout>

      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <ScoreCircle value={score.overall} band={score.band} size={104} tone="dark" />
        <div className="text-sm text-navy-300">
          <p>
            {score.scoredCount} of {score.totalDimensions} dimensions scored for
            this unit.
          </p>
          {score.overall == null ? (
            <p className="mt-1 font-medium text-amber-300">
              Not enough verified data to publish an overall score.
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {score.dimensions.map((d) => (
          <div key={d.key}>
            <ScoreBar value={d.score} label={d.label} sublabel={d.basis} tone="dark" />
          </div>
        ))}
        {score.dimensions.length === 0 ? (
          <p className="text-sm text-navy-400">
            No dimensions could be scored from the available data.
          </p>
        ) : null}
      </div>

      {canRadar ? (
        <div className="rounded-lg border border-navy-700 p-4">
          <h3 className="mb-2 text-sm font-semibold text-white">
            Category performance ({productName})
          </h3>
          <RadarChart
            axes={score.dimensions.map((d) => d.label)}
            series={[
              {
                name: productName,
                values: score.dimensions.map((d) => d.score),
              },
            ]}
            caption={`PowerMatch Score dimensions for ${productName}`}
            tone="dark"
          />
        </div>
      ) : null}
    </div>
  );
}
