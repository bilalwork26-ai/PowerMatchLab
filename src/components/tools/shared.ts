/** Shared style tokens + tiny helpers reused by every /tools calculator UI. */

export const darkSelect =
  "rounded-md border border-navy-700 bg-navy-900/60 py-1.5 pl-2 pr-7 text-sm text-white outline-none transition-shadow duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";
export const darkInput =
  "rounded-md border border-navy-700 bg-navy-900/60 px-2 py-1.5 text-white outline-none transition-shadow duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

let ROW_SEQ = 0;
export const nextToolRowId = () => `tool-row-${Date.now()}-${ROW_SEQ++}`;

export function formatAutonomy(units: number | null, unitSingular: string, unitPlural: string): string {
  if (units == null || !Number.isFinite(units) || units <= 0) return "Not enough data";
  if (units < 1) {
    const hours = units * 24;
    return `${hours < 1 ? "< 1" : Math.round(hours)} h`;
  }
  const rounded = Math.round(units * 10) / 10;
  const label = rounded === 1 ? unitSingular : unitPlural;
  return `${rounded.toFixed(rounded < 10 ? 1 : 0)} ${label}`;
}
