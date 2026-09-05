"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import {
  STUDIO_SCENARIOS,
  getStudioScenario,
  resolveApplianceInstance,
  type StudioScenario,
} from "@/lib/power-setup-scenarios";
import { calculatePower, hasUsableInput, type DeviceInput } from "@/lib/calculator";
import { recommendProducts } from "@/lib/recommend";
import {
  computeSolarFlow,
  getBatteryVisualState,
} from "@/lib/power-setup-calc";
import { cn } from "@/lib/cn";
import { ScenarioTabs } from "./ScenarioTabs";
import { SceneStage } from "./SceneStage";
import { DeviceControlsList, type DeviceRuntimeState } from "./DeviceControlsList";
import { BatterySimPanel } from "./BatterySimPanel";
import { StudioResults } from "./StudioResults";
import { MatchingStations } from "./MatchingStations";
import { TrashIcon } from "@/components/ui/icons";

const DEFAULT_SOLAR_INPUT_W = 200;
const DEFAULT_BATTERY_PCT = 65;
const DEFAULT_DAYS = 1;

function buildDeviceState(scenario: StudioScenario): Record<string, DeviceRuntimeState> {
  const state: Record<string, DeviceRuntimeState> = {};
  for (const a of scenario.appliances) {
    const resolved = resolveApplianceInstance(a);
    state[a.id] = {
      on: a.defaultOn,
      quantity: a.defaultQuantity,
      hoursPerDay: resolved.hoursPerDay,
      watts: resolved.runningWatts,
    };
  }
  return state;
}

export function PowerSetupStudio({ catalog }: { catalog: Product[] }) {
  const [scenarioId, setScenarioId] = useState(STUDIO_SCENARIOS[0].id);
  const scenario = getStudioScenario(scenarioId)!;

  const [deviceState, setDeviceState] = useState(() => buildDeviceState(scenario));
  const [solarInputW, setSolarInputW] = useState(DEFAULT_SOLAR_INPUT_W);
  const [batteryStatePct, setBatteryStatePct] = useState(DEFAULT_BATTERY_PCT);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [calculated, setCalculated] = useState(false);
  const [showStations, setShowStations] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  function selectScenario(id: string) {
    const next = getStudioScenario(id);
    if (!next) return;
    setScenarioId(id);
    setDeviceState(buildDeviceState(next));
    setSolarInputW(DEFAULT_SOLAR_INPUT_W);
    setBatteryStatePct(DEFAULT_BATTERY_PCT);
    setDays(DEFAULT_DAYS);
    setCalculated(false);
    setShowStations(false);
    setAnnouncement(`Scenario changed to ${next.label}.`);
  }

  function resetScenario() {
    setDeviceState(buildDeviceState(scenario));
    setSolarInputW(DEFAULT_SOLAR_INPUT_W);
    setBatteryStatePct(DEFAULT_BATTERY_PCT);
    setDays(DEFAULT_DAYS);
    setCalculated(false);
    setShowStations(false);
    setAnnouncement(`${scenario.label} reset to its starting setup.`);
  }

  function toggleDevice(id: string) {
    setDeviceState((prev) => ({
      ...prev,
      [id]: { ...prev[id], on: !prev[id].on },
    }));
  }

  function setQuantity(id: string, quantity: number) {
    setDeviceState((prev) => ({
      ...prev,
      [id]: { ...prev[id], quantity: Math.max(0, quantity) },
    }));
  }

  function setHours(id: string, hours: number) {
    setDeviceState((prev) => ({
      ...prev,
      [id]: { ...prev[id], hoursPerDay: Math.max(0, Math.min(24, hours)) },
    }));
  }

  const activeIds = useMemo(
    () =>
      new Set(
        scenario.appliances
          .filter((a) => deviceState[a.id]?.on && deviceState[a.id]?.quantity > 0)
          .map((a) => a.id),
      ),
    [scenario, deviceState],
  );

  const devices: DeviceInput[] = useMemo(
    () =>
      scenario.appliances
        .filter((a) => activeIds.has(a.id))
        .map((a) => {
          const s = deviceState[a.id];
          const resolved = resolveApplianceInstance(a);
          return {
            id: a.id,
            name: a.label,
            watts: s.watts,
            quantity: s.quantity,
            hoursPerDay: s.hoursPerDay,
            surgeWatts: resolved.surgeWatts,
          };
        }),
    [scenario, deviceState, activeIds],
  );

  const result = useMemo(
    () => calculatePower(devices, { days }),
    [devices, days],
  );

  const activeLoadW = result.requiredContinuousOutputW;
  const { netChargingW, netDischargeW } = computeSolarFlow(activeLoadW, solarInputW);
  const batteryVisualState = getBatteryVisualState({
    batteryStatePct,
    netChargingW,
    netDischargeW,
  });

  const recommendations = useMemo(() => {
    if (!hasUsableInput(devices)) return [];
    return recommendProducts(result, catalog, { useCase: scenario.useCase });
  }, [result, catalog, scenario, devices]);

  const ready = hasUsableInput(devices);

  function handleCalculate() {
    setCalculated(true);
    setShowStations(false);
    setAnnouncement(
      `Calculated: recommended minimum capacity ${result.recommendedMinimumCapacityWh.toLocaleString(
        "en-US",
      )} watt-hours.`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ScenarioTabs activeId={scenarioId} onSelect={selectScenario} />
        <button
          type="button"
          onClick={resetScenario}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-300 hover:text-white"
        >
          <TrashIcon width={13} height={13} /> Reset this scenario
        </button>
      </div>

      <div
        id="scenario-panel"
        role="tabpanel"
        aria-labelledby={`scenario-tab-${scenario.id}`}
      >
        <SceneStage
          scenario={scenario}
          activeIds={activeIds}
          onToggle={toggleDevice}
          solarInputW={scenario.solarAnchor ? solarInputW : 0}
          batteryVisualState={batteryVisualState}
          priority={scenarioId === STUDIO_SCENARIOS[0].id}
        />
        <p className="mx-auto mt-2 max-w-4xl text-center text-[11px] text-navy-400">
          Interactive illustrative scene — not an exact product or installation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold text-white">
            {calculated ? "Your setup" : "Your Live Setup"}
          </h2>
          <DeviceControlsList
            appliances={scenario.appliances}
            state={deviceState}
            onToggle={toggleDevice}
            onQuantityChange={setQuantity}
            onHoursChange={setHours}
          />
        </div>

        <BatterySimPanel
          hasSolar={scenario.solarAnchor != null}
          solarInputW={solarInputW}
          onSolarInputChange={setSolarInputW}
          batteryStatePct={batteryStatePct}
          onBatteryStateChange={setBatteryStatePct}
          days={days}
          onDaysChange={setDays}
          netChargingW={netChargingW}
          netDischargeW={netDischargeW}
          batteryVisualState={batteryVisualState}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCalculate}
          disabled={!ready}
          className={cn(
            "rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-brand-700 hover:shadow-glow-brand",
            !ready && "cursor-not-allowed opacity-60 hover:translate-y-0 hover:bg-brand-600 hover:shadow-none",
          )}
        >
          Calculate This Setup
        </button>
        {calculated ? (
          <button
            type="button"
            onClick={() => setShowStations(true)}
            className="rounded-lg border border-cyan-400/40 px-5 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-navy-800"
          >
            View Matching Stations
          </button>
        ) : null}
      </div>

      {!ready ? (
        <p className="text-sm text-navy-400">
          Turn on at least one device above to get a result.
        </p>
      ) : null}

      {calculated && ready ? <StudioResults result={result} /> : null}

      {showStations && ready ? (
        <div>
          <h2 className="text-lg font-semibold text-white">Matching Stations</h2>
          <MatchingStations
            recommendations={recommendations}
            batteryStatePct={batteryStatePct}
            netDischargeW={netDischargeW}
          />
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
