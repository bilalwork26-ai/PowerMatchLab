import Image from "next/image";
import { RUNTIME_EXAMPLES } from "@/lib/runtime";
import { getApplianceExample } from "@/lib/appliances";
import { RUNTIME_EFFICIENCY } from "@/lib/assumptions";
import { FridgeIcon, LaptopIcon, LampIcon, RvIcon } from "@/components/ui/icons";
import { Parallax } from "@/components/ui/Parallax";

/**
 * The hero's central visual: real photography (transparent PNG cutouts,
 * no rectangular background) for the station and four example devices,
 * connected by animated SVG energy lines — plus real HTML power chips and
 * an HTML estimation panel underneath. The station sits in front of (higher
 * z-index than) the fridge and RV, which tuck in slightly behind its edges;
 * the laptop and lamp float free with a visible gap, matching the reference
 * composition. Nothing here is a flat screenshot; every text element and
 * every line is a rendered DOM/SVG node.
 *
 * Every wattage shown is pulled from the same appliance tables the Power
 * Calculator and product runtime pages use (src/lib/runtime.ts,
 * src/lib/appliances.ts) — never invented for this graphic.
 */
const fridgeWatts = RUNTIME_EXAMPLES.find((e) => e.key === "fridge")!.deviceWatts;
const laptopWatts = RUNTIME_EXAMPLES.find((e) => e.key === "laptop")!.deviceWatts;
const lampWatts = getApplianceExample("led-lights")!.runningWatts;
const rvFridgeWatts = getApplianceExample("rv-fridge-12v")!.runningWatts;

const STATION_CENTER = { x: 48, y: 50 };

const DEVICES = [
  {
    key: "fridge",
    label: "Refrigerator",
    watts: fridgeWatts,
    Icon: FridgeIcon,
    src: "/marketing/fridge-transparent.png",
    width: 607,
    height: 648,
    wrapClass: "left-[6%] top-[6%] z-0 w-[19%]",
    glow: false,
    anchor: { x: 20, y: 18 },
  },
  {
    key: "lamp",
    label: "LED lighting",
    watts: lampWatts,
    Icon: LampIcon,
    src: "/marketing/lamp-transparent.png",
    width: 512,
    height: 768,
    wrapClass: "right-[6%] top-0 z-10 w-[15%]",
    glow: true,
    anchor: { x: 84, y: 14 },
  },
  {
    key: "laptop",
    label: "Laptop",
    watts: laptopWatts,
    Icon: LaptopIcon,
    src: "/marketing/laptop-transparent.png",
    width: 768,
    height: 512,
    wrapClass: "left-0 bottom-[8%] z-10 w-[25%]",
    glow: false,
    anchor: { x: 14, y: 80 },
  },
  {
    key: "rv",
    label: "RV fridge (12V)",
    watts: rvFridgeWatts,
    Icon: RvIcon,
    src: "/marketing/rv-transparent.png",
    width: 768,
    height: 512,
    wrapClass: "right-0 bottom-[9%] z-0 w-[22%]",
    glow: false,
    anchor: { x: 86, y: 74 },
  },
] as const;

const SPARKLES = [
  { top: "18%", left: "40%", delay: "0s", size: 3 },
  { top: "30%", left: "66%", delay: "0.6s", size: 2 },
  { top: "62%", left: "34%", delay: "1.1s", size: 2 },
  { top: "70%", left: "62%", delay: "1.7s", size: 3 },
  { top: "44%", left: "58%", delay: "0.3s", size: 2 },
];

export function HeroVisual() {
  const efficiencyPct = Math.round(RUNTIME_EFFICIENCY * 100);

  return (
    <div className="w-full">
      <div className="relative mx-auto aspect-[11/10] w-full max-w-xl">
        {/* Ambient glow field behind everything. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[10%] rounded-full bg-radial-glow-cyan opacity-50 animate-pulse-soft"
        />

        {/* Luminous halo platform behind/around the station. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[48%] top-[50%] h-[64%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/25 shadow-[0_0_70px_18px_rgba(34,211,238,0.22)] animate-pulse-soft"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[48%] top-[68%] h-3 w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/30 blur-md"
        />

        {/* Small energy sparkle particles around the station. */}
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute rounded-full bg-cyan-300 shadow-glow-soft animate-pulse-soft"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}

        {/* Energy connector lines — percentage-coordinate SVG so it scales fluidly. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
        >
          {DEVICES.map((d) => {
            const { x, y } = d.anchor;
            const midX = (x + STATION_CENTER.x) / 2;
            const midY = (y + STATION_CENTER.y) / 2;
            const path = `M ${x} ${y} Q ${midX} ${midY}, ${STATION_CENTER.x} ${STATION_CENTER.y}`;
            return (
              <g key={d.key}>
                {/* Soft blurred glow pass underneath. */}
                <path
                  d={path}
                  stroke="#22d3ee"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.25"
                  className="blur-[1.5px]"
                />
                {/* Faint static base line. */}
                <path
                  d={path}
                  stroke="#67e8f9"
                  strokeWidth="0.4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.35"
                />
                {/* Animated traveling particles. */}
                <path
                  className="energy-particles"
                  d={path}
                  stroke="#a5f3fc"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.95"
                />
                {/* Pulse node at the device end. */}
                <circle cx={x} cy={y} r="1.1" fill="#22d3ee" opacity="0.9" />
              </g>
            );
          })}
        </svg>

        {/* Ground shadow beneath the station. */}
        <div
          aria-hidden="true"
          className="absolute left-[48%] top-[62%] z-0 h-6 w-[38%] -translate-x-1/2 rounded-full bg-navy-950/70 blur-lg"
        />

        {/* Independent device photos, each its own floating cutout — rendered
            before the station so the fridge and RV, which slightly overlap
            its silhouette, sit visually behind it. */}
        {DEVICES.map(({ key, label, watts, Icon, src, width, height, wrapClass, glow }) => (
          <div key={key} className={`absolute flex flex-col items-center gap-1.5 ${wrapClass}`}>
            {glow ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-2 top-0 h-2/3 rounded-full bg-amber-300/35 blur-xl"
              />
            ) : null}
            <Image
              src={src}
              alt={`${label}, a typical device you might run from a power station`}
              width={width}
              height={height}
              className="relative h-auto w-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
              sizes="(min-width: 1024px) 140px, 22vw"
            />
            <span className="relative inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-navy-900/80 px-2 py-1 text-[11px] font-semibold text-white shadow-glow-soft backdrop-blur-sm">
              <Icon width={12} height={12} className="text-cyan-300" />
              ~{watts} W
              <span className="sr-only"> {label}, example load</span>
            </span>
          </div>
        ))}

        {/* The power station — real photography, alpha-cut, no bounding box,
            large and dominant, rendered above the fridge/RV. The centering
            transform lives on this outer wrapper; Parallax's own scroll-tied
            transform is applied to an inner element so the two never fight
            over the same element's inline `transform`. */}
        <div className="absolute left-[48%] top-[50%] z-20 w-[58%] -translate-x-1/2 -translate-y-1/2">
          <Parallax range={8}>
            <div className="animate-float drop-shadow-[0_30px_55px_rgba(6,182,212,0.4)]">
              <Image
                src="/marketing/hero-power-station-transparent.png"
                alt="Portable power station, cutaway view showing its battery cells and internal electronics glowing blue, screen reading 82% charged"
                width={768}
                height={512}
                className="h-auto w-full object-contain"
                sizes="(min-width: 1024px) 430px, 62vw"
                priority
              />
            </div>
          </Parallax>
        </div>
      </div>

      {/* Estimation panel — real HTML, no baked-in numbers. */}
      <div className="glass-panel relative z-10 mt-2 flex flex-col gap-3 border-cyan-400/20 bg-navy-900/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">
            How we estimate
          </p>
          <p className="mt-0.5 max-w-sm text-sm text-navy-200">
            Add your real devices in the calculator — every recommendation applies
            verified specs and a transparent usable-energy assumption.
          </p>
        </div>
        <div className="shrink-0 sm:w-36">
          <div className="flex items-center justify-between text-xs text-navy-300">
            <span>Usable efficiency</span>
            <span className="font-semibold text-cyan-300">{efficiencyPct}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-navy-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-brand-500"
              style={{ width: `${efficiencyPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
