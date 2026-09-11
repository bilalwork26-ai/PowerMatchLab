"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const darkInput =
  "w-full rounded-md border border-navy-700 bg-navy-900/60 px-3 py-2 text-white outline-none transition-shadow duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

const REFERENCE_PANELS_W = [100, 200, 400, 800];
const MATRIX_CAPACITIES_WH = [500, 1000, 1500, 2000, 3000, 5000];
const MATRIX_EFFICIENCY_PCT = 65;

function fmtHours(h: number): string {
  if (!Number.isFinite(h) || h <= 0) return "—";
  if (h < 10) return `${h.toFixed(1)} h`;
  return `${Math.round(h)} h`;
}

/**
 * Solar charging time = energy needed (Wh) ÷ realistic solar input (W).
 * Matches the formula and 60-80% realistic-derate range this guide explains
 * in prose — this just lets a reader plug in their own numbers instead of
 * doing the arithmetic by hand.
 */
export function SolarChargeCalculator() {
  const [capacityWh, setCapacityWh] = useState(1000);
  const [panelW, setPanelW] = useState(200);
  const [efficiencyPct, setEfficiencyPct] = useState(65);
  const [startSoc, setStartSoc] = useState(0);
  const [endSoc, setEndSoc] = useState(100);

  const result = useMemo(() => {
    const energyNeededWh = (capacityWh * Math.max(0, endSoc - startSoc)) / 100;
    const realisticInputW = panelW * (efficiencyPct / 100);
    const hours =
      realisticInputW > 0 && energyNeededWh > 0 ? energyNeededWh / realisticInputW : null;
    return { energyNeededWh, realisticInputW, hours };
  }, [capacityWh, panelW, efficiencyPct, startSoc, endSoc]);

  const referenceRows = useMemo(
    () =>
      REFERENCE_PANELS_W.map((w) => {
        const realisticW = w * (efficiencyPct / 100);
        const hours = realisticW > 0 ? capacityWh / realisticW : null;
        return { panelW: w, hours };
      }),
    [capacityWh, efficiencyPct],
  );

  return (
    <div className="not-prose my-8 rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-5">
      <h2 className="text-lg font-bold text-white">Solar Charging Time Calculator</h2>
      <p className="mt-1 text-sm text-navy-300">
        Enter your station&rsquo;s capacity and panel wattage to estimate charging
        time. This is a planning calculation, not a measurement of any specific
        product or weather condition.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium text-navy-200">Battery capacity (Wh)</span>
          <input
            type="number"
            min={1}
            value={capacityWh}
            onChange={(e) => setCapacityWh(Math.max(0, Number(e.target.value) || 0))}
            className={cn("mt-1", darkInput)}
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-navy-200">Solar panel rated output (W)</span>
          <input
            type="number"
            min={1}
            value={panelW}
            onChange={(e) => setPanelW(Math.max(0, Number(e.target.value) || 0))}
            className={cn("mt-1", darkInput)}
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-navy-200">
            Estimated real-world efficiency (%)
          </span>
          <input
            type="number"
            min={10}
            max={100}
            value={efficiencyPct}
            onChange={(e) =>
              setEfficiencyPct(Math.min(100, Math.max(10, Number(e.target.value) || 0)))
            }
            className={cn("mt-1", darkInput)}
          />
          <span className="mt-1 block text-xs text-navy-400">
            Commonly 60-80% of the rated watts in good midday sun; lower on a hazy
            or partly-shaded day.
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="font-medium text-navy-200">Start charge (%)</span>
            <input
              type="number"
              min={0}
              max={99}
              value={startSoc}
              onChange={(e) =>
                setStartSoc(Math.min(99, Math.max(0, Number(e.target.value) || 0)))
              }
              className={cn("mt-1", darkInput)}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-navy-200">Target charge (%)</span>
            <input
              type="number"
              min={1}
              max={100}
              value={endSoc}
              onChange={(e) =>
                setEndSoc(Math.min(100, Math.max(1, Number(e.target.value) || 0)))
              }
              className={cn("mt-1", darkInput)}
            />
          </label>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-cyan-700/40 bg-navy-900/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Estimated result
        </p>
        <p className="mt-2 text-2xl font-bold text-white">
          {result.hours != null ? fmtHours(result.hours) : "Enter valid numbers"}
          {result.hours != null ? (
            <span className="ml-2 text-sm font-normal text-navy-300">
              of continuous strong midday sun
            </span>
          ) : null}
        </p>
        <p className="mt-2 text-xs text-navy-400">
          {Math.round(result.energyNeededWh).toLocaleString("en-US")} Wh needed ÷{" "}
          {Math.round(result.realisticInputW)} W realistic input ={" "}
          {result.hours != null ? fmtHours(result.hours) : "—"}. Actual full-sun
          hours per day are almost always fewer than total daylight hours — see
          &ldquo;hours of sun&rdquo; below.
        </p>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Reference: full charge from empty, {capacityWh.toLocaleString("en-US")} Wh,
          at {efficiencyPct}% realistic efficiency
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy-700 text-left text-navy-400">
                <th className="py-1.5 font-medium">Panel rating</th>
                <th className="py-1.5 font-medium">Estimated charge time</th>
              </tr>
            </thead>
            <tbody>
              {referenceRows.map((r) => (
                <tr key={r.panelW} className="border-b border-navy-800">
                  <td className="py-1.5 text-navy-200">{r.panelW} W</td>
                  <td className="py-1.5 font-medium text-white">
                    {r.hours != null ? fmtHours(r.hours) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 border-t border-navy-700 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          Full charge time by battery capacity and panel rating (
          {MATRIX_EFFICIENCY_PCT}% realistic efficiency)
        </p>
        <p className="mt-1 text-xs text-navy-400">
          A fixed reference table, independent of the inputs above — useful for
          comparing capacity/panel combinations at a glance before typing in your
          own numbers.
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy-700 text-left text-navy-400">
                <th className="py-1.5 pr-3 font-medium">Capacity</th>
                {REFERENCE_PANELS_W.map((w) => (
                  <th key={w} className="py-1.5 pr-3 font-medium">
                    {w} W panel
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX_CAPACITIES_WH.map((cap) => (
                <tr key={cap} className="border-b border-navy-800">
                  <td className="py-1.5 pr-3 font-medium text-white">
                    {cap.toLocaleString("en-US")} Wh
                  </td>
                  {REFERENCE_PANELS_W.map((w) => {
                    const realisticW = w * (MATRIX_EFFICIENCY_PCT / 100);
                    const hours = realisticW > 0 ? cap / realisticW : null;
                    return (
                      <td key={w} className="py-1.5 pr-3 text-navy-200">
                        {hours != null ? fmtHours(hours) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
