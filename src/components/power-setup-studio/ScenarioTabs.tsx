"use client";

import { STUDIO_SCENARIOS } from "@/lib/power-setup-scenarios";
import { cn } from "@/lib/cn";

export function ScenarioTabs({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="tablist" aria-label="Choose a scenario" className="flex flex-wrap gap-2">
      {STUDIO_SCENARIOS.map((s) => {
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            role="tab"
            id={`scenario-tab-${s.id}`}
            aria-selected={active}
            aria-controls="scenario-panel"
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(s.id)}
            onKeyDown={(e) => {
              const idx = STUDIO_SCENARIOS.findIndex((x) => x.id === activeId);
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                onSelect(STUDIO_SCENARIOS[(idx + 1) % STUDIO_SCENARIOS.length].id);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                onSelect(
                  STUDIO_SCENARIOS[(idx - 1 + STUDIO_SCENARIOS.length) % STUDIO_SCENARIOS.length]
                    .id,
                );
              }
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
              active
                ? "border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-glow-cyan"
                : "border-navy-700 bg-navy-900/50 text-navy-300 hover:border-navy-500 hover:text-white",
            )}
          >
            {s.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
