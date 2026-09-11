"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types/product";
import { STARLINK_PROFILES } from "@/lib/tool-presets";
import { DEFAULT_ASSUMPTIONS, ASSUMPTION_NOTES } from "@/lib/assumptions";
import { calculatePower, hasUsableInput, type DeviceInput } from "@/lib/calculator";
import { recommendProducts } from "@/lib/recommend";
import { applySolarOffset, withSolarAdjustedCapacity } from "@/lib/tools-engine";
import { fmtWh, fmtWatts } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { darkInput, darkSelect, nextToolRowId } from "./shared";
import { ToolResultsBlock } from "./ToolResultsBlock";

const AC_EFFICIENCY_DEFAULT = 85;
const DC_EFFICIENCY_DEFAULT = 95;

export function StarlinkCalculator({ catalog }: { catalog: Product[] }) {
  const [inputMode, setInputMode] = useState<"measured" | "profile">("profile");
  const [profileKey, setProfileKey] = useState(STARLINK_PROFILES[0].key);
  const [measuredWatts, setMeasuredWatts] = useState(STARLINK_PROFILES[0].avgWatts);
  const [continuous, setContinuous] = useState(true);
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const [routerWatts, setRouterWatts] = useState(0);
  const [powerMode, setPowerMode] = useState<"ac" | "dc">("ac");
  const [days, setDays] = useState(1);
  const [dailySolarWh, setDailySolarWh] = useState(0);
  const [efficiencyPct, setEfficiencyPct] = useState(AC_EFFICIENCY_DEFAULT);
  const [reservePct, setReservePct] = useState(Math.round(DEFAULT_ASSUMPTIONS.reserveFraction * 100));

  const kitWatts = inputMode === "profile"
    ? STARLINK_PROFILES.find((p) => p.key === profileKey)?.avgWatts ?? 0
    : Math.max(0, measuredWatts);
  const effectiveHours = continuous ? 24 : Math.max(0, Math.min(24, hoursPerDay));

  const devices: DeviceInput[] = useMemo(() => {
    const rows: DeviceInput[] = [
      { id: nextToolRowId(), name: "Starlink kit", watts: kitWatts, quantity: 1, hoursPerDay: effectiveHours, surgeWatts: null },
    ];
    if (routerWatts > 0) {
      rows.push({ id: nextToolRowId(), name: "Router / extra equipment", watts: routerWatts, quantity: 1, hoursPerDay: effectiveHours, surgeWatts: null });
    }
    return rows;
  }, [kitWatts, effectiveHours, routerWatts]);

  const result = useMemo(
    () =>
      calculatePower(
        devices,
        { days },
        { systemEfficiency: efficiencyPct / 100, reserveFraction: reservePct / 100 },
      ),
    [devices, days, efficiencyPct, reservePct],
  );

  const solar = useMemo(() => applySolarOffset(result, dailySolarWh, days), [result, dailySolarWh, days]);
  const effectiveResult = useMemo(() => withSolarAdjustedCapacity(result, solar), [result, solar]);

  const recommendations = useMemo(() => {
    if (!hasUsableInput(devices)) return [];
    return recommendProducts(effectiveResult, catalog, {});
  }, [effectiveResult, catalog, devices]);

  const ready = hasUsableInput(devices) && kitWatts > 0;

  const startedRef = useRef(false);
  const completedRef = useRef(false);
  useEffect(() => {
    if (kitWatts > 0 && !startedRef.current) {
      startedRef.current = true;
      trackEvent("calculator_start", { calculator_type: "starlink_runtime" });
    }
  }, [kitWatts]);
  useEffect(() => {
    if (ready && !completedRef.current) {
      completedRef.current = true;
      trackEvent("calculator_completed", {
        calculator_type: "starlink_runtime",
        recommended_capacity_wh: Math.round(effectiveResult.recommendedMinimumCapacityWh),
      });
    }
  }, [ready, effectiveResult.recommendedMinimumCapacityWh]);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel bg-navy-900/60 p-4">
          <fieldset>
            <legend className="text-sm font-medium text-white">Consumption source</legend>
            <div className="mt-1.5 flex gap-3 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="starlink-input-mode"
                  checked={inputMode === "profile"}
                  onChange={() => setInputMode("profile")}
                  className="h-4 w-4 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
                />
                Example profile
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="starlink-input-mode"
                  checked={inputMode === "measured"}
                  onChange={() => setInputMode("measured")}
                  className="h-4 w-4 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
                />
                My own measured watts
              </label>
            </div>
          </fieldset>

          {inputMode === "profile" ? (
            <label className="mt-3 block text-sm">
              <span className="text-navy-200">Example profile</span>
              <select
                value={profileKey}
                onChange={(e) => setProfileKey(e.target.value)}
                className={cn("mt-1 w-full", darkSelect)}
              >
                {STARLINK_PROFILES.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name} (~{p.avgWatts} W)
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-navy-400">
                {STARLINK_PROFILES.find((p) => p.key === profileKey)?.note}
              </span>
            </label>
          ) : (
            <label className="mt-3 block text-sm text-navy-200">
              Your measured average watts
              <input
                type="number"
                min={0}
                value={measuredWatts || ""}
                onChange={(e) => setMeasuredWatts(Math.max(0, Number(e.target.value) || 0))}
                className={cn("mt-1 w-full", darkInput)}
              />
              <span className="mt-1 block text-xs text-navy-400">
                Use a plug-in energy meter reading averaged over normal use for the
                most accurate figure.
              </span>
            </label>
          )}

          <div className="mt-3 flex items-center gap-2">
            <input
              id="starlink-continuous"
              type="checkbox"
              checked={continuous}
              onChange={(e) => setContinuous(e.target.checked)}
              className="h-4 w-4 rounded border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
            />
            <label htmlFor="starlink-continuous" className="text-sm text-navy-200">
              Runs continuously (24 h/day)
            </label>
          </div>
          {!continuous ? (
            <label className="mt-2 block text-sm text-navy-200">
              Hours per day
              <input
                type="range"
                min={1}
                max={24}
                step={1}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="mt-1 w-full accent-cyan-400"
              />
              <span className="mt-1 block text-xs text-navy-400">{hoursPerDay} h/day</span>
            </label>
          ) : null}

          <label className="mt-3 block text-sm text-navy-200">
            Router / additional equipment (W, optional)
            <input
              type="number"
              min={0}
              value={routerWatts || ""}
              onChange={(e) => setRouterWatts(Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className={cn("mt-1 w-full", darkInput)}
            />
          </label>

          <fieldset className="mt-3">
            <legend className="text-sm text-navy-200">Power connection</legend>
            <div className="mt-1 flex gap-3 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="starlink-power-mode"
                  checked={powerMode === "ac"}
                  onChange={() => { setPowerMode("ac"); setEfficiencyPct(AC_EFFICIENCY_DEFAULT); }}
                  className="h-4 w-4 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
                />
                AC (via inverter)
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="starlink-power-mode"
                  checked={powerMode === "dc"}
                  onChange={() => { setPowerMode("dc"); setEfficiencyPct(DC_EFFICIENCY_DEFAULT); }}
                  className="h-4 w-4 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
                />
                DC direct
              </label>
            </div>
          </fieldset>
        </div>

        <div className="glass-panel bg-navy-900/60 p-4">
          <label className="block text-sm font-medium text-white">
            Days without recharge
            <input
              type="range"
              min={1}
              max={14}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-400"
            />
            <span className="mt-1 block text-sm text-navy-300">
              {days} {days === 1 ? "day" : "days"}
            </span>
          </label>
          <label className="mt-4 block text-sm font-medium text-white">
            Daily solar contribution (Wh, optional)
            <input
              type="number"
              min={0}
              value={dailySolarWh || ""}
              onChange={(e) => setDailySolarWh(Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className={cn("mt-1 w-full", darkInput)}
            />
          </label>
          <label className="mt-4 block text-sm text-navy-200">
            Usable efficiency: <strong className="text-white">{efficiencyPct}%</strong>
            <input
              type="range"
              min={70}
              max={98}
              step={1}
              value={efficiencyPct}
              onChange={(e) => setEfficiencyPct(Number(e.target.value))}
              className="mt-1 w-full accent-cyan-400"
            />
          </label>
          <p className="text-[11px] text-navy-400">{ASSUMPTION_NOTES.systemEfficiency}</p>
          <label className="mt-3 block text-sm text-navy-200">
            Reserve headroom: <strong className="text-white">{reservePct}%</strong>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={reservePct}
              onChange={(e) => setReservePct(Number(e.target.value))}
              className="mt-1 w-full accent-cyan-400"
            />
          </label>
        </div>
      </div>

      <p className="mt-4 text-xs text-navy-400">
        For the wider off-grid connectivity picture, see{" "}
        <Link href="/best-for-rv" className="underline hover:text-cyan-300">
          Best for RV
        </Link>{" "}
        and the{" "}
        <Link href="/guides/power-stations-for-remote-work-and-van-life" className="underline hover:text-cyan-300">
          remote work &amp; van life guide
        </Link>
        .
      </p>

      <div className="mt-8">
        <ToolResultsBlock
          ready={ready}
          notReadyMessage="Choose an example profile or enter your own measured watts above to get a result."
          headlineLabel="Recommended minimum capacity"
          headlineValueWh={effectiveResult.recommendedMinimumCapacityWh}
          formulaText={`= (${result.dailyEnergyWh.toLocaleString("en-US")} Wh/day${
            solar.solarContributionWh > 0 ? ` − ${solar.solarContributionWh.toLocaleString("en-US")} Wh/day solar` : ""
          } × ${days} ${days === 1 ? "day" : "days"}) ÷ ${efficiencyPct}% usable × (1 + ${reservePct}% reserve)`}
          stats={[
            { label: "Wh per day", value: fmtWh(result.dailyEnergyWh) },
            { label: "Daily deficit after solar", value: fmtWh(solar.dailyDeficitWh) },
            { label: "Continuous output needed", value: fmtWatts(effectiveResult.requiredContinuousOutputW) },
          ]}
          solar={solar}
          efficiency={efficiencyPct / 100}
          autonomyDailyEnergyWh={solar.netDailyEnergyWh}
          autonomyUnit={{ singular: "day", plural: "days" }}
          recommendations={recommendations}
        />
      </div>
    </div>
  );
}
