import { cn } from "@/lib/cn";

export const FACTORS = [
  "Temperature — cold reduces usable battery capacity; heat can trigger throttling",
  "Battery age and condition — capacity fades gradually with cycles and time",
  "Inverter efficiency — some energy is always lost converting DC to AC",
  "Variable appliance draw — most appliances don't pull a constant wattage",
  "Startup/surge power — a motor's brief startup spike can exceed its running watts",
  "Appliance settings — e.g. humidifier, fan speed, or temperature setting",
  "Conversion losses beyond the modeled efficiency assumption",
  "Real solar conditions — actual panel output is usually well below its rated watts",
  "The safety reserve is a margin for error, not a guarantee",
];

/**
 * Compact, accessible disclosure placed directly next to calculated results
 * (Power Calculator and Power Setup Studio) — not hidden only in a legal
 * page. A native <details>/<summary> element: keyboard-operable and
 * screen-reader-announced with no extra ARIA needed, and it adds no motion
 * beyond the existing site-wide icon-rotate transition (already collapsed
 * under prefers-reduced-motion by the global rule in globals.css).
 */
export function EstimateFactorsDisclosure({ className }: { className?: string }) {
  return (
    <details
      className={cn(
        "group rounded-lg border border-navy-700 bg-navy-900/70 p-3 text-sm",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-navy-200">
        Why your real result may differ
        <span
          aria-hidden="true"
          className="shrink-0 text-cyan-300 transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-2 animate-fade-up">
        <p className="text-navy-300">
          These figures are planning estimates from the inputs and assumptions
          above — not a lab measurement. Your real result can vary with:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-navy-300">
          {FACTORS.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
