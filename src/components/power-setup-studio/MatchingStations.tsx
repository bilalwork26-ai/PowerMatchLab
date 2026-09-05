"use client";

import { useState } from "react";
import Link from "next/link";
import type { Recommendation } from "@/lib/recommend";
import { estimateAutonomyHours } from "@/lib/power-setup-calc";
import { RecommendationCard } from "@/components/calculator/RecommendationCard";
import { Callout } from "@/components/ui/Callout";

const INITIAL_COUNT = 3;

export function MatchingStations({
  recommendations,
  batteryStatePct,
  netDischargeW,
}: {
  recommendations: Recommendation[];
  batteryStatePct: number;
  netDischargeW: number;
}) {
  const [showAll, setShowAll] = useState(false);

  const bestAndGood = recommendations.filter(
    (r) => r.status === "Best Match" || r.status === "Good Match",
  );
  const shown = showAll ? bestAndGood : bestAndGood.slice(0, INITIAL_COUNT);

  if (bestAndGood.length === 0) {
    return (
      <Callout tone="warn" dark className="mt-4">
        No product in the current catalog comfortably meets this requirement.
        Try turning off a device or lowering the backup duration.
      </Callout>
    );
  }

  return (
    <div className="mt-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((rec) => {
          const autonomyHours = estimateAutonomyHours({
            capacityWh: rec.product.capacity_wh,
            batteryStatePct,
            netDischargeW,
          });
          return (
            <div key={rec.product.id}>
              <RecommendationCard rec={rec} tone="dark" />
              {autonomyHours != null ? (
                <p className="mt-1.5 rounded-md bg-navy-900/60 px-2.5 py-1.5 text-[11px] text-navy-300">
                  Estimated autonomy at the current simulated battery level and net
                  discharge: <strong className="text-white">
                    {autonomyHours >= 10 ? Math.round(autonomyHours) : autonomyHours.toFixed(1)}{" "}
                    h
                  </strong>{" "}
                  — an estimate, not a guarantee.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {!showAll && bestAndGood.length > INITIAL_COUNT ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-navy-200 hover:bg-navy-800"
        >
          Show {bestAndGood.length - INITIAL_COUNT} more
        </button>
      ) : null}

      <p className="mt-4 text-xs text-navy-400">
        As an Amazon Associate I earn from qualifying purchases. See the{" "}
        <Link href="/affiliate-disclosure" className="underline">
          Affiliate Disclosure
        </Link>
        .
      </p>
    </div>
  );
}
