"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabDef {
  id: string;
  label: string;
  panel: ReactNode;
}

/**
 * Accessible tabs. Every panel stays in the DOM (hidden with the `hidden`
 * attribute when inactive) so the content remains available to search engines
 * and to "find in page".
 */
export function ProductTabs({ tabs }: { tabs: TabDef[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const base = useId();

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product details"
        className="flex gap-1 overflow-x-auto border-b border-navy-100"
      >
        {tabs.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                selected
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-navy-500 hover:text-navy-800",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== active}
          className="pt-6"
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
