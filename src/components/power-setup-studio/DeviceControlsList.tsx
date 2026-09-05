"use client";

import type { StudioApplianceInstance } from "@/lib/power-setup-scenarios";
import { getApplianceIcon } from "./applianceIcons";
import { cn } from "@/lib/cn";

export interface DeviceRuntimeState {
  on: boolean;
  quantity: number;
  hoursPerDay: number;
  watts: number;
}

/**
 * Full accessible HTML controls for every device in the current scenario —
 * the primary way to operate the Studio for keyboard and screen-reader
 * users, independent of the on-image hotspots in SceneStage.
 */
export function DeviceControlsList({
  appliances,
  state,
  onToggle,
  onQuantityChange,
  onHoursChange,
}: {
  appliances: StudioApplianceInstance[];
  state: Record<string, DeviceRuntimeState>;
  onToggle: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onHoursChange: (id: string, hours: number) => void;
}) {
  return (
    <ul className="space-y-2">
      {appliances.map((a) => {
        const s = state[a.id];
        const Icon = getApplianceIcon(a.applianceKey);
        return (
          <li
            key={a.id}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors duration-300",
              s.on
                ? "border-cyan-400/40 bg-navy-900/70"
                : "border-navy-700 bg-navy-900/30",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                s.on ? "bg-cyan-400/20 text-cyan-300" : "bg-navy-800 text-navy-400",
              )}
            >
              <Icon width={18} height={18} />
            </span>

            <div className="min-w-[120px] flex-1">
              <p className="text-sm font-medium text-white">{a.label}</p>
              <p className="text-xs text-navy-400">
                Example draw — edit to match your device: ~{s.watts} W
              </p>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-navy-300">
              Qty
              <input
                type="number"
                min={0}
                max={20}
                value={s.quantity}
                onChange={(e) => onQuantityChange(a.id, Number(e.target.value) || 0)}
                aria-label={`${a.label} quantity`}
                className="w-14 rounded-md border border-navy-700 bg-navy-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <label className="flex items-center gap-1.5 text-xs text-navy-300">
              Hrs/day
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={s.hoursPerDay}
                onChange={(e) => onHoursChange(a.id, Number(e.target.value) || 0)}
                aria-label={`${a.label} hours per day`}
                className="w-16 rounded-md border border-navy-700 bg-navy-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <button
              type="button"
              role="switch"
              aria-checked={s.on}
              aria-label={`${s.on ? "Turn off" : "Turn on"} ${a.label}`}
              onClick={() => onToggle(a.id)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
                s.on ? "border-cyan-400 bg-cyan-500/80" : "border-navy-600 bg-navy-800",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300",
                  s.on ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
