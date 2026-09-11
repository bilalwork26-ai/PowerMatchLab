"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types/product";
import { CPAP_PRESETS } from "@/lib/tool-presets";
import { DEFAULT_ASSUMPTIONS, ASSUMPTION_NOTES } from "@/lib/assumptions";
import { calculatePower, hasUsableInput, type DeviceInput } from "@/lib/calculator";
import { recommendProducts } from "@/lib/recommend";
import { fmtWh, fmtWatts } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { Callout } from "@/components/ui/Callout";
import { darkInput, darkSelect, nextToolRowId } from "./shared";
import { ToolResultsBlock } from "./ToolResultsBlock";

const AC_EFFICIENCY_DEFAULT = 85;
const DC_EFFICIENCY_DEFAULT = 95;

export function CpapCalculator({ catalog }: { catalog: Product[] }) {
  const [presetKey, setPresetKey] = useState(CPAP_PRESETS[0].key);
  const [baseWatts, setBaseWatts] = useState(CPAP_PRESETS[0].baseWatts);
  const [humidifierOn, setHumidifierOn] = useState(false);
  const [humidifierWatts, setHumidifierWatts] = useState(30);
  const [heatedTubeOn, setHeatedTubeOn] = useState(false);
  const [heatedTubeWatts, setHeatedTubeWatts] = useState(15);
  const [powerMode, setPowerMode] = useState<"ac" | "dc">("ac");
  const [hoursPerNight, setHoursPerNight] = useState(8);
  const [nights, setNights] = useState(1);
  const [efficiencyPct, setEfficiencyPct] = useState(AC_EFFICIENCY_DEFAULT);
  const [reservePct, setReservePct] = useState(Math.round(DEFAULT_ASSUMPTIONS.reserveFraction * 100));

  const applyPreset = (key: string) => {
    const preset = CPAP_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setPresetKey(key);
    setBaseWatts(preset.baseWatts);
    setHumidifierOn(preset.humidifierExtraWatts > 0);
    setHumidifierWatts(preset.humidifierExtraWatts || 30);
    setHeatedTubeOn(preset.heatedTubeExtraWatts > 0);
    setHeatedTubeWatts(preset.heatedTubeExtraWatts || 15);
  };

  const totalWatts =
    Math.max(0, baseWatts) + (humidifierOn ? Math.max(0, humidifierWatts) : 0) +
    (heatedTubeOn ? Math.max(0, heatedTubeWatts) : 0);

  const devices: DeviceInput[] = useMemo(
    () => [
      {
        id: nextToolRowId(),
        name: "CPAP machine",
        watts: totalWatts,
        quantity: 1,
        hoursPerDay: hoursPerNight,
        surgeWatts: null,
      },
    ],
    [totalWatts, hoursPerNight],
  );

  const result = useMemo(
    () =>
      calculatePower(
        devices,
        { days: nights },
        { systemEfficiency: efficiencyPct / 100, reserveFraction: reservePct / 100 },
      ),
    [devices, nights, efficiencyPct, reservePct],
  );

  const recommendations = useMemo(() => {
    if (!hasUsableInput(devices)) return [];
    return recommendProducts(result, catalog, {});
  }, [result, catalog, devices]);

  const ready = hasUsableInput(devices) && totalWatts > 0;

  const startedRef = useRef(false);
  const completedRef = useRef(false);
  useEffect(() => {
    if (totalWatts > 0 && !startedRef.current) {
      startedRef.current = true;
      trackEvent("calculator_start", { calculator_type: "cpap_battery" });
    }
  }, [totalWatts]);
  useEffect(() => {
    if (ready && !completedRef.current) {
      completedRef.current = true;
      trackEvent("calculator_completed", {
        calculator_type: "cpap_battery",
        recommended_capacity_wh: Math.round(result.recommendedMinimumCapacityWh),
      });
    }
  }, [ready, result.recommendedMinimumCapacityWh]);

  return (
    <div>
      <Callout tone="warn" dark title="Not medical advice" className="mb-4">
        This tool calculates estimated battery runtime only. It does not assess
        therapy adequacy or medical suitability. Always check your CPAP
        machine&rsquo;s own rating label or the manufacturer&rsquo;s power-supply
        specification for its real power draw, and consult your equipment
        provider or physician about backup power planning.
      </Callout>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel bg-navy-900/60 p-4">
          <label className="block text-sm font-medium text-white">
            Start from an example range
            <select
              value={presetKey}
              onChange={(e) => applyPreset(e.target.value)}
              className={cn("mt-1.5 w-full", darkSelect)}
            >
              {CPAP_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-1 text-xs text-navy-400">
            Educational starting points only — every value below is editable.
            Check your device&rsquo;s own label for its real consumption.
          </p>

          <label className="mt-4 block text-sm text-navy-200">
            Average consumption or adapter rating (W)
            <input
              type="number"
              min={0}
              value={baseWatts || ""}
              onChange={(e) => setBaseWatts(Math.max(0, Number(e.target.value) || 0))}
              className={cn("mt-1 w-full", darkInput)}
            />
          </label>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-navy-700 p-2.5">
            <label className="flex items-center gap-2 text-sm text-navy-200">
              <input
                type="checkbox"
                checked={humidifierOn}
                onChange={(e) => setHumidifierOn(e.target.checked)}
                className="h-4 w-4 rounded border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
              />
              Heated humidifier active
            </label>
            {humidifierOn ? (
              <input
                type="number"
                min={0}
                value={humidifierWatts}
                onChange={(e) => setHumidifierWatts(Math.max(0, Number(e.target.value) || 0))}
                aria-label="Humidifier extra watts"
                className={cn("w-20", darkInput)}
              />
            ) : null}
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-navy-700 p-2.5">
            <label className="flex items-center gap-2 text-sm text-navy-200">
              <input
                type="checkbox"
                checked={heatedTubeOn}
                onChange={(e) => setHeatedTubeOn(e.target.checked)}
                className="h-4 w-4 rounded border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
              />
              Heated tube active
            </label>
            {heatedTubeOn ? (
              <input
                type="number"
                min={0}
                value={heatedTubeWatts}
                onChange={(e) => setHeatedTubeWatts(Math.max(0, Number(e.target.value) || 0))}
                aria-label="Heated tube extra watts"
                className={cn("w-20", darkInput)}
              />
            ) : null}
          </div>

          <fieldset className="mt-3">
            <legend className="text-sm text-navy-200">Power connection</legend>
            <div className="mt-1 flex gap-3 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="cpap-power-mode"
                  checked={powerMode === "ac"}
                  onChange={() => {
                    setPowerMode("ac");
                    setEfficiencyPct(AC_EFFICIENCY_DEFAULT);
                  }}
                  className="h-4 w-4 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
                />
                AC (via inverter)
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="cpap-power-mode"
                  checked={powerMode === "dc"}
                  onChange={() => {
                    setPowerMode("dc");
                    setEfficiencyPct(DC_EFFICIENCY_DEFAULT);
                  }}
                  className="h-4 w-4 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
                />
                DC direct (12V/24V cable)
              </label>
            </div>
            <p className="mt-1 text-xs text-navy-400">
              A direct DC connection skips inverter conversion losses, so it
              typically runs more efficiently than AC — this only changes the
              starting position of the efficiency slider below, which stays
              fully adjustable.
            </p>
          </fieldset>
        </div>

        <div className="glass-panel bg-navy-900/60 p-4">
          <label className="block text-sm font-medium text-white">
            Hours per night
            <input
              type="range"
              min={1}
              max={12}
              step={0.5}
              value={hoursPerNight}
              onChange={(e) => setHoursPerNight(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-400"
            />
            <span className="mt-1 block text-sm text-navy-300">{hoursPerNight} h/night</span>
          </label>
          <label className="mt-4 block text-sm font-medium text-white">
            Nights without recharge
            <input
              type="range"
              min={1}
              max={14}
              step={1}
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-400"
            />
            <span className="mt-1 block text-sm text-navy-300">
              {nights} {nights === 1 ? "night" : "nights"}
            </span>
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
          <p className="text-[11px] text-navy-400">{ASSUMPTION_NOTES.reserveFraction}</p>
        </div>
      </div>

      <div className="mt-8">
        <ToolResultsBlock
          ready={ready}
          notReadyMessage="Enter a consumption value above 0 W to get a result."
          headlineLabel="Recommended minimum capacity"
          headlineValueWh={result.recommendedMinimumCapacityWh}
          formulaText={`= (${totalWatts.toLocaleString("en-US")} W × ${hoursPerNight} h × ${nights} ${
            nights === 1 ? "night" : "nights"
          }) ÷ ${efficiencyPct}% usable × (1 + ${reservePct}% reserve)`}
          stats={[
            { label: "Wh per night", value: fmtWh(result.dailyEnergyWh) },
            { label: `Wh over ${nights} ${nights === 1 ? "night" : "nights"}`, value: fmtWh(result.totalEnergyDemandWh) },
            { label: "Device draw", value: fmtWatts(totalWatts) },
          ]}
          efficiency={efficiencyPct / 100}
          autonomyDailyEnergyWh={result.dailyEnergyWh}
          autonomyUnit={{ singular: "night", plural: "nights" }}
          recommendations={recommendations}
        />
      </div>
    </div>
  );
}
