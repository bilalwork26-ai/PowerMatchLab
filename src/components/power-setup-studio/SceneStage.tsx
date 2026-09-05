"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { StudioScenario } from "@/lib/power-setup-scenarios";
import type { BatteryVisualState } from "@/lib/power-setup-calc";
import { BATTERY_STATE_LABELS } from "@/lib/power-setup-calc";
import { SunIcon, BatteryIcon } from "@/components/ui/icons";
import { getApplianceIcon } from "./applianceIcons";
import { EnergyPathOverlay } from "./EnergyPathOverlay";
import { Parallax } from "@/components/ui/Parallax";

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

const BATTERY_STATE_COLOR: Record<BatteryVisualState, string> = {
  charging: "text-positive-400 border-positive-400/50",
  full: "text-positive-400 border-positive-400/50",
  balanced: "text-cyan-300 border-cyan-400/50",
  discharging: "text-amber-300 border-amber-400/50",
  low: "text-red-300 border-red-400/60",
};

export function SceneStage({
  scenario,
  activeIds,
  onToggle,
  solarInputW,
  batteryVisualState,
  priority,
}: {
  scenario: StudioScenario;
  activeIds: Set<string>;
  onToggle: (id: string) => void;
  solarInputW: number;
  batteryVisualState: BatteryVisualState;
  priority: boolean;
}) {
  const overlay = useCursorParallax(5);

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
          batteryVisualState={batteryVisualState}
        />

        {/* Solar marker — decorative; the real "current solar input" control lives in the panel below. */}
        {scenario.solarAnchor ? (
          <div
            aria-hidden="true"
            className={cn(
              "absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-navy-950/70 backdrop-blur-sm transition-colors duration-300",
              solarInputW > 0 ? "border-amber-300/70 text-amber-300 shadow-glow-soft" : "border-navy-600 text-navy-400",
            )}
            style={{ left: `${scenario.solarAnchor.x}%`, top: `${scenario.solarAnchor.y}%` }}
          >
            <SunIcon width={16} height={16} />
          </div>
        ) : null}

        {/* Battery marker — decorative; state also announced in the accessible summary.
            A soft breathing pulse while actively charging/discharging signals the
            central battery is "live"; balanced/full stays calm and static. */}
        <div
          className={cn(
            "absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 bg-navy-950/80 backdrop-blur-sm transition-[transform,color,border-color] duration-300",
            BATTERY_STATE_COLOR[batteryVisualState],
            (batteryVisualState === "charging" || batteryVisualState === "discharging") &&
              "animate-pulse-soft",
          )}
          style={{ left: `${scenario.batteryAnchor.x}%`, top: `${scenario.batteryAnchor.y}%` }}
          aria-hidden="true"
          title={BATTERY_STATE_LABELS[batteryVisualState]}
        >
          <BatteryIcon width={20} height={20} />
        </div>

        {/* Device hotspots — REAL accessible buttons (min 44px target), not the only
            way to toggle a device (the control list below duplicates every one of
            these), but a nice direct-manipulation shortcut for a mouse/touch user. */}
        {scenario.appliances.map((a) => {
          const on = activeIds.has(a.id);
          const Icon = getApplianceIcon(a.applianceKey);
          return (
            <button
              key={a.id}
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={a.label}
              onClick={() => onToggle(a.id)}
              className={cn(
                "absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 backdrop-blur-sm transition-[transform,box-shadow,background-color,color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
                on
                  ? "scale-110 border-cyan-300 bg-navy-900/80 text-cyan-200 shadow-glow-cyan"
                  : "border-navy-500 bg-navy-950/70 text-navy-300 hover:border-navy-300 hover:text-white",
              )}
              style={{ left: `${a.anchor.x}%`, top: `${a.anchor.y}%` }}
            >
              {on ? (
                <span
                  aria-hidden="true"
                  className="animate-pulse-soft absolute inset-0 rounded-full bg-cyan-400/25"
                />
              ) : null}
              <Icon width={18} height={18} className="relative" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
