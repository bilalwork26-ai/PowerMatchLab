import { RUNTIME_EXAMPLES } from "@/lib/runtime";
import { DEFAULT_ASSUMPTIONS, RUNTIME_EFFICIENCY } from "@/lib/assumptions";
import { BoltIcon, CpapIcon, FridgeIcon, LaptopIcon, TvIcon } from "@/components/ui/icons";

/**
 * Decorative hero graphic: a generic, non-photographic power-station shape
 * with four device chips connected by animated energy lines.
 *
 * Every number shown is pulled live from the site's own already-published
 * planning constants (src/lib/runtime.ts / src/lib/assumptions.ts) — the
 * same RUNTIME_EXAMPLES device wattages used on every product page's
 * runtime table, and the same 85%/20% figures the Power Calculator and
 * every sizing guide already document. Nothing here is invented for the
 * hero, and the shape is intentionally generic (no brand, no model, no
 * specific product's industrial design) so it is never mistaken for a
 * real, tested product.
 */
const byKey = (key: string) => RUNTIME_EXAMPLES.find((e) => e.key === key)!.deviceWatts;

const DEVICES = [
  { key: "fridge", label: "Fridge", watts: byKey("fridge"), Icon: FridgeIcon, pos: "top-left" },
  { key: "laptop", label: "Laptop", watts: byKey("laptop"), Icon: LaptopIcon, pos: "top-right" },
  { key: "cpap", label: "CPAP", watts: byKey("cpap"), Icon: CpapIcon, pos: "bottom-left" },
  { key: "tv", label: "TV", watts: byKey("tv"), Icon: TvIcon, pos: "bottom-right" },
] as const;

const CHIP_COORDS: Record<(typeof DEVICES)[number]["pos"], { x: number; y: number }> = {
  "top-left": { x: 14, y: 18 },
  "top-right": { x: 86, y: 18 },
  "bottom-left": { x: 14, y: 82 },
  "bottom-right": { x: 86, y: 82 },
};

const chipPosClass: Record<(typeof DEVICES)[number]["pos"], string> = {
  "top-left": "left-0 top-0",
  "top-right": "right-0 top-0",
  "bottom-left": "left-0 bottom-0",
  "bottom-right": "right-0 bottom-0",
};

export function HeroDeviceGraphic() {
  const usablePct = Math.round(RUNTIME_EFFICIENCY * 100);
  const reservePct = Math.round(DEFAULT_ASSUMPTIONS.reserveFraction * 100);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-md"
      role="img"
      aria-label={`Illustration of a generic power station estimating ${usablePct}% usable energy and a ${reservePct}% reserve margin, with example planning wattages PowerMatchLab uses elsewhere on the site: fridge about ${byKey("fridge")} watts, laptop about ${byKey("laptop")} watts, CPAP about ${byKey("cpap")} watts, TV about ${byKey("tv")} watts.`}
    >
      {/* Connector lines, percentage-coordinate SVG so it scales fluidly. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {DEVICES.map((d) => {
          const { x, y } = CHIP_COORDS[d.pos];
          return (
            <path
              key={d.key}
              className="energy-path"
              d={`M ${x} ${y} L 50 50`}
              stroke="#22d3ee"
              strokeWidth="0.6"
              strokeLinecap="round"
              opacity="0.55"
            />
          );
        })}
      </svg>

      {/* Center device: an abstract, unbranded shape — not a photograph or
          a specific product's industrial design. */}
      <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 animate-float">
        <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-navy-700 to-navy-900 p-3 shadow-glow-cyan">
          <div className="flex items-center gap-1.5">
            <BoltIcon width={14} height={14} className="text-cyan-300" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-navy-300">
              Estimate
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{usablePct}%</p>
          <p className="text-[10px] leading-tight text-navy-300">usable energy</p>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-3 flex-1 rounded-sm bg-gradient-to-t from-cyan-500 to-cyan-300 animate-pulse-soft"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
          <p className="mt-2 text-[9px] leading-tight text-navy-400">
            +{reservePct}% reserve headroom · same assumptions as the Power Calculator
          </p>
        </div>
      </div>

      {/* Device chips */}
      {DEVICES.map(({ key, label, watts, Icon, pos }) => (
        <div key={key} className={`absolute w-[38%] ${chipPosClass[pos]}`}>
          <div className="flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-800/90 px-2.5 py-2 shadow-glow-soft">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-navy-700 text-cyan-300">
              <Icon width={15} height={15} />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[11px] font-semibold text-white">{label}</p>
              <p className="text-[10px] text-navy-300">~{watts} W</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
