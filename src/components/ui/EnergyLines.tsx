import { cn } from "@/lib/cn";

/**
 * Purely decorative animated "energy flow" lines for dark hero/section
 * backgrounds. Lightweight inline SVG + CSS (`.energy-path`, see
 * globals.css) — no canvas/WebGL. The dash animation is a plain CSS
 * `animation`, so the site-wide `prefers-reduced-motion` rule in
 * globals.css already collapses it to effectively 0ms for anyone who
 * asked for reduced motion.
 *
 * Always `aria-hidden`: it never carries information, only atmosphere.
 */
export function EnergyLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1200 600"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        className="energy-path"
        d="M0 120 C 200 80, 340 200, 520 160 S 860 60, 1200 140"
        stroke="url(#pml-energy-cyan)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        className="energy-path"
        d="M0 320 C 220 260, 380 420, 600 360 S 980 260, 1200 340"
        stroke="url(#pml-energy-brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
        style={{ animationDelay: "-2s" }}
      />
      <path
        className="energy-path"
        d="M0 480 C 260 520, 420 400, 660 460 S 1000 540, 1200 470"
        stroke="url(#pml-energy-cyan)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
        style={{ animationDelay: "-4s" }}
      />
      <defs>
        <linearGradient id="pml-energy-cyan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pml-energy-brand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4f8ee6" stopOpacity="0" />
          <stop offset="50%" stopColor="#4f8ee6" stopOpacity="1" />
          <stop offset="100%" stopColor="#4f8ee6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
