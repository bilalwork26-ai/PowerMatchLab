"use client";

import { cn } from "@/lib/cn";
import {
  BATTERY_STATE_LABELS,
  type BatteryVisualState,
} from "@/lib/power-setup-calc";

const STATE_BADGE_CLASS: Record<BatteryVisualState, string> = {
  charging: "bg-positive-500/15 text-positive-400 border-positive-500/40",
  full: "bg-positive-500/15 text-positive-400 border-positive-500/40",
  balanced: "bg-cyan-400/15 text-cyan-300 border-cyan-400/40",
  discharging: "bg-amber-400/15 text-amber-300 border-amber-400/40",
  low: "bg-red-500/15 text-red-300 border-red-500/40",
};

export function BatterySimPanel({
  hasSolar,
  solarInputW,
  onSolarInputChange,
  batteryStatePct,
  onBatteryStateChange,
  days,
  onDaysChange,
  netChargingW,
  netDischargeW,
  batteryVisualState,
}: {
  hasSolar: boolean;
  solarInputW: number;
  onSolarInputChange: (w: number) => void;
  batteryStatePct: number;
  onBatteryStateChange: (pct: number) => void;
  days: number;
  onDaysChange: (d: number) => void;
  netChargingW: number;
  netDischargeW: number;
  batteryVisualState: BatteryVisualState;
}) {
  return (
    <div className="glass-panel space-y-4 bg-navy-900/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Battery &amp; solar simulation</p>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            STATE_BADGE_CLASS[batteryVisualState],
          )}
        >
          {BATTERY_STATE_LABELS[batteryVisualState]}
        </span>
      </div>

      <label className="block text-sm">
        <span className="flex items-center justify-between text-navy-200">
          Simulated battery level
          <strong className="text-white">{batteryStatePct}%</strong>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={batteryStatePct}
          onChange={(e) => onBatteryStateChange(Number(e.target.value))}
          className="mt-2 w-full accent-cyan-400"
          aria-label="Simulated battery level percent"
        />
        <span className="mt-1 block text-[11px] text-navy-400">
          A control you set for this simulation, not a hardware reading — the site
          is not connected to a real battery.
        </span>
      </label>

      {hasSolar ? (
        <label className="block text-sm">
          <span className="flex items-center justify-between text-navy-200">
            Current solar input
            <strong className="text-white">{solarInputW} W</strong>
          </span>
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={solarInputW}
            onChange={(e) => onSolarInputChange(Number(e.target.value))}
            className="mt-2 w-full accent-amber-400"
            aria-label="Current solar input watts"
          />
          <span className="mt-1 block text-[11px] text-navy-400">
            Represents instantaneous production right now, not guaranteed energy for
            the whole day. Solar production varies. Matching recommendations do not
            assume guaranteed solar energy.
          </span>
        </label>
      ) : null}

      <div className="rounded-lg bg-navy-950/50 p-3 text-sm">
        {netChargingW > 0 ? (
          <p className="font-semibold text-positive-400">
            Net charging: +{Math.round(netChargingW)} W
          </p>
        ) : netDischargeW > 0 ? (
          <p className="font-semibold text-amber-300">
            Net discharging: −{Math.round(netDischargeW)} W
          </p>
        ) : (
          <p className="font-semibold text-navy-300">Load and solar input are balanced.</p>
        )}
      </div>

      <label className="block text-sm">
        <span className="text-navy-200">Backup duration to calculate</span>
        <input
          type="range"
          min={1}
          max={7}
          step={1}
          value={days}
          onChange={(e) => onDaysChange(Number(e.target.value))}
          className="mt-2 w-full accent-cyan-400"
          aria-label="Backup duration to calculate, in days"
        />
        <span className="mt-1 block text-sm text-navy-300">
          {days} {days === 1 ? "day" : "days"} — energy demand ×{days}
        </span>
      </label>
    </div>
  );
}
