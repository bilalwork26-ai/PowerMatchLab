"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types/product";
import type { LoadPreset } from "@/lib/tool-presets";
import { DEFAULT_ASSUMPTIONS, ASSUMPTION_NOTES } from "@/lib/assumptions";
import { calculatePower, hasUsableInput, type DeviceInput } from "@/lib/calculator";
import { recommendProducts, type RecommendationPreferences } from "@/lib/recommend";
import { applySolarOffset, withSolarAdjustedCapacity, type ToolCalculatorType } from "@/lib/tools-engine";
import { fmtWh, fmtWatts } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { Callout } from "@/components/ui/Callout";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { darkInput, darkSelect, nextToolRowId } from "./shared";
import { ToolPrefCheckbox } from "./ToolPrefCheckbox";
import { ToolResultsBlock } from "./ToolResultsBlock";

export interface LoadListPrefsConfig {
  needs240V?: boolean;
  needsTT30?: boolean;
  needsUpsTransfer?: boolean;
  wantsExpandable?: boolean;
  prioritisePortability?: boolean;
}

export interface LoadListCalculatorConfig {
  calculatorType: ToolCalculatorType;
  presets: LoadPreset[];
  seedKeys: string[];
  daysLabel: string;
  daysMax: number;
  quantityLabel: string;
  showSimultaneousToggle: boolean;
  solarLabel: string | null;
  prefsConfig: LoadListPrefsConfig;
  autonomyUnit: { singular: string; plural: string };
  addExampleLabel: string;
  addCustomLabel: string;
}

function seedDevices(config: LoadListCalculatorConfig): DeviceInput[] {
  return config.seedKeys
    .map((key) => config.presets.find((p) => p.key === key))
    .filter((p): p is LoadPreset => Boolean(p))
    .map((p) => ({
      id: nextToolRowId(),
      name: p.name,
      watts: p.runningWatts,
      quantity: 1,
      hoursPerDay: p.hoursPerDay,
      surgeWatts: p.surgeWatts,
      simultaneous: true,
    }));
}

export function LoadListCalculator({
  catalog,
  config,
}: {
  catalog: Product[];
  config: LoadListCalculatorConfig;
}) {
  const [devices, setDevices] = useState<DeviceInput[]>(() => seedDevices(config));
  const [days, setDays] = useState(1);
  const [dailySolarWh, setDailySolarWh] = useState(0);
  const [efficiencyPct, setEfficiencyPct] = useState(
    Math.round(DEFAULT_ASSUMPTIONS.systemEfficiency * 100),
  );
  const [reservePct, setReservePct] = useState(Math.round(DEFAULT_ASSUMPTIONS.reserveFraction * 100));
  const [prefs, setPrefs] = useState<RecommendationPreferences>({});
  const [exampleKey, setExampleKey] = useState("");

  const result = useMemo(
    () =>
      calculatePower(
        devices,
        { days },
        { systemEfficiency: efficiencyPct / 100, reserveFraction: reservePct / 100 },
      ),
    [devices, days, efficiencyPct, reservePct],
  );

  const solarEnabled = config.solarLabel != null;
  const solar = useMemo(
    () => (solarEnabled ? applySolarOffset(result, dailySolarWh, days) : null),
    [solarEnabled, result, dailySolarWh, days],
  );

  const effectiveResult = useMemo(
    () => (solar ? withSolarAdjustedCapacity(result, solar) : result),
    [result, solar],
  );

  const recommendations = useMemo(() => {
    if (!hasUsableInput(devices)) return [];
    return recommendProducts(effectiveResult, catalog, prefs);
  }, [effectiveResult, catalog, prefs, devices]);

  const ready = hasUsableInput(devices);

  const startedRef = useRef(false);
  const completedRef = useRef(false);
  useEffect(() => {
    if (devices.some((d) => d.watts > 0) && !startedRef.current) {
      startedRef.current = true;
      trackEvent("calculator_start", { calculator_type: config.calculatorType });
    }
  }, [devices, config.calculatorType]);
  useEffect(() => {
    if (ready && !completedRef.current) {
      completedRef.current = true;
      trackEvent("calculator_completed", {
        calculator_type: config.calculatorType,
        recommended_capacity_wh: Math.round(effectiveResult.recommendedMinimumCapacityWh),
      });
    }
  }, [ready, effectiveResult.recommendedMinimumCapacityWh, config.calculatorType]);

  const invalidRows = devices.filter(
    (d) => d.name.trim() !== "" && (d.watts <= 0 || d.quantity <= 0),
  );

  const updateRow = (id: string, patch: Partial<DeviceInput>) =>
    setDevices((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id: string) => setDevices((rows) => rows.filter((r) => r.id !== id));
  const addCustom = () =>
    setDevices((rows) => [
      ...rows,
      {
        id: nextToolRowId(),
        name: "",
        watts: 0,
        quantity: 1,
        hoursPerDay: DEFAULT_ASSUMPTIONS.defaultHoursPerDay,
        surgeWatts: null,
        simultaneous: true,
      },
    ]);
  const addExample = (key: string) => {
    const preset = config.presets.find((p) => p.key === key);
    if (!preset) return;
    setDevices((rows) => [
      ...rows,
      {
        id: nextToolRowId(),
        name: preset.name,
        watts: preset.runningWatts,
        quantity: 1,
        hoursPerDay: preset.hoursPerDay,
        surgeWatts: preset.surgeWatts,
        simultaneous: true,
      },
    ]);
    setExampleKey("");
  };

  const autonomyDailyEnergyWh = solar ? solar.netDailyEnergyWh : effectiveResult.dailyEnergyWh;

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="w-full min-w-0 text-sm sm:w-auto">
          <span className="sr-only">{config.addExampleLabel}</span>
          <select
            value={exampleKey}
            onChange={(e) => {
              setExampleKey(e.target.value);
              if (e.target.value) addExample(e.target.value);
            }}
            className={cn("w-full sm:w-auto", darkSelect)}
          >
            <option value="">+ {config.addExampleLabel}…</option>
            {config.presets.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name} (~{p.runningWatts} W)
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={addCustom}
          className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/40 bg-navy-900/60 px-3 py-2 text-sm font-medium text-cyan-300 hover:bg-navy-800"
        >
          <PlusIcon width={15} height={15} /> {config.addCustomLabel}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-navy-700 text-left text-xs uppercase tracking-wide text-navy-400">
              <th scope="col" className="py-2 pr-2 font-medium">Load</th>
              <th scope="col" className="px-2 py-2 font-medium">Power (W)</th>
              <th scope="col" className="px-2 py-2 font-medium">{config.quantityLabel}</th>
              <th scope="col" className="px-2 py-2 font-medium">Hrs/day</th>
              <th scope="col" className="px-2 py-2 font-medium">
                Surge (W)
                <span className="block text-[10px] normal-case text-navy-500">optional</span>
              </th>
              {config.showSimultaneousToggle ? (
                <th scope="col" className="px-2 py-2 font-medium">
                  Coincides?
                  <span className="block text-[10px] normal-case text-navy-500">with others</span>
                </th>
              ) : null}
              <th scope="col" className="px-2 py-2 font-medium">Wh/day</th>
              <th scope="col" className="py-2 pl-2 font-medium"><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {devices.map((row) => {
              const wh = Math.round(
                Math.max(0, row.watts) * Math.max(0, row.quantity) * Math.max(0, row.hoursPerDay),
              );
              return (
                <tr key={row.id} className="border-b border-navy-800">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      placeholder="e.g. Extra device"
                      aria-label="Load name"
                      className={cn("w-full min-w-[140px]", darkInput)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={row.watts || ""}
                      onChange={(e) => updateRow(row.id, { watts: Number(e.target.value) || 0 })}
                      aria-label="Running watts"
                      className={cn("w-20", darkInput)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, { quantity: Number(e.target.value) || 0 })}
                      aria-label={config.quantityLabel}
                      className={cn("w-16", darkInput)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={row.hoursPerDay}
                      onChange={(e) => updateRow(row.id, { hoursPerDay: Number(e.target.value) || 0 })}
                      aria-label="Hours per day"
                      className={cn("w-16", darkInput)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      value={row.surgeWatts ?? ""}
                      onChange={(e) =>
                        updateRow(row.id, {
                          surgeWatts: e.target.value === "" ? null : Number(e.target.value) || 0,
                        })
                      }
                      placeholder="—"
                      aria-label="Startup surge watts (optional)"
                      className={cn("w-20", darkInput)}
                    />
                  </td>
                  {config.showSimultaneousToggle ? (
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={row.simultaneous !== false}
                        onChange={(e) => updateRow(row.id, { simultaneous: e.target.checked })}
                        aria-label={`${row.name || "This load"} may run at the same time as the others`}
                        className="h-4 w-4 rounded border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
                      />
                    </td>
                  ) : null}
                  <td className="px-2 py-2 font-semibold tabular-nums text-white">
                    {wh.toLocaleString("en-US")}
                  </td>
                  <td className="py-2 pl-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      aria-label={`Remove ${row.name || "load"}`}
                      className="grid h-8 w-8 place-items-center rounded-md text-navy-400 hover:bg-navy-800 hover:text-white"
                    >
                      <TrashIcon width={15} height={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {devices.length === 0 ? (
              <tr>
                <td colSpan={config.showSimultaneousToggle ? 8 : 7} className="py-6 text-center text-navy-400">
                  No loads yet. Add an example or a custom load to begin.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {config.showSimultaneousToggle ? (
        <p className="mt-2 text-xs text-navy-400">
          Uncheck &ldquo;Coincides?&rdquo; for a load you know never runs at the same
          time as the others (it still counts fully toward daily energy, just not
          toward the simultaneous continuous/surge power requirement).
        </p>
      ) : null}

      {invalidRows.length ? (
        <Callout tone="warn" dark live className="mt-4">
          {invalidRows.length} row{invalidRows.length > 1 ? "s have" : " has"} a name
          but a zero (or missing) power or quantity, so {invalidRows.length > 1 ? "they are" : "it is"} ignored in the totals.
        </Callout>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="glass-panel bg-navy-900/60 p-4">
          <label className="block text-sm font-medium text-white">
            {config.daysLabel}
            <input
              type="range"
              min={1}
              max={config.daysMax}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-400"
            />
            <span className="mt-1 block text-sm text-navy-300">
              {days} {days === 1 ? "day" : "days"}
            </span>
          </label>
          {config.solarLabel ? (
            <label className="mt-4 block text-sm font-medium text-white">
              {config.solarLabel}
              <input
                type="number"
                min={0}
                value={dailySolarWh || ""}
                onChange={(e) => setDailySolarWh(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className={cn("mt-1 w-full", darkInput)}
              />
              <span className="mt-1 block text-xs text-navy-400">
                Leave at 0 if you have no solar recharge. This is a planning estimate
                of your panel&rsquo;s realistic daily output, not a guarantee of sun.
              </span>
            </label>
          ) : null}
        </div>

        <div className="glass-panel bg-navy-900/60 p-4">
          <p className="text-sm font-medium text-white">Calculation assumptions</p>
          <label className="mt-3 block text-sm text-navy-200">
            Usable efficiency: <strong className="text-white">{efficiencyPct}%</strong>
            <input
              type="range"
              min={70}
              max={95}
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

      {Object.values(config.prefsConfig).some(Boolean) ? (
        <fieldset className="glass-panel mt-6 bg-navy-900/60 p-4">
          <legend className="px-1 text-sm font-medium text-white">
            Hard requirements &amp; preferences
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {config.prefsConfig.needs240V ? (
              <ToolPrefCheckbox
                label="I need native 120/240V output"
                checked={!!prefs.needs240V}
                onChange={(v) => setPrefs((p) => ({ ...p, needs240V: v }))}
              />
            ) : null}
            {config.prefsConfig.needsTT30 ? (
              <ToolPrefCheckbox
                label="I need an RV TT-30 outlet"
                checked={!!prefs.needsTT30}
                onChange={(v) => setPrefs((p) => ({ ...p, needsTT30: v }))}
              />
            ) : null}
            {config.prefsConfig.needsUpsTransfer ? (
              <ToolPrefCheckbox
                label="I need fast automatic transfer / UPS-style switchover"
                checked={!!prefs.needsUpsTransfer}
                onChange={(v) => setPrefs((p) => ({ ...p, needsUpsTransfer: v }))}
              />
            ) : null}
            {config.prefsConfig.wantsExpandable ? (
              <ToolPrefCheckbox
                label="I need to be able to add expansion batteries later"
                checked={!!prefs.wantsExpandable}
                onChange={(v) => setPrefs((p) => ({ ...p, wantsExpandable: v }))}
              />
            ) : null}
            {config.prefsConfig.prioritisePortability ? (
              <ToolPrefCheckbox
                label="Prioritise low weight / portability"
                checked={!!prefs.prioritisePortability}
                onChange={(v) => setPrefs((p) => ({ ...p, prioritisePortability: v }))}
              />
            ) : null}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-8">
        <ToolResultsBlock
          ready={ready}
          notReadyMessage="Add at least one load with a running-watts value above to get a result."
          headlineLabel="Recommended minimum capacity"
          headlineValueWh={effectiveResult.recommendedMinimumCapacityWh}
          formulaText={`= (${result.dailyEnergyWh.toLocaleString("en-US")} Wh/day${
            solar ? ` − ${solar.solarContributionWh.toLocaleString("en-US")} Wh/day solar` : ""
          } × ${days} ${days === 1 ? "day" : "days"}) ÷ ${efficiencyPct}% usable × (1 + ${reservePct}% reserve)`}
          stats={[
            { label: "Total daily energy", value: fmtWh(result.dailyEnergyWh) },
            ...(solar ? [{ label: "Daily deficit after solar", value: fmtWh(solar.dailyDeficitWh) }] : []),
            { label: "Required continuous output", value: fmtWatts(effectiveResult.requiredContinuousOutputW) },
            { label: "Required surge capability", value: fmtWatts(effectiveResult.requiredSurgeOutputW) },
          ]}
          solar={solar}
          efficiency={efficiencyPct / 100}
          autonomyDailyEnergyWh={autonomyDailyEnergyWh}
          autonomyUnit={config.autonomyUnit}
          recommendations={recommendations}
        />
      </div>
    </div>
  );
}
