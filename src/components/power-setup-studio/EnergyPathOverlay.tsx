import type { StudioAnchor, StudioApplianceInstance } from "@/lib/power-setup-scenarios";

/**
 * The animated "energy journey" overlay: solar → battery → devices.
 *
 * Same technique as the home page hero (components/home/HeroVisual.tsx):
 * quadratic-curve SVG paths in a 0-100 PERCENTAGE viewBox, so the whole
 * overlay scales and re-aligns with the photo at any aspect ratio instead of
 * breaking on fixed pixel coordinates.
 *
 * Deliberately restrained so the photograph stays the subject: thin,
 * semi-transparent lines and a few small traveling particles rather than
 * bright, thick "circuit board" strokes. `.studio-flow-particles-solar` /
 * `-device` (globals.css) are Studio-only — never the shared
 * `.energy-particles` used elsewhere — so tuning this never touches the
 * homepage hero. The page-wide prefers-reduced-motion rule already
 * collapses those animations to a static state; nothing extra to wire up.
 *
 * Every path element stays mounted at all times (on and off) and only its
 * opacity changes, with a CSS transition on that opacity — so switching a
 * device on/off fades its line in or out instead of an instant pop. Only
 * the moving "particle" dash animation is added/removed with the on state.
 *
 * Purely decorative (`aria-hidden`): the real state is announced through the
 * accessible device-control list and the `aria-live` summary, not this SVG.
 * The battery's own visual state (charging/discharging/etc.) is rendered as
 * a soft HTML halo in SceneStage.tsx, not in this SVG.
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
}: {
  batteryAnchor: StudioAnchor;
  solarAnchor: StudioAnchor | null;
  /** Whether current solar input is above 0 W (production entering the system). */
  solarActive: boolean;
  appliances: StudioApplianceInstance[];
  activeIds: Set<string>;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
    >
      {solarAnchor ? (
        <g>
          {/* Warm, thin, mostly-transparent baseline — never a bright saturated yellow. */}
          <path
            d={pathFor(solarAnchor, batteryAnchor)}
            stroke="#e8b969"
            strokeWidth="0.16"
            strokeLinecap="round"
            fill="none"
            opacity={solarActive ? 0.28 : 0.12}
            style={FADE_TRANSITION}
          />
          {/* Small warm particles drifting toward the battery — direction, not decoration. */}
          <path
            className={solarActive ? "studio-flow-particles-solar" : undefined}
            d={pathFor(solarAnchor, batteryAnchor)}
            stroke="#fde9c3"
            strokeWidth="0.32"
            strokeLinecap="round"
            fill="none"
            opacity={solarActive ? 0.75 : 0}
            style={FADE_TRANSITION}
          />
        </g>
      ) : null}

      {appliances.map((a) => {
        const on = activeIds.has(a.id);
        const path = pathFor(a.anchor, batteryAnchor);
        return (
          <g key={a.id}>
            {/* Cool, near-invisible baseline when off; still faint when on, so the
                photo — not the wire — stays the thing the eye lands on. */}
            <path
              d={path}
              stroke="#cfe6f2"
              strokeWidth="0.13"
              strokeLinecap="round"
              fill="none"
              opacity={on ? 0.22 : 0.05}
              style={FADE_TRANSITION}
            />
            {/* A faint, cool-white pulse — only while the device is on. */}
            <path
              className={on ? "studio-flow-particles-device" : undefined}
              d={path}
              stroke="#f3fbff"
              strokeWidth="0.26"
              strokeLinecap="round"
              fill="none"
              opacity={on ? 0.55 : 0}
              style={FADE_TRANSITION}
            />
          </g>
        );
      })}
    </svg>
  );
}
