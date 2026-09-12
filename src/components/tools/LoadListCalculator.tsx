"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import type { LoadPreset } from "@/lib/tool-presets";
import { DEFAULT_ASSUMPTIONS, ASSUMPTION_NOTES } from "@/lib/assumptions";
import { calculatePower, hasUsableInput, type DeviceInput } from "@/lib/calculator";
import { recommendProducts, type RecommendationPreferences } from "@/lib/recommend";
import {
  applySolarOffset,
  deriveWattsAndHoursFromDailyEnergy,
  dailyEnergyUnitToWh,
  estimateDailySolarWh,
  estimateProductDailySolarWh,
  estimateAutonomyUnits,
  type DailyEnergyUnit,
  type ToolCalculatorType,
} from "@/lib/tools-engine";
import {
  encodeLoadListShareState,
  decodeLoadListShareState,
  type SolarShareState,
} from "@/lib/tools-share-state";
import { buildRuntimeIndexCsv, downloadCsv } from "@/lib/csv-export";
import { fmtWh, fmtWatts } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { SITE } from "@/lib/site";
import { Callout } from "@/components/ui/Callout";
import { ShareBar } from "@/components/ui/ShareBar";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { darkInput, darkSelect, nextToolRowId } from "./shared";
import { ToolPrefCheckbox } from "./ToolPrefCheckbox";
import { ToolResultsBlock } from "./ToolResultsBlock";
import { RuntimeIndexTable } from "./RuntimeIndexTable";
import { PrintSummary } from "./PrintSummary";

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
  toolTitle: string;
  toolPath: string;
  /** Lets a row's power be entered as a daily energy figure (Wh/kWh) instead of watts × hours/day — e.g. an EnergyGuide label. Off by default; only the refrigerator tool enables it in this round. */
  allowDailyEnergyMode?: boolean;
  /** Shows a collapsible "estimate from panel specs" helper above the daily-solar-Wh field. Off by default. */
  allowSolarEstimator?: boolean;
  /** Shows the sortable/filterable Runtime Index table below the grouped recommendation cards. Off by default. */
  showRuntimeIndexTable?: boolean;
  /** Shows the "Share this calculation" / CSV download / Print bar and the print-only summary. Off by default. */
  allowShareAndExport?: boolean;
  /** Lets the autonomy target be entered in hours instead of whole days — for a short outage that doesn't round sensibly to a full day. Off by default. */
  allowHoursDuration?: boolean;
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
  const searchParams = useSearchParams();
  const restoredShareState = useMemo(
    () => decodeLoadListShareState(searchParams, config.calculatorType, nextToolRowId),
    // Intentionally read only once on mount (searchParams from the URL the
    // visitor actually landed on) — re-decoding on every keystroke-driven
    // searchParams change would fight the visitor's own edits, since this
    // component never pushes its live state back into the address bar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [devices, setDevices] = useState<DeviceInput[]>(
    () => restoredShareState?.devices.length ? restoredShareState.devices : seedDevices(config),
  );
  const [days, setDays] = useState(() => restoredShareState?.days ?? 1);
  const [dailySolarWh, setDailySolarWh] = useState(() => restoredShareState?.dailySolarWh ?? 0);
  const [efficiencyPct, setEfficiencyPct] = useState(
    () => restoredShareState?.efficiencyPct ?? Math.round(DEFAULT_ASSUMPTIONS.systemEfficiency * 100),
  );
  const [reservePct, setReservePct] = useState(
    () => restoredShareState?.reservePct ?? Math.round(DEFAULT_ASSUMPTIONS.reserveFraction * 100),
  );
  const [prefs, setPrefs] = useState<RecommendationPreferences>(() => restoredShareState?.prefs ?? {});
  const [exampleKey, setExampleKey] = useState("");
  const [restoredNotice] = useState(() => restoredShareState != null);

  // Daily-energy entry mode (config.allowDailyEnergyMode only) — purely a UI
  // convenience layered on top of the same DeviceInput[] the engine already
  // consumes; see deriveWattsAndHoursFromDailyEnergy in tools-engine.ts.
  const [entryMode, setEntryMode] = useState<"watts" | "daily-energy">(
    () => restoredShareState?.entryMode ?? "watts",
  );
  const [dailyEnergyEntries, setDailyEnergyEntries] = useState<
    Record<string, { raw: string; unit: DailyEnergyUnit }>
  >(() => restoredShareState?.dailyEnergyEntries ?? {});

  // Solar panel estimator (config.allowSolarEstimator only) — pre-fills
  // dailySolarWh; the visitor can still overwrite that field by hand.
  const [durationUnit, setDurationUnit] = useState<"days" | "hours">(
    () => (restoredShareState != null && restoredShareState.days < 1 ? "hours" : "days"),
  );
  const [hoursRaw, setHoursRaw] = useState(
    () => (restoredShareState != null && restoredShareState.days < 1
      ? Math.round(restoredShareState.days * 24)
      : 24),
  );
  const [showSolarEstimator, setShowSolarEstimator] = useState(
    () => restoredShareState?.solar.source === "panel-spec",
  );
  const [panelWatts, setPanelWatts] = useState(() => restoredShareState?.solar.panelWatts ?? 100);
  const [peakSunHours, setPeakSunHours] = useState(() => restoredShareState?.solar.peakSunHours ?? 4);
  const [solarRealizationPct, setSolarRealizationPct] = useState(
    () => restoredShareState?.solar.realizationPct ?? 70,
  );
  /**
   * Whether the current `dailySolarWh` figure came from the panel-spec
   * estimator (a product-agnostic, uncapped best case that must be capped
   * to each product's OWN solar_input_w before it means anything for a
   * specific model — see the per-product solarCoveredProductIds/
   * autonomyByProductId computation below) or was typed directly by the
   * visitor (a single number we cannot safely re-derive per product, since
   * we don't know what panel wattage — if any — produced it). Defaults to
   * "manual" and flips to "panel-spec" only when "Use this estimate" is
   * clicked, or when a shared link explicitly carried a complete, valid
   * panel-spec parameter set (see tools-share-state.ts's
   * `hasCompletePanelSpec`) — an incomplete or tampered set always decodes
   * to "manual" there, never silently to "panel-spec". Either way, this
   * value is used ONLY for display (which entry the Runtime Index table's
   * per-product autonomy uses) — it never feeds `recommendations` below,
   * which is always computed from the battery-only `result`.
   */
  const [solarSource, setSolarSource] = useState<"manual" | "panel-spec">(
    () => restoredShareState?.solar.source ?? "manual",
  );

  // Resolved client-side only (see PrintSummary's generatedAt prop doc) so
  // the printed report never mismatches between a statically-built server
  // render and the browser's hydration render.
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  useEffect(() => {
    setGeneratedAt(new Date());
  }, []);

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

  /**
   * Product classification (Suitable/Best Fit/Good Fit/Oversized/Not
   * Suitable) and the headline "recommended minimum capacity" are ALWAYS
   * battery-only — no solar contribution, manual or panel-spec, ever
   * reduces the capacity/output requirement fed to recommendProducts.
   *
   * Neither solar source is safe to apply uniformly across every product
   * for a commercial ranking: a manually-typed Wh/day figure may have been
   * measured at ONE specific station's charging port and cannot be assumed
   * to transfer to a different model's port, and a panel-spec estimate is
   * only ever capped to a SPECIFIC product's own solar_input_w (see
   * estimateProductDailySolarWh below) — a single global capacity
   * requirement has no such per-product concept. Solar is instead shown as
   * a clearly separate, secondary planning layer: an aggregate deficit
   * stat (informational only, see the `solar &&` block passed to
   * ToolResultsBlock) and, for the panel-spec path specifically, a genuine
   * per-product autonomy estimate in the Runtime Index table below, capped
   * to each product's own verified rating. This is intentionally identical
   * for every /tools calculator built on this component (RV, Home Backup
   * included) — a solar figure here was always either global-manual (this
   * exact same architectural gap) or absent.
   */
  const recommendations = useMemo(() => {
    if (!hasUsableInput(devices)) return [];
    return recommendProducts(result, catalog, prefs);
  }, [result, catalog, prefs, devices]);

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
        recommended_capacity_wh: Math.round(result.recommendedMinimumCapacityWh),
      });
    }
  }, [ready, result.recommendedMinimumCapacityWh, config.calculatorType]);

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

  /** Daily-energy mode: the visitor edits one "daily energy" figure + unit for a row; watts/hoursPerDay are derived so calculatePower never sees a second input shape. */
  const updateDailyEnergyRow = (id: string, raw: string, unit: DailyEnergyUnit) => {
    setDailyEnergyEntries((prev) => ({ ...prev, [id]: { raw, unit } }));
    const parsed = Number(raw);
    const dailyWh = Number.isFinite(parsed) && parsed > 0 ? dailyEnergyUnitToWh(parsed, unit) : 0;
    const { watts, hoursPerDay } = deriveWattsAndHoursFromDailyEnergy(dailyWh);
    updateRow(id, { watts, hoursPerDay });
  };

  /** The per-unit daily Wh a row currently represents, from its live watts × hoursPerDay — used to show the daily-energy field's equivalent value the instant a row is first seen in that mode (a newly switched-to row, or a preset/custom row added while already in that mode), rather than a blank field backed by a hidden, un-displayed figure. */
  const rowDailyWh = (row: DeviceInput) => Math.round(row.watts * row.hoursPerDay);

  /** Renders a Wh figure in the given display unit — the inverse of dailyEnergyUnitToWh, for showing an equivalent value the visitor hasn't explicitly typed. */
  const formatDailyWhForUnit = (dailyWh: number, unit: DailyEnergyUnit): string => {
    if (dailyWh <= 0) return "";
    if (unit === "kWh") return String(Math.round((dailyWh / 1000) * 100) / 100);
    if (unit === "kWhYear") return String(Math.round(((dailyWh * 365) / 1000) * 100) / 100);
    return String(dailyWh);
  };

  /**
   * Switching ONLY the unit dropdown (not the number) must re-express the
   * SAME underlying energy value in the new unit — never silently
   * reinterpret the same digits as if they meant something ~365x or 1000x
   * different. Converts the row's current daily Wh (from its stored raw
   * entry if the visitor has typed one, or its live watts × hoursPerDay
   * otherwise) into the new unit's number before handing off to
   * updateDailyEnergyRow.
   */
  const changeDailyEnergyUnit = (row: DeviceInput, newUnit: DailyEnergyUnit) => {
    const stored = dailyEnergyEntries[row.id];
    const currentDailyWh = stored
      ? dailyEnergyUnitToWh(Number(stored.raw) || 0, stored.unit)
      : rowDailyWh(row);
    updateDailyEnergyRow(row.id, formatDailyWhForUnit(currentDailyWh, newUnit), newUnit);
  };

  const applySolarEstimate = () => {
    const estimated = estimateDailySolarWh({
      panelWatts,
      peakSunHours,
      realizationFraction: solarRealizationPct / 100,
    });
    setDailySolarWh(Math.round(estimated));
    setSolarSource("panel-spec");
  };

  const buildShareUrl = () => {
    const solarShareState: SolarShareState = {
      source: solarSource,
      panelWatts,
      peakSunHours,
      realizationPct: solarRealizationPct,
    };
    const query = encodeLoadListShareState(
      { devices, days, dailySolarWh, efficiencyPct, reservePct, prefs, entryMode, dailyEnergyEntries, solar: solarShareState },
      config.calculatorType,
      config.prefsConfig,
    );
    return `${SITE.url}${config.toolPath}?${query}`;
  };

  // Battery-only, always — see the `recommendations` comment above for why
  // no solar source (manual or panel-spec) may reduce this uniformly across
  // every product. This same figure feeds ToolResultsBlock's per-card
  // "estimated autonomy" stat and the Runtime Index table's default
  // (non-panel-spec) column — the panel-spec branch below overrides it
  // per-product instead of using this shared figure.
  const autonomyDailyEnergyWh = result.dailyEnergyWh;

  /**
   * Per-product "solar may already cover this" flag — PANEL-SPEC ONLY. Only
   * the panel-spec path ever computes a genuine per-product figure (each
   * product's own solar_input_w caps the contribution), so only it can
   * honestly claim a specific product's load may be covered. A manually-
   * typed Wh/day figure never populates this set, even when it fully
   * offsets the aggregate daily load (see the independent, aggregate-only
   * "Daily deficit after solar" stat passed to ToolResultsBlock instead) —
   * applying it per-product here would imply a per-product claim the
   * engine cannot actually back for that source (see the `recommendations`
   * comment above for the full reasoning).
   */
  const solarCoveredProductIds = useMemo(() => {
    const covered = new Set<string>();
    if (!solarEnabled || dailySolarWh <= 0 || solarSource !== "panel-spec") return covered;
    if (result.dailyEnergyWh <= 0) return covered;
    for (const rec of recommendations) {
      const productDailySolarWh = estimateProductDailySolarWh({
        panelWatts,
        peakSunHours,
        realizationFraction: solarRealizationPct / 100,
        productSolarInputW: rec.product.solar_input_w,
      });
      if (productDailySolarWh != null && productDailySolarWh >= result.dailyEnergyWh) {
        covered.add(rec.product.id);
      }
    }
    return covered;
  }, [solarEnabled, dailySolarWh, solarSource, recommendations, panelWatts, peakSunHours, solarRealizationPct, result.dailyEnergyWh]);

  const autonomyByProductId = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const rec of recommendations) {
      if (solarSource === "panel-spec" && solarEnabled && dailySolarWh > 0) {
        const productDailySolarWh = estimateProductDailySolarWh({
          panelWatts,
          peakSunHours,
          realizationFraction: solarRealizationPct / 100,
          productSolarInputW: rec.product.solar_input_w,
        });
        if (productDailySolarWh == null) {
          // Unverified solar_input_w — never assumed to accept the full
          // panel wattage, so there is nothing safe to compute.
          map.set(rec.product.id, null);
          continue;
        }
        const productNetDailyEnergyWh = Math.max(0, result.dailyEnergyWh - productDailySolarWh);
        map.set(
          rec.product.id,
          productNetDailyEnergyWh > 0
            ? estimateAutonomyUnits(rec.product.capacity_wh, productNetDailyEnergyWh, efficiencyPct / 100)
            : null, // fully covered — see solarCoveredProductIds for the honest display text
        );
      } else {
        map.set(
          rec.product.id,
          estimateAutonomyUnits(rec.product.capacity_wh, autonomyDailyEnergyWh, efficiencyPct / 100),
        );
      }
    }
    return map;
  }, [
    recommendations,
    autonomyDailyEnergyWh,
    efficiencyPct,
    solarSource,
    solarEnabled,
    dailySolarWh,
    panelWatts,
    peakSunHours,
    solarRealizationPct,
    result.dailyEnergyWh,
  ]);

  // Always battery-only, matching the headline capacity number exactly — a
  // formula that subtracted solar here while the number above didn't would
  // be its own (new) bug.
  const formulaText = `= (${result.dailyEnergyWh.toLocaleString("en-US")} Wh/day × ${days} ${days === 1 ? "day" : "days"}) ÷ ${efficiencyPct}% usable × (1 + ${reservePct}% reserve)`;

  const handleCsvDownload = () => {
    const csv = buildRuntimeIndexCsv(
      recommendations,
      autonomyByProductId,
      {
        toolTitle: config.toolTitle,
        generatedAtIso: new Date().toISOString(),
        siteUrl: `${SITE.url}${config.toolPath}`,
        formulaText,
        dailyEnergyWh: result.dailyEnergyWh,
        recommendedCapacityWh: result.recommendedMinimumCapacityWh,
        requiredContinuousOutputW: result.requiredContinuousOutputW,
        requiredSurgeOutputW: result.requiredSurgeOutputW,
        days,
        efficiencyPct,
        reservePct,
        autonomyUnitPlural: config.autonomyUnit.plural,
      },
      solarCoveredProductIds,
    );
    downloadCsv(csv, `powermatchlab-${config.calculatorType}-runtime-index.csv`);
    trackEvent("csv_download", { content_key: "tool" });
  };

  return (
    <div>
      {restoredNotice ? (
        <Callout tone="info" dark className="mt-4">
          Restored a shared calculation from this link. Every value below is
          editable — change anything to recalculate.
        </Callout>
      ) : null}

      <div className="print:hidden">
      {config.allowDailyEnergyMode ? (
        <fieldset className="mt-4">
          <legend className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Enter loads as
          </legend>
          <div className="mt-1.5 flex flex-wrap gap-2 text-sm">
            <label className="inline-flex items-center gap-1.5 text-navy-200">
              <input
                type="radio"
                name="entry-mode"
                checked={entryMode === "watts"}
                onChange={() => setEntryMode("watts")}
                className="h-4 w-4 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
              />
              Watts × hours/day
            </label>
            <label className="inline-flex items-center gap-1.5 text-navy-200">
              <input
                type="radio"
                name="entry-mode"
                checked={entryMode === "daily-energy"}
                onChange={() => setEntryMode("daily-energy")}
                className="h-4 w-4 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
              />
              Daily or annual energy — from an EnergyGuide label or a plug-in meter
            </label>
          </div>
          {entryMode === "daily-energy" ? (
            <p className="mt-1.5 text-xs text-navy-400">
              The yellow US EnergyGuide label on a refrigerator states ANNUAL
              consumption in kWh/year, not a daily figure — select
              &ldquo;kWh/year&rdquo; below and PowerMatchLab divides by 365 for you.
              A 24-hour reading from a plug-in energy meter is a daily figure
              already, so use Wh/day or kWh/day for that instead.
            </p>
          ) : null}
        </fieldset>
      ) : null}

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
              {entryMode === "daily-energy" ? (
                <th scope="col" className="px-2 py-2 font-medium" colSpan={2}>
                  Daily energy
                </th>
              ) : (
                <>
                  <th scope="col" className="px-2 py-2 font-medium">Power (W)</th>
                  <th scope="col" className="px-2 py-2 font-medium">Hrs/day</th>
                </>
              )}
              <th scope="col" className="px-2 py-2 font-medium">{config.quantityLabel}</th>
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
              // A row with no explicit entry yet in this mode (just switched
              // into daily-energy mode, or a preset/custom row added while
              // already in it) shows the EQUIVALENT of its current
              // watts x hoursPerDay rather than a blank field — the engine
              // keeps using row.watts/row.hoursPerDay regardless, so a blank
              // field here would visually hide a real, nonzero figure still
              // driving the calculation below.
              const storedDailyEntry = dailyEnergyEntries[row.id];
              const dailyEntryUnit = storedDailyEntry?.unit ?? "Wh";
              const dailyEntry = storedDailyEntry ?? {
                raw: formatDailyWhForUnit(rowDailyWh(row), dailyEntryUnit),
                unit: dailyEntryUnit,
              };
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
                  {entryMode === "daily-energy" ? (
                    <td className="px-2 py-2" colSpan={2}>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          inputMode="decimal"
                          value={dailyEntry.raw}
                          onChange={(e) => updateDailyEnergyRow(row.id, e.target.value, dailyEntry.unit)}
                          aria-label="Daily energy"
                          className={cn("w-20", darkInput)}
                        />
                        <select
                          value={dailyEntry.unit}
                          onChange={(e) => changeDailyEnergyUnit(row, e.target.value as DailyEnergyUnit)}
                          aria-label="Daily energy unit"
                          className={cn("py-1.5", darkSelect)}
                        >
                          <option value="Wh">Wh/day</option>
                          <option value="kWh">kWh/day</option>
                          <option value="kWhYear">kWh/year (EnergyGuide label)</option>
                        </select>
                      </div>
                    </td>
                  ) : (
                    <>
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
                          min={0}
                          max={24}
                          step={0.5}
                          value={row.hoursPerDay}
                          onChange={(e) => updateRow(row.id, { hoursPerDay: Number(e.target.value) || 0 })}
                          aria-label="Hours per day"
                          className={cn("w-16", darkInput)}
                        />
                      </td>
                    </>
                  )}
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
          {config.allowHoursDuration ? (
            <div className="mb-2 flex flex-wrap gap-2 text-xs">
              <label className="inline-flex items-center gap-1.5 text-navy-200">
                <input
                  type="radio"
                  name="duration-unit"
                  checked={durationUnit === "days"}
                  onChange={() => {
                    setDurationUnit("days");
                    setDays((d) => Math.max(1, Math.round(d)));
                  }}
                  className="h-3.5 w-3.5 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
                />
                Whole days
              </label>
              <label className="inline-flex items-center gap-1.5 text-navy-200">
                <input
                  type="radio"
                  name="duration-unit"
                  checked={durationUnit === "hours"}
                  onChange={() => {
                    setDurationUnit("hours");
                    setDays(Math.min(config.daysMax, Math.max(1 / 24, hoursRaw / 24)));
                  }}
                  className="h-3.5 w-3.5 border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
                />
                Hours (for a short outage)
              </label>
            </div>
          ) : null}
          {durationUnit === "hours" && config.allowHoursDuration ? (
            <label className="block text-sm font-medium text-white">
              {config.daysLabel.replace("Days", "Hours")}
              <input
                type="number"
                min={1}
                max={config.daysMax * 24}
                step={1}
                value={hoursRaw || ""}
                onChange={(e) => {
                  const h = Number(e.target.value) || 0;
                  setHoursRaw(h);
                  setDays(Math.min(config.daysMax, Math.max(1 / 24, h / 24)));
                }}
                aria-label="Outage duration in hours"
                className={cn("mt-1 w-full", darkInput)}
              />
              <span className="mt-1 block text-xs text-navy-400">
                {hoursRaw || 0} hour{hoursRaw === 1 ? "" : "s"} ≈ {(days).toFixed(2)} days used in the
                calculation below.
              </span>
            </label>
          ) : (
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
          )}
          {config.solarLabel ? (
            <label className="mt-4 block text-sm font-medium text-white">
              {config.solarLabel}
              <input
                type="number"
                min={0}
                value={dailySolarWh || ""}
                onChange={(e) => {
                  setDailySolarWh(Math.max(0, Number(e.target.value) || 0));
                  setSolarSource("manual");
                }}
                placeholder="0"
                className={cn("mt-1 w-full", darkInput)}
              />
              <span className="mt-1 block text-xs text-navy-400">
                Leave at 0 if you have no solar recharge. This is a planning estimate
                of your panel&rsquo;s realistic daily output, not a guarantee of sun.
                This single figure is applied the same way to every product below;
                if you measured it at one specific station&rsquo;s charging port,
                results for a different model may vary in reality, since PowerMatchLab
                has no way to know that station&rsquo;s own solar input rating.
              </span>
            </label>
          ) : null}
          {config.solarLabel && config.allowSolarEstimator ? (
            <details
              open={showSolarEstimator}
              onToggle={(e) => setShowSolarEstimator(e.currentTarget.open)}
              className="mt-3 rounded-lg border border-navy-700 bg-navy-900/60 p-3"
            >
              <summary className="cursor-pointer text-xs font-semibold text-cyan-300">
                Don&rsquo;t know your daily solar Wh? Estimate it from panel specs
              </summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="text-xs text-navy-300">
                  Panel wattage
                  <input
                    type="number"
                    min={0}
                    value={panelWatts || ""}
                    onChange={(e) => setPanelWatts(Number(e.target.value) || 0)}
                    className={cn("mt-1 w-full", darkInput)}
                  />
                </label>
                <label className="text-xs text-navy-300">
                  Peak sun hours/day
                  <input
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    value={peakSunHours || ""}
                    onChange={(e) => setPeakSunHours(Number(e.target.value) || 0)}
                    className={cn("mt-1 w-full", darkInput)}
                  />
                </label>
                <label className="text-xs text-navy-300">
                  Realistic yield: <strong className="text-white">{solarRealizationPct}%</strong>
                  <input
                    type="range"
                    min={40}
                    max={90}
                    step={5}
                    value={solarRealizationPct}
                    onChange={(e) => setSolarRealizationPct(Number(e.target.value))}
                    className="mt-2 w-full accent-cyan-400"
                  />
                </label>
              </div>
              <p className="mt-2 text-[11px] text-navy-400">
                &ldquo;Peak sun hours&rdquo; is not the same as hours of daylight — it&rsquo;s
                the equivalent hours at full rated output. Realistic yield accounts for
                angle, temperature, haze and wiring losses; 60-80% is a common planning
                range, never the full nameplate wattage.
              </p>
              <p className="mt-2 text-[11px] text-navy-400">
                Four different numbers matter here, and they are not interchangeable:
                your <strong className="text-navy-300">panel&rsquo;s nameplate wattage</strong> (entered
                above), each station&rsquo;s own <strong className="text-navy-300">solar input
                rating</strong> (its charging port&rsquo;s hardware limit — see the Runtime Index
                table below), the <strong className="text-navy-300">estimated daily
                production</strong> that actually results (capped to whichever of those two
                is smaller), and the <strong className="text-navy-300">daily deficit</strong> still
                left for the battery to cover. A bigger panel than a station&rsquo;s own
                rating cannot charge it any faster than that rating allows — so once you
                use this estimator, the Runtime Index table below shows each product&rsquo;s
                own solar-adjusted estimate, capped to its own rating, rather than one
                number applied to every model.
              </p>
              <button
                type="button"
                onClick={applySolarEstimate}
                className="mt-3 rounded-md border border-cyan-400/40 bg-navy-900/60 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-navy-800"
              >
                Use this estimate ({Math.round(estimateDailySolarWh({ panelWatts, peakSunHours, realizationFraction: solarRealizationPct / 100 })).toLocaleString("en-US")} Wh/day)
              </button>
            </details>
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

      </div>

      <div className="mt-8">
        <ToolResultsBlock
          ready={ready}
          notReadyMessage="Add at least one load with a running-watts value above to get a result."
          headlineLabel={
            solarEnabled && dailySolarWh > 0
              ? "Recommended minimum capacity (battery only, no solar credit)"
              : "Recommended minimum capacity"
          }
          headlineValueWh={result.recommendedMinimumCapacityWh}
          formulaText={formulaText}
          stats={[
            { label: "Total daily energy", value: fmtWh(result.dailyEnergyWh) },
            // Informational/aggregate only — see the `recommendations`
            // comment above. Shown for ANY nonzero solar input (manual or
            // panel-spec) since it never feeds capacity, classification, or
            // any single product's autonomy figure; it just states what a
            // stated solar contribution would mean in aggregate.
            ...(solar && dailySolarWh > 0
              ? [{ label: "Daily deficit after solar (planning estimate)", value: fmtWh(solar.dailyDeficitWh) }]
              : []),
            { label: "Required continuous output", value: fmtWatts(result.requiredContinuousOutputW) },
            { label: "Required surge capability", value: fmtWatts(result.requiredSurgeOutputW) },
          ]}
          solar={solar}
          efficiency={efficiencyPct / 100}
          autonomyDailyEnergyWh={autonomyDailyEnergyWh}
          autonomyUnit={config.autonomyUnit}
          recommendations={recommendations}
        />
        {ready && solarEnabled && dailySolarWh > 0 ? (
          <Callout tone="info" dark className="mt-4">
            {solarSource === "panel-spec" ? (
              <>
                Because this used the panel-spec estimator, the capacity and
                classification above are calculated WITHOUT solar credit — a
                station&rsquo;s real charging rate depends on its own solar
                input rating, not just your panels&rsquo; wattage, so
                PowerMatchLab never applies one uncapped estimate to every
                product&rsquo;s classification. The Runtime Index table below
                shows each product&rsquo;s own solar-adjusted autonomy
                estimate instead, capped to that product&rsquo;s own verified
                solar input rating.
              </>
            ) : (
              <>
                This manual solar figure is shown only as an aggregate
                planning scenario (see &ldquo;Daily deficit after solar&rdquo;
                above) — it does <strong>not</strong> change the capacity,
                classification, or any single product&rsquo;s autonomy
                estimate below, since the same Wh/day figure may not transfer
                to every station&rsquo;s charging port. To see a
                solar-adjusted autonomy estimate that correctly varies by
                each product&rsquo;s own solar input rating, use the
                panel-spec estimator above instead.
              </>
            )}
          </Callout>
        ) : null}
      </div>

      {ready && config.allowShareAndExport ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
            <ShareBar
              url={buildShareUrl}
              title={config.toolTitle}
              contentKey="tool"
            />
            <button
              type="button"
              onClick={handleCsvDownload}
              className="inline-flex items-center gap-1.5 rounded-md border border-navy-700 px-3 py-1.5 text-xs font-medium text-navy-300 hover:border-navy-500 hover:text-white"
            >
              Download Runtime Index (CSV)
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md border border-navy-700 px-3 py-1.5 text-xs font-medium text-navy-300 hover:border-navy-500 hover:text-white"
            >
              Print / Save as PDF
            </button>
          </div>

          <PrintSummary
            toolTitle={config.toolTitle}
            siteUrl={SITE.url}
            formulaText={formulaText}
            generatedAt={generatedAt}
            inputsSummary={devices
              .filter((d) => d.watts > 0)
              .map((d) => {
                const surgeSuffix =
                  d.surgeWatts != null
                    ? `, surge ${d.surgeWatts} W (user-entered)`
                    : ", surge not entered — a conservative multiplier was assumed";
                const dailyEntry = dailyEnergyEntries[d.id];
                if (entryMode === "daily-energy" && dailyEntry && dailyEntry.raw !== "") {
                  const unitLabel =
                    dailyEntry.unit === "Wh" ? "Wh/day" : dailyEntry.unit === "kWh" ? "kWh/day" : "kWh/year";
                  return `${d.name || "Load"}: entered as ${dailyEntry.raw} ${unitLabel} → ${rowDailyWh(d).toLocaleString("en-US")} Wh/day derived × ${d.quantity}${surgeSuffix}`;
                }
                return `${d.name || "Load"}: ${d.watts} W × ${d.quantity} × ${d.hoursPerDay} h/day${surgeSuffix}`;
              })
              .concat([
                `Autonomy target: ${days} ${days === 1 ? "day" : "days"}`,
                dailySolarWh > 0
                  ? `Daily solar recharge (${solarSource === "panel-spec" ? "estimated from panel specs, capped per product in the table below" : "user estimate"}): ${Math.round(dailySolarWh)} Wh/day`
                  : "No solar recharge entered",
              ])}
            assumptionsSummary={[
              `Usable efficiency: ${efficiencyPct}% (PowerMatchLab assumption — ${ASSUMPTION_NOTES.systemEfficiency})`,
              `Reserve headroom: ${reservePct}% (PowerMatchLab assumption — ${ASSUMPTION_NOTES.reserveFraction})`,
            ]}
            resultsSummary={[
              `Total daily energy: ${fmtWh(result.dailyEnergyWh)}`,
              `Recommended minimum capacity: ${fmtWh(result.recommendedMinimumCapacityWh)}`,
              `Required continuous output: ${fmtWatts(result.requiredContinuousOutputW)}`,
              `Required surge capability: ${fmtWatts(result.requiredSurgeOutputW)}`,
            ]}
            productCount={catalog.length}
          />

          {config.showRuntimeIndexTable ? (
            <div className="mt-10">
              <RuntimeIndexTable
                recommendations={recommendations}
                autonomyByProductId={autonomyByProductId}
                autonomyUnit={config.autonomyUnit}
                catalogCount={catalog.length}
                solarCoveredProductIds={solarCoveredProductIds}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
