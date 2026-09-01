/**
 * Null-safe display helpers.
 *
 * Rule: when a value is genuinely unknown we show "Not verified" — never a
 * fabricated number, and never a misleading `0` / `false` / `"N/A"`.
 */

export const NOT_VERIFIED = "Not verified";

type Numish = number | null | undefined;

export function fmtNumber(value: Numish, opts: Intl.NumberFormatOptions = {}): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NOT_VERIFIED;
  return new Intl.NumberFormat("en-US", opts).format(value);
}

export function fmtWh(value: Numish): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NOT_VERIFIED;
  return `${fmtNumber(value)} Wh`;
}

export function fmtWatts(value: Numish): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NOT_VERIFIED;
  return `${fmtNumber(value)} W`;
}

export function fmtKg(value: Numish): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NOT_VERIFIED;
  const lb = value * 2.2046226218;
  return `${fmtNumber(value, { maximumFractionDigits: 1 })} kg (${fmtNumber(lb, {
    maximumFractionDigits: 1,
  })} lb)`;
}

export function fmtMs(value: Numish): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NOT_VERIFIED;
  return `${fmtNumber(value)} ms`;
}

export function fmtCount(value: Numish, singular: string, plural = `${singular}s`): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NOT_VERIFIED;
  return `${fmtNumber(value)} ${value === 1 ? singular : plural}`;
}

export function fmtBool(
  value: boolean | null | undefined,
  { yes = "Yes", no = "No" }: { yes?: string; no?: string } = {},
): string {
  if (value === null || value === undefined) return NOT_VERIFIED;
  return value ? yes : no;
}

export function fmtText(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === "") return NOT_VERIFIED;
  return value;
}

export function fmtHours(value: Numish): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NOT_VERIFIED;
  if (value < 1) {
    const minutes = Math.round(value * 60);
    return `${minutes} min`;
  }
  return `${fmtNumber(value, { maximumFractionDigits: 1 })} h`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return NOT_VERIFIED;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return NOT_VERIFIED;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Round to a sensible whole-watt-hour / whole-watt figure for display. */
export function roundTo(value: number, step = 1): number {
  return Math.round(value / step) * step;
}
