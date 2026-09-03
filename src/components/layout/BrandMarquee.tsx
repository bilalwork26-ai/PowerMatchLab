import { BoltIcon } from "@/components/ui/icons";

/**
 * Continuous-loop brand strip between the page content and the footer —
 * replaces what used to be a plain margin gap (which let the light body
 * background show through as a white band). Purely decorative branding,
 * so the whole strip is aria-hidden; the real navigation lives in Header
 * and Footer. Respects prefers-reduced-motion via the global rule in
 * globals.css (all animation durations collapse to ~0 there), and pauses
 * on hover/focus so a reader can stop it deliberately at any time.
 */
const REPEAT = 6;

function MarqueeRun({ keyPrefix }: { keyPrefix: string }) {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden="true">
      {Array.from({ length: REPEAT }).map((_, i) => (
        <span key={`${keyPrefix}-${i}`} className="flex shrink-0 items-center gap-3">
          <span className="bg-gradient-to-r from-cyan-300 to-brand-300 bg-clip-text text-xs font-semibold uppercase tracking-[0.25em] text-transparent">
            PowerMatchLab
          </span>
          <BoltIcon width={11} height={11} className="shrink-0 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-navy-300">
            Compare
          </span>
          <BoltIcon width={11} height={11} className="shrink-0 text-amber-300" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-navy-300">
            Calculate
          </span>
          <BoltIcon width={11} height={11} className="shrink-0 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-navy-300">
            Choose Smarter
          </span>
          <BoltIcon width={11} height={11} className="shrink-0 text-amber-300" />
        </span>
      ))}
    </div>
  );
}

export function BrandMarquee() {
  return (
    <div className="group relative overflow-hidden bg-navy-900 py-3 shadow-inner-line">
      {/* Luminous gold line on the top edge, with a slow traveling shimmer. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-amber-400/0 via-amber-300 to-amber-400/0 shadow-[0_0_8px_1px_rgba(252,211,77,0.5)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/80 to-transparent bg-no-repeat opacity-70 animate-shimmer group-hover:[animation-play-state:paused]"
      />
      {/* A more discreet gold line on the bottom edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-[length:200%_100%] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent bg-no-repeat animate-shimmer-slow group-hover:[animation-play-state:paused]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-navy-900 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-navy-900 to-transparent"
      />
      <div
        role="presentation"
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
      >
        <MarqueeRun keyPrefix="a" />
        <MarqueeRun keyPrefix="b" />
      </div>
    </div>
  );
}
