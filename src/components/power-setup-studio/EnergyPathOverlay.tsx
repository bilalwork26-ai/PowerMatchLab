import type { StudioAnchor, StudioApplianceInstance } from "@/lib/power-setup-scenarios";
import type { BatteryVisualState } from "@/lib/power-setup-calc";
import { cn } from "@/lib/cn";

/**
 * The animated "energy journey" overlay: solar → battery → devices.
 *
 * Same technique as the home page hero (components/home/HeroVisual.tsx):
 * quadratic-curve SVG paths in a 0-100 PERCENTAGE viewBox, so the whole
 * overlay scales and re-aligns with the photo at any aspect ratio instead of
 * breaking on fixed pixel coordinates. The `.energy-particles` / `dash-flow`
 * animation and the page-wide `prefers-reduced-motion` rule in globals.css
 * already collapse this to a static state for anyone who asked for it —
 * nothing extra to wire up here.
 *
 * Every path element stays mounted at all times (on and off) and only its
 * opacity changes, with a CSS transition on that opacity — so switching a
 * device on/off fades its line in or out instead of an instant pop. Only
 * the moving "particle" dash animation is added/removed with the on state.
 *
 * Purely decorative (`aria-hidden`): the real state is announced through the
 * accessible device-control list and the `aria-live` summary, not this SVG.
 */

const FADE_TRANSITION = { transition: "opacity 500ms ease" } as const;

function pathFor(anchor: StudioAnchor, battery: StudioAnchor): string {
  const midX = (anchor.x + battery.x) / 2;
  const midY = (anchor.y + battery.y) / 2;
  return `M ${anchor.x} ${anchor.y} Q ${midX} ${midY}, ${battery.x} ${battery.y}`;
}

export function EnergyPathOverlay({
  batteryAnchor,
  solarAnchor,
  solarActive,
  appliances,
  activeIds,
  batteryVisualState,
}: {
  batteryAnchor: StudioAnchor;
  solarAnchor: StudioAnchor | null;
  /** Whether current solar input is above 0 W (production entering the system). */
  solarActive: boolean;
  appliances: StudioApplianceInstance[];
  activeIds: Set<string>;
  batteryVisualState: BatteryVisualState;
}) {
  const batteryGlowOpacity =
    batteryVisualState === "charging" || batteryVisualState === "full"
      ? 0.55
      : batteryVisualState === "discharging"
        ? 0.4
        : 0.3;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
    >
      {solarAnchor ? (
        <g>
          <path
            d={pathFor(solarAnchor, batteryAnchor)}
            stroke="#facc15"
            strokeWidth="0.5"
            strokeLinecap="round"
            fill="none"
            opacity={solarActive ? 0.4 : 0.18}
            style={FADE_TRANSITION}
          />
          <path
            className={solarActive ? "energy-particles" : undefined}
            d={pathFor(solarAnchor, batteryAnchor)}
            stroke="#fde68a"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
            opacity={solarActive ? 0.95 : 0}
            style={FADE_TRANSITION}
          />
        </g>
      ) : null}

      {appliances.map((a) => {
        const on = activeIds.has(a.id);
        const path = pathFor(a.anchor, batteryAnchor);
        return (
          <g key={a.id}>
            <path
              d={path}
              stroke="#67e8f9"
              strokeWidth="0.4"
              strokeLinecap="round"
              fill="none"
              opacity={on ? 0.4 : 0.12}
              style={FADE_TRANSITION}
            />
            <path
              className={on ? "energy-particles" : undefined}
              d={path}
              stroke="#a5f3fc"
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
              opacity={on ? 0.95 : 0}
              style={FADE_TRANSITION}
            />
          </g>
        );
      })}

      {/* Battery glow node — intensity/state read from the simulated battery state,
          eased between states instead of jumping, with a soft breathing pulse
          while actively charging or discharging (calm/static once balanced or full). */}
      <circle
        cx={batteryAnchor.x}
        cy={batteryAnchor.y}
        r="3.2"
        fill="#22d3ee"
        opacity={batteryGlowOpacity}
        className={cn(
          "energy-path",
          (batteryVisualState === "charging" || batteryVisualState === "discharging") &&
            "animate-pulse-soft",
        )}
        style={FADE_TRANSITION}
      />
    </svg>
  );
}
