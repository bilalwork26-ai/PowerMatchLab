"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { StudioScenario } from "@/lib/power-setup-scenarios";
import type { BatteryVisualState } from "@/lib/power-setup-calc";
import { BATTERY_STATE_LABELS } from "@/lib/power-setup-calc";
import { SunIcon, BatteryIcon } from "@/components/ui/icons";
import { EnergyPathOverlay } from "./EnergyPathOverlay";
import { Parallax } from "@/components/ui/Parallax";
import type { DeviceRuntimeState } from "./DeviceControlsList";

/**
 * Very light desktop-only cursor parallax for the energy overlay layer
 * (paths + markers), never the photo itself — moving the photo would risk
 * reading as cropping/distorting it. Capped to a few px and driven purely by
 * `transform`, so it stays cheap and never touches the underlying image.
 * Skipped entirely on touch/coarse-pointer devices and under
 * prefers-reduced-motion (checked once, matching the Parallax component's
 * own convention elsewhere in the Studio).
 */
function useCursorParallax(maxOffset = 5) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `translate(${(relX * maxOffset * 2).toFixed(1)}px, ${(relY * maxOffset * 2).toFixed(1)}px)`;
  };

  const onPointerLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0px, 0px)";
  };

  return { ref, enabled, onPointerMove, onPointerLeave };
}

/** Small, crisp marker ring/icon color — kept subtle, not a solid saturated fill. */
const BATTERY_MARKER_COLOR: Record<BatteryVisualState, string> = {
  charging: "text-emerald-300 border-emerald-400/40",
  full: "text-emerald-300 border-emerald-400/40",
  balanced: "text-cyan-200 border-cyan-300/40",
  discharging: "text-amber-200 border-amber-300/40",
  low: "text-red-300 border-red-400/50",
};

/** Soft, blurred ambient halo behind the marker — never a flat solid disc. */
const BATTERY_HALO_COLOR: Record<BatteryVisualState, string> = {
  charging: "bg-emerald-400/25",
  full: "bg-emerald-400/20",
  balanced: "bg-cyan-300/15",
  discharging: "bg-amber-300/20",
  low: "bg-red-400/20",
};

export function SceneStage({
  scenario,
  activeIds,
  deviceState,
  onToggle,
  solarInputW,
  batteryVisualState,
  priority,
}: {
  scenario: StudioScenario;
  activeIds: Set<string>;
  deviceState: Record<string, DeviceRuntimeState>;
  onToggle: (id: string) => void;
  solarInputW: number;
  batteryVisualState: BatteryVisualState;
  priority: boolean;
}) {
  const overlay = useCursorParallax(5);
  const batteryPulse = batteryVisualState === "charging" || batteryVisualState === "discharging";

  return (
    <div
      className="relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-2xl border border-navy-700 bg-navy-950 shadow-glow-soft"
      onPointerMove={overlay.onPointerMove}
      onPointerLeave={overlay.onPointerLeave}
    >
      <Parallax range={6} className="absolute inset-0 h-full w-full">
        {/* Keyed by scenario so each switch mounts a fresh element and
            restarts the fade-in. Paired with the dark flash div right below
            (same key), the old photo's instant swap is masked by the flash
            while the new one settles in, reading as one controlled
            dissolve rather than a hard cut — without juggling two
            simultaneously-mounted <Image> instances. */}
        <Image
          key={scenario.imageStem}
          src={`/power-setup-studio/${scenario.imageStem}.png`}
          alt={scenario.imageAlt}
          fill
          sizes="(min-width: 1024px) 900px, 100vw"
          className="studio-scene-fade object-cover"
          priority={priority}
        />
      </Parallax>

      {/* Brief dark flash, keyed the same way, that masks the instant <img>
          src swap underneath it while the new photo's own fade-in settles in. */}
      <div
        key={`flash-${scenario.imageStem}`}
        aria-hidden="true"
        className="studio-scene-flash pointer-events-none absolute inset-0 z-[2] bg-navy-950"
      />

      {/* Gentle bottom gradient so hotspot labels stay legible over bright sky areas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent"
      />

      {/* Energy overlay + markers layer — reacts to the cursor with a very
          small translate on desktop (never the photo itself, so the source
          image is never stretched, cropped, or otherwise altered). */}
      <div
        ref={overlay.ref}
        className="absolute inset-0 z-[6] transition-transform duration-150 ease-out"
      >
        <EnergyPathOverlay
          batteryAnchor={scenario.batteryAnchor}
          solarAnchor={scenario.solarAnchor}
          solarActive={solarInputW > 0}
          appliances={scenario.appliances}
          activeIds={activeIds}
        />

        {/* Solar marker — decorative; the real "current solar input" control lives in the panel below. */}
        {scenario.solarAnchor ? (
          <div
            aria-hidden="true"
            className={cn(
              "absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-navy-950/60 backdrop-blur-sm transition-colors duration-300",
              solarInputW > 0 ? "border-amber-300/60 text-amber-200" : "border-navy-600/70 text-navy-400",
            )}
            style={{ left: `${scenario.solarAnchor.x}%`, top: `${scenario.solarAnchor.y}%` }}
          >
            <SunIcon width={14} height={14} />
          </div>
        ) : null}

        {/* Battery — a soft, blurred ambient halo (never a flat solid disc) sitting
            behind a small, crisp marker ring. The halo bleeds outward past the
            marker so it never covers the icon itself; a slow, gentle pulse
            appears only while actively charging or discharging. */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${scenario.batteryAnchor.x}%`, top: `${scenario.batteryAnchor.y}%` }}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-[background-color,opacity] duration-700",
              BATTERY_HALO_COLOR[batteryVisualState],
              batteryPulse && "animate-pulse-soft",
            )}
          />
          <div
            className={cn(
              "relative grid h-11 w-11 place-items-center rounded-full border bg-navy-950/75 backdrop-blur-sm transition-[color,border-color] duration-300",
              BATTERY_MARKER_COLOR[batteryVisualState],
            )}
            aria-hidden="true"
            title={BATTERY_STATE_LABELS[batteryVisualState]}
          >
            <BatteryIcon width={18} height={18} />
          </div>
        </div>

        {/* Device hotspots — REAL accessible buttons (44px min target), not the
            only way to toggle a device (the control list below duplicates every
            one of these). The visible marker is a small discreet dot — not a
            large bright ring — so the photo stays the subject; a dark glass
            tooltip with the device name and its draw appears on hover/focus. */}
        {scenario.appliances.map((a) => {
          const on = activeIds.has(a.id);
          const watts = deviceState[a.id]?.watts;
          return (
            <button
              key={a.id}
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={watts != null ? `${a.label}, about ${watts} watts` : a.label}
              onClick={() => onToggle(a.id)}
              className="group absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              style={{ left: `${a.anchor.x}%`, top: `${a.anchor.y}%` }}
            >
              {/* Soft localized glow, only while the device is on. */}
              {on ? (
                <span
                  aria-hidden="true"
                  className="animate-pulse-soft absolute h-7 w-7 rounded-full bg-cyan-200/20 blur-[3px]"
                />
              ) : null}
              {/* The actual visible marker: a small dot, dim when off. */}
              <span
                aria-hidden="true"
                className={cn(
                  "relative h-2 w-2 rounded-full transition-[background-color,box-shadow,opacity] duration-500",
                  on
                    ? "bg-white opacity-100 shadow-[0_0_6px_2px_rgba(165,243,252,0.55)]"
                    : "bg-white opacity-35",
                )}
              />
              {/* Dark glass tooltip — name + draw, on hover/focus only. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-white/10 bg-navy-950/90 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg backdrop-blur-sm transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              >
                {a.label}
                {watts != null ? ` · ~${watts} W` : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
