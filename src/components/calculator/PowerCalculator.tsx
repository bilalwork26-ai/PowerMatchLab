"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Product, UseCaseKey } from "@/types/product";
import {
  APPLIANCE_EXAMPLES,
  getApplianceExample,
} from "@/lib/appliances";
import {
  DEFAULT_ASSUMPTIONS,
  ASSUMPTION_NOTES,
} from "@/lib/assumptions";
import {
  calculatePower,
  hasUsableInput,
  type DeviceInput,
} from "@/lib/calculator";
import {
  groupRecommendations,
  pickRecommendationHighlights,
  recommendProducts,
  type RecommendationPreferences,
} from "@/lib/recommend";
import { fmtWh, fmtWatts } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { Callout } from "@/components/ui/Callout";
import { EstimateFactorsDisclosure } from "@/components/ui/EstimateFactorsDisclosure";
import { EnergyLines } from "@/components/ui/EnergyLines";
import { AnimatedStat } from "@/components/ui/AnimatedStat";
import { RecommendationCard } from "./RecommendationCard";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";

let ROW_SEQ = 0;
const nextRowId = () => `row-${Date.now()}-${ROW_SEQ++}`;

function seededDevices(): DeviceInput[] {
  const fridge = getApplianceExample("fridge")!;
  const lights = getApplianceExample("led-lights")!;
  const phone = getApplianceExample("phone")!;
  return [fridge, lights, phone].map((a) => ({
    id: nextRowId(),
    name: a.name,
    watts: a.runningWatts,
    quantity: 1,
    hoursPerDay: a.hoursPerDay,
    surgeWatts: a.surgeWatts,
  }));
}

const USE_CASE_OPTIONS: { key: "" | UseCaseKey; label: string }[] = [
  { key: "", label: "Not sure yet" },
  { key: "camping", label: "Camping" },
  { key: "rv", label: "RV" },
  { key: "refrigerator-backup", label: "Refrigerator backup" },
  { key: "home-backup", label: "Home backup" },
];

const STEPS = [
  { n: 1, title: "Add Your Devices", hint: "List what you need to power." },
  { n: 2, title: "Set Usage & Runtime", hint: "How long, and any hard requirements." },
  { n: 3, title: "Your Power Needs", hint: "Results and recommendations." },
];

const darkSelect =
  "rounded-md border border-navy-700 bg-navy-900/60 py-1.5 pl-2 pr-7 text-sm text-white outline-none transition-shadow duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";
const darkInput =
  "rounded-md border border-navy-700 bg-navy-900/60 px-2 py-1.5 text-white outline-none transition-shadow duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

export function PowerCalculator({ catalog }: { catalog: Product[] }) {
  // Starts empty — no pre-loaded devices, no result shown until the visitor
  // adds at least one real device (or explicitly loads the labeled example
  // via loadExampleSetup below). See hasUsableInput()/`ready` for the gate.
  const [devices, setDevices] = useState<DeviceInput[]>([]);
  const [days, setDays] = useState(DEFAULT_ASSUMPTIONS.defaultDays);
  const [efficiencyPct, setEfficiencyPct] = useState(
    Math.round(DEFAULT_ASSUMPTIONS.systemEfficiency * 100),
  );
  const [reservePct, setReservePct] = useState(
    Math.round(DEFAULT_ASSUMPTIONS.reserveFraction * 100),
  );
  const [prefs, setPrefs] = useState<RecommendationPreferences>({
    useCase: null,
    needs240V: false,
    needsTT30: false,
    wantsExpandable: false,
    prioritisePortability: false,
    allowExpansionForCapacity: false,
  });
  const [step, setStep] = useState(1);
  const [exampleKey, setExampleKey] = useState("");
  // True only for the untouched fridge/lights/phone rows loaded via
  // loadExampleSetup() below. Flips to false the moment the visitor edits,
  // removes or adds a device — never shown as if it were still the original
  // example once real data is in play. Starts false: the calculator itself
  // starts empty, not pre-loaded with the example.
  const [isDefaultExample, setIsDefaultExample] = useState(false);
  // Advanced settings (usable efficiency, reserve headroom, surge fallback)
  // are collapsed by default — most visitors never need to touch them.
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  // Recommendations: only the top 3 primary (Best/Good Fit) matches show by
  // default; "View all compatible models" reveals the rest of that same
  // group. Reset whenever the primary set changes size so a fresh
  // calculation doesn't stay stuck expanded from a previous, larger result.
  const [showAllPrimary, setShowAllPrimary] = useState(false);

  const result = useMemo(
    () =>
      calculatePower(
        devices,
        { days },
        {
          systemEfficiency: efficiencyPct / 100,
          reserveFraction: reservePct / 100,
        },
      ),
    [devices, days, efficiencyPct, reservePct],
  );

  const recommendations = useMemo(() => {
    if (!hasUsableInput(devices)) return [];
    return recommendProducts(result, catalog, prefs);
  }, [result, catalog, prefs, devices]);

  // A fresh calculation should never stay expanded from a previous, larger
  // result — collapse back to the top-3 view whenever the recommendation
  // set itself changes (new devices, assumptions, or preferences).
  useEffect(() => {
    setShowAllPrimary(false);
  }, [recommendations]);

  const ready = hasUsableInput(devices);

  // calculator_start fires the first time the visitor moves past step 1;
  // calculator_completed the first time they reach a real (ready) result on
  // step 3. Each fires at most once per page load — a single guided pass
  // through the wizard is one funnel event, not one per re-visit of a step.
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  useEffect(() => {
    if (step >= 2 && !startedRef.current) {
      startedRef.current = true;
      trackEvent("calculator_start");
    }
    if (step === 3 && ready && !completedRef.current) {
      completedRef.current = true;
      trackEvent("calculator_completed", {
        recommended_capacity_wh: Math.round(result.recommendedMinimumCapacityWh),
      });
    }
  }, [step, ready, result.recommendedMinimumCapacityWh]);

  const invalidRows = devices.filter(
    (d) => d.name.trim() !== "" && (d.watts <= 0 || d.quantity <= 0),
  );

  // --- device row helpers ---------------------------------------------------
  const updateRow = (id: string, patch: Partial<DeviceInput>) => {
    setIsDefaultExample(false);
    setDevices((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const removeRow = (id: string) => {
    setIsDefaultExample(false);
    setDevices((rows) => rows.filter((r) => r.id !== id));
  };
  const addCustom = () => {
    setIsDefaultExample(false);
    setDevices((rows) => [
      ...rows,
      {
        id: nextRowId(),
        name: "",
        watts: 0,
        quantity: 1,
        hoursPerDay: DEFAULT_ASSUMPTIONS.defaultHoursPerDay,
        surgeWatts: null,
      },
    ]);
  };
  const addExample = (key: string) => {
    const ex = getApplianceExample(key);
    if (!ex) return;
    setIsDefaultExample(false);
    setDevices((rows) => [
      ...rows,
      {
        id: nextRowId(),
        name: ex.name,
        watts: ex.runningWatts,
        quantity: 1,
        hoursPerDay: ex.hoursPerDay,
        surgeWatts: ex.surgeWatts,
      },
    ]);
    setExampleKey("");
  };
  /** The ONLY way the fridge/lights/phone example is ever loaded — an explicit visitor action, never the initial state. */
  const loadExampleSetup = () => {
    setIsDefaultExample(true);
    setDevices(seededDevices());
  };
  const resetAll = () => {
    setIsDefaultExample(false);
    setDevices([]);
    setDays(DEFAULT_ASSUMPTIONS.defaultDays);
    setEfficiencyPct(Math.round(DEFAULT_ASSUMPTIONS.systemEfficiency * 100));
    setReservePct(Math.round(DEFAULT_ASSUMPTIONS.reserveFraction * 100));
    setPrefs({
      useCase: null,
      needs240V: false,
      needsTT30: false,
      wantsExpandable: false,
      prioritisePortability: false,
      allowExpansionForCapacity: false,
    });
    setStep(1);
  };

  const { primary, oversized, possible, notSuitable } = groupRecommendations(recommendations);
  const highlights = useMemo(() => pickRecommendationHighlights(primary), [primary]);
  const visiblePrimary = showAllPrimary ? primary : primary.slice(0, 3);
  const hiddenPrimaryCount = primary.length - visiblePrimary.length;

  return (
    <div className="bg-navy-950 py-8 text-white">
      <div className="container-page grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Left rail */}
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <ol className="space-y-2">
          {STEPS.map((s) => (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => setStep(s.n)}
                aria-current={step === s.n ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left",
                  step === s.n
                    ? "border-cyan-400/50 bg-navy-800 shadow-glow-cyan"
                    : "border-navy-700 bg-navy-900/60 hover:bg-navy-800",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                    step === s.n
                      ? "bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-glow-cyan"
                      : "bg-navy-800 text-navy-300",
                  )}
                >
                  {s.n}
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">
                    {s.title}
                  </span>
                  <span className="block text-xs text-navy-400">{s.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="glass-panel mt-4 bg-navy-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Quick summary
          </p>
          {!ready ? (
            <p className="mt-2 text-sm text-navy-300">
              Add at least one device to see your numbers here.
            </p>
          ) : null}
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-navy-400">Total daily energy</dt>
              <dd className="font-semibold text-white">{ready ? fmtWh(result.dailyEnergyWh) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-400">Peak / continuous</dt>
              <dd className="font-semibold text-white">
                {ready ? fmtWatts(result.requiredContinuousOutputW) : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-400">Runtime target</dt>
              <dd className="font-semibold text-white">
                {days} {days === 1 ? "day" : "days"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-navy-700 pt-1.5">
              <dt className="text-navy-400">Recommended capacity</dt>
              <dd className="font-bold text-cyan-300">
                {ready ? fmtWh(result.recommendedMinimumCapacityWh) : "—"}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={resetAll}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-navy-300 hover:text-white"
          >
            <TrashIcon width={13} height={13} /> Reset calculator
          </button>
        </div>

        <label className="mt-4 block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Your use case
          </span>
          <select
            value={prefs.useCase ?? ""}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                useCase: (e.target.value || null) as UseCaseKey | null,
              }))
            }
            className={cn("mt-1.5 w-full", darkSelect)}
          >
            {USE_CASE_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </aside>

      {/* Main panel. min-w-0 keeps this grid item from growing to fit the
          device table's min-w-[680px] below — without it, the whole page
          widens on narrow viewports instead of just the table scrolling. */}
      <div className="min-w-0 space-y-8">
        {/* STEP 1 */}
        <section hidden={step !== 1} aria-labelledby="step1-h">
          <h2 id="step1-h" className="text-xl font-bold text-white">
            Step 1 of 3 · Add Your Devices
          </h2>
          <p className="mt-1 text-sm text-navy-300">
            {devices.length === 0
              ? "Add your own devices below, or try a labeled example setup to see how the calculator works."
              : "The example wattages below are starting points, not universal values — edit every field to match your actual devices. A plug-in energy meter gives the most accurate numbers."}
          </p>

          {isDefaultExample ? (
            <Callout tone="neutral" dark className="mt-3">
              <strong className="text-white">Example setup</strong> — the fridge,
              lights and phone below are a starting demo, not a personalized
              recommendation. Replace these devices with yours, or edit any field
              directly, to get a result for your own setup.
            </Callout>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="text-sm">
              <span className="sr-only">Add an example appliance</span>
              <select
                value={exampleKey}
                onChange={(e) => {
                  setExampleKey(e.target.value);
                  if (e.target.value) addExample(e.target.value);
                }}
                className={darkSelect}
              >
                <option value="">+ Add example appliance…</option>
                {APPLIANCE_EXAMPLES.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.name} (~{a.runningWatts} W)
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={addCustom}
              className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/40 bg-navy-900/60 px-3 py-2 text-sm font-medium text-cyan-300 hover:bg-navy-800"
            >
              <PlusIcon width={15} height={15} /> Add custom device
            </button>
            {devices.length === 0 ? (
              <button
                type="button"
                onClick={loadExampleSetup}
                className="inline-flex items-center gap-1.5 rounded-md bg-navy-800 px-3 py-2 text-sm font-medium text-navy-200 hover:bg-navy-700"
              >
                Try an example setup
              </button>
            ) : null}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-left text-xs uppercase tracking-wide text-navy-400">
                  <th scope="col" className="py-2 pr-2 font-medium">Device</th>
                  <th scope="col" className="px-2 py-2 font-medium">Power (W)</th>
                  <th scope="col" className="px-2 py-2 font-medium">Qty</th>
                  <th scope="col" className="px-2 py-2 font-medium">Hrs/day</th>
                  <th scope="col" className="px-2 py-2 font-medium">
                    Surge (W)
                    <span className="block text-[10px] normal-case text-navy-500">
                      optional — blank uses a {DEFAULT_ASSUMPTIONS.assumedSurgeMultiplier}&times; fallback
                    </span>
                  </th>
                  <th scope="col" className="px-2 py-2 font-medium">Wh/day</th>
                  <th scope="col" className="py-2 pl-2 font-medium">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {devices.map((row) => {
                  const wh = Math.round(
                    Math.max(0, row.watts) *
                      Math.max(0, row.quantity) *
                      Math.max(0, row.hoursPerDay),
                  );
                  return (
                    <tr key={row.id} className="border-b border-navy-800">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) =>
                            updateRow(row.id, { name: e.target.value })
                          }
                          placeholder="e.g. Chest freezer"
                          aria-label="Device name"
                          className={cn("w-full min-w-[140px]", darkInput)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={row.watts || ""}
                          onChange={(e) =>
                            updateRow(row.id, {
                              watts: Number(e.target.value) || 0,
                            })
                          }
                          aria-label="Running watts"
                          className={cn("w-20", darkInput)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={1}
                          value={row.quantity}
                          onChange={(e) =>
                            updateRow(row.id, {
                              quantity: Number(e.target.value) || 0,
                            })
                          }
                          aria-label="Quantity"
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
                          onChange={(e) =>
                            updateRow(row.id, {
                              hoursPerDay: Number(e.target.value) || 0,
                            })
                          }
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
                              surgeWatts:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value) || 0,
                            })
                          }
                          placeholder="—"
                          aria-label="Startup surge watts (optional)"
                          className={cn("w-20", darkInput)}
                        />
                      </td>
                      <td className="px-2 py-2 font-semibold tabular-nums text-white">
                        {wh.toLocaleString("en-US")}
                      </td>
                      <td className="py-2 pl-2">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          aria-label={`Remove ${row.name || "device"}`}
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
                    <td colSpan={7} className="py-6 text-center text-navy-400">
                      No devices yet. Add a custom device, an example appliance, or try the example setup above to begin.
                    </td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-navy-700 font-semibold">
                  <td className="py-2 pr-2 text-white">Total</td>
                  <td className="px-2 py-2 tabular-nums text-white">
                    {result.requiredContinuousOutputW.toLocaleString("en-US")} W
                  </td>
                  <td />
                  <td />
                  <td className="px-2 py-2 tabular-nums text-navy-400">
                    ≈{result.requiredSurgeOutputW.toLocaleString("en-US")} W peak
                  </td>
                  <td className="px-2 py-2 tabular-nums text-cyan-300">
                    {result.dailyEnergyWh.toLocaleString("en-US")}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {invalidRows.length ? (
            <Callout tone="warn" dark live className="mt-4">
              {invalidRows.length} row{invalidRows.length > 1 ? "s have" : " has"} a
              name but a zero (or missing) power or quantity, so{" "}
              {invalidRows.length > 1 ? "they are" : "it is"} ignored in the
              totals. Enter a running-watts value to include{" "}
              {invalidRows.length > 1 ? "them" : "it"}.
            </Callout>
          ) : null}

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!ready}
              className={cn(
                "rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-brand-700 hover:shadow-glow-brand",
                !ready && "cursor-not-allowed opacity-60 hover:translate-y-0 hover:bg-brand-600 hover:shadow-none",
              )}
              title={
                !ready
                  ? "Add at least one device with a running-watts value to continue."
                  : undefined
              }
            >
              Next: usage &amp; runtime →
            </button>
          </div>
        </section>

        {/* STEP 2 */}
        <section hidden={step !== 2} aria-labelledby="step2-h">
          <h2 id="step2-h" className="text-xl font-bold text-white">
            Step 2 of 3 · Set Usage &amp; Runtime
          </h2>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="glass-panel bg-navy-900/60 p-4">
              <label className="block text-sm font-medium text-white">
                Days of autonomy (no recharge)
                <input
                  type="range"
                  min={1}
                  max={7}
                  step={1}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="mt-2 w-full accent-cyan-400"
                />
                <span className="mt-1 block text-sm text-navy-300">
                  {days} {days === 1 ? "day" : "days"} — energy demand ×{days}
                </span>
              </label>
              <p className="mt-2 text-xs text-navy-400">
                If you can recharge from solar or the grid each day, keep this at
                1. Increase it for outages with no way to recharge.
              </p>
            </div>

            <details className="glass-panel bg-navy-900/60 p-4" open={advancedSettingsOpen} onToggle={(e) => setAdvancedSettingsOpen(e.currentTarget.open)}>
              <summary className="cursor-pointer text-sm font-medium text-white">
                Advanced settings
                <span className="ml-1.5 font-normal text-navy-400">
                  (usable efficiency, reserve headroom, surge fallback)
                </span>
              </summary>
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
              <p className="text-[11px] text-navy-400">
                {ASSUMPTION_NOTES.systemEfficiency}
              </p>
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
              <p className="text-[11px] text-navy-400">
                {ASSUMPTION_NOTES.reserveFraction}
              </p>
              <p className="mt-3 text-sm text-navy-200">
                Surge fallback: <strong className="text-white">{DEFAULT_ASSUMPTIONS.assumedSurgeMultiplier}&times;</strong> running watts
              </p>
              <p className="text-[11px] text-navy-400">
                {ASSUMPTION_NOTES.assumedSurgeMultiplier}
              </p>
            </details>
          </div>

          <fieldset className="glass-panel mt-6 bg-navy-900/60 p-4">
            <legend className="px-1 text-sm font-medium text-white">
              Hard requirements &amp; preferences
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <PrefCheck
                label="I need native 120/240V output"
                checked={!!prefs.needs240V}
                onChange={(v) => setPrefs((p) => ({ ...p, needs240V: v }))}
              />
              <PrefCheck
                label="I need an RV TT-30 outlet"
                checked={!!prefs.needsTT30}
                onChange={(v) => setPrefs((p) => ({ ...p, needsTT30: v }))}
              />
              <PrefCheck
                label="I need to be able to add expansion batteries later"
                checked={!!prefs.wantsExpandable}
                onChange={(v) => setPrefs((p) => ({ ...p, wantsExpandable: v }))}
              />
              <PrefCheck
                label="Prioritise low weight / portability"
                checked={!!prefs.prioritisePortability}
                onChange={(v) =>
                  setPrefs((p) => ({ ...p, prioritisePortability: v }))
                }
              />
              <PrefCheck
                label="Count expansion capacity toward my capacity need"
                checked={!!prefs.allowExpansionForCapacity}
                onChange={(v) =>
                  setPrefs((p) => ({ ...p, allowExpansionForCapacity: v }))
                }
              />
            </div>
          </fieldset>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-navy-200 hover:bg-navy-800"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-brand-700 hover:shadow-glow-brand"
            >
              See your power needs →
            </button>
          </div>
        </section>

        {/* STEP 3 */}
        <section hidden={step !== 3} aria-labelledby="step3-h">
          <h2 id="step3-h" className="text-xl font-bold text-white">
            Step 3 of 3 · Your Power Needs
          </h2>

          {!ready ? (
            <Callout tone="warn" dark live className="mt-4">
              Add at least one device with a running-watts value in Step 1 to get
              a result.
            </Callout>
          ) : (
            <>
              <div className="surface-dark relative mt-4 overflow-hidden p-5 text-white">
                <EnergyLines className="opacity-30" />
                <div className="relative">
                  <p className="text-sm text-navy-300">Recommended minimum capacity</p>
                  <p className="mt-1 text-4xl font-bold">
                    <AnimatedStat value={result.recommendedMinimumCapacityWh} />{" "}
                    <span className="text-xl font-medium text-navy-300">Wh</span>
                  </p>
                  <p className="mt-1 text-xs text-navy-400">
                    = ({result.dailyEnergyWh.toLocaleString("en-US")} Wh/day × {days}{" "}
                    {days === 1 ? "day" : "days"}) ÷ {efficiencyPct}% usable ×{" "}
                    (1 + {reservePct}% reserve)
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <ResultStat
                      label="Total daily energy"
                      value={fmtWh(result.dailyEnergyWh)}
                    />
                    <ResultStat
                      label="Required usable capacity"
                      value={fmtWh(result.requiredUsableCapacityWh)}
                    />
                    <ResultStat
                      label="Required continuous output"
                      value={fmtWatts(result.requiredContinuousOutputW)}
                    />
                    <ResultStat
                      label="Required surge capability"
                      value={fmtWatts(result.requiredSurgeOutputW)}
                    />
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
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-md bg-navy-800 px-2.5 py-1 font-medium text-navy-200 hover:bg-navy-700"
                >
                  Adjust assumptions
                </button>
              </div>

              {/* Recommendations */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recommended Power Stations</h3>
                  <Link
                    href="/compare"
                    className="text-sm font-medium text-cyan-300 hover:underline"
                  >
                    Compare your shortlist →
                  </Link>
                </div>
                <p className="mt-1 text-sm text-navy-300">
                  Every product is classified in two steps: whether it meets your
                  hard requirements (units that don&rsquo;t are{" "}
                  <strong>Not Suitable</strong>, shown with the reason rather than
                  hidden), then how proportionate it is to your need — a unit far
                  larger than necessary is labeled <strong>Oversized</strong> rather
                  than presented as a top pick.
                </p>

                {primary.length ? (
                  <>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {visiblePrimary.map((rec) => (
                        <RecommendationCard
                          key={rec.product.id}
                          rec={rec}
                          tone="dark"
                          badge={highlights[rec.product.id]}
                          location="power_calculator"
                        />
                      ))}
                    </div>
                    {hiddenPrimaryCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowAllPrimary(true)}
                        className="mt-4 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-navy-200 hover:bg-navy-800"
                      >
                        View all compatible models ({primary.length})
                      </button>
                    ) : null}
                  </>
                ) : (
                  <Callout tone="warn" dark live className="mt-4">
                    No product in the current catalog is a proportionate match for
                    this requirement.{" "}
                    {oversized.length
                      ? "Larger, oversized alternatives are listed below."
                      : "The closest options are listed under “Possible match” below — check their limitations carefully."}
                  </Callout>
                )}

                {oversized.length ? (
                  <details className="mt-6" open={primary.length === 0}>
                    <summary className="cursor-pointer text-sm font-semibold text-navy-200">
                      Oversized alternatives — larger than you need ({oversized.length})
                    </summary>
                    <p className="mt-2 text-xs text-navy-400">
                      These fully meet your requirement but carry much more capacity
                      or output than your calculation needs.
                    </p>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      {oversized.map((rec) => (
                        <RecommendationCard key={rec.product.id} rec={rec} tone="dark" location="power_calculator" />
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
                        <RecommendationCard key={rec.product.id} rec={rec} tone="dark" location="power_calculator" />
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
                        <RecommendationCard key={rec.product.id} rec={rec} tone="dark" location="power_calculator" />
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>

              <Callout tone="neutral" dark className="mt-8" title="Why these results?">
                Recommendations are deterministic and happen in two steps: first
                compatibility (continuous output, capacity, surge, and any 240V/
                TT-30/expansion requirement you set), then proportionality — a unit
                that merely clears the minimum isn&rsquo;t ranked the same as one
                actually sized for your need, and units many times larger are
                labeled Oversized rather than shown as a top pick. Nothing here is
                sponsored, and whether a product has an Amazon link never affects
                its ranking.
              </Callout>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-navy-700 px-5 py-2.5 text-sm font-semibold text-navy-200 hover:bg-navy-800"
                >
                  ← Edit devices
                </button>
              </div>
            </>
          )}
        </section>
      </div>
      </div>
    </div>
  );
}

function PrefCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 rounded-md border border-navy-700 p-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
      />
      <span className="text-navy-200">{label}</span>
    </label>
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
