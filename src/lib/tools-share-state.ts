/**
 * Shareable-URL state for the /tools load-list calculators (refrigerator,
 * RV, home backup — see LoadListCalculator.tsx).
 *
 * Design goals, matching the "shareable results" requirement without
 * creating an indexing or security problem:
 *  - Only the numeric/boolean CALCULATION inputs are encoded — never
 *    anything that could identify a person, and never free text beyond a
 *    short device name capped in length.
 *  - Every decoded value is clamped to the exact same bounds the engine and
 *    UI controls already enforce (see calculator.ts's sanitizeNumber and
 *    this file's own CLAMPS below) — a hand-edited or stale URL can never
 *    produce an out-of-range, NaN, or oversized result. Invalid input
 *    silently falls back to a safe value, never a thrown error.
 *  - A `t` (tool type) tag guards against pasting one tool's shared link
 *    into a different tool: a mismatch is treated as "no shared state" and
 *    the page falls back to its normal seeded defaults.
 *  - Nothing here touches the page's `<link rel="canonical">` (see
 *    lib/seo.ts's pageMetadata — canonical is built from the static route
 *    path alone, never from search params), so infinite parameter
 *    combinations can exist without ever competing with the canonical URL
 *    for indexing.
 */

import { sanitizeAutonomyDays, type DeviceInput } from "./calculator";
import type { RecommendationPreferences } from "./recommend";
import type { ToolCalculatorType } from "./tools-engine";

const MAX_DEVICES = 20;
const MAX_NAME_LENGTH = 60;

const CLAMPS = {
  watts: { min: 0, max: 100_000 },
  quantity: { min: 0, max: 999 },
  hoursPerDay: { min: 0, max: 24 },
  surgeWatts: { min: 0, max: 200_000 },
  dailySolarWh: { min: 0, max: 100_000 },
  efficiencyPct: { min: 70, max: 95 },
  reservePct: { min: 0, max: 50 },
};

function clamp(value: number, { min, max }: { min: number; max: number }, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/** Compact per-device tuple: [name, watts, quantity, hoursPerDay, surgeWatts | null, simultaneous]. */
type DeviceTuple = [string, number, number, number, number | null, boolean];

export interface LoadListShareState {
  devices: DeviceInput[];
  days: number;
  dailySolarWh: number;
  efficiencyPct: number;
  reservePct: number;
  prefs: RecommendationPreferences;
}

function deviceToTuple(d: DeviceInput): DeviceTuple {
  return [
    d.name.slice(0, MAX_NAME_LENGTH),
    clamp(d.watts, CLAMPS.watts, 0),
    clamp(d.quantity, CLAMPS.quantity, 1),
    clamp(d.hoursPerDay, CLAMPS.hoursPerDay, 0),
    d.surgeWatts != null && Number.isFinite(d.surgeWatts)
      ? clamp(d.surgeWatts, CLAMPS.surgeWatts, 0)
      : null,
    d.simultaneous !== false,
  ];
}

function tupleToDevice(t: unknown, idFactory: () => string): DeviceInput | null {
  if (!Array.isArray(t) || t.length !== 6) return null;
  const [rawName, rawWatts, rawQty, rawHours, rawSurge, rawSimultaneous] = t;
  if (typeof rawName !== "string") return null;
  if (typeof rawWatts !== "number" || typeof rawQty !== "number" || typeof rawHours !== "number") {
    return null;
  }
  return {
    id: idFactory(),
    name: rawName.slice(0, MAX_NAME_LENGTH),
    watts: clamp(rawWatts, CLAMPS.watts, 0),
    quantity: clamp(rawQty, CLAMPS.quantity, 1),
    hoursPerDay: clamp(rawHours, CLAMPS.hoursPerDay, 0),
    surgeWatts:
      typeof rawSurge === "number" && Number.isFinite(rawSurge)
        ? clamp(rawSurge, CLAMPS.surgeWatts, 0)
        : null,
    simultaneous: rawSimultaneous !== false,
  };
}

/** Only include a preference in the encoded URL when the tool's own config actually exposes that checkbox. */
export interface PrefsShareConfig {
  needs240V?: boolean;
  needsTT30?: boolean;
  needsUpsTransfer?: boolean;
  wantsExpandable?: boolean;
  prioritisePortability?: boolean;
}

/**
 * Builds the query string (no leading `?`) for the given calculation state.
 * Devices with no name AND no watts are dropped — an empty "add a custom
 * load" row the visitor never filled in carries no calculation value and
 * would just bloat the URL.
 */
export function encodeLoadListShareState(
  state: LoadListShareState,
  calculatorType: ToolCalculatorType,
  prefsConfig: PrefsShareConfig,
): string {
  const params = new URLSearchParams();
  params.set("t", calculatorType);

  const meaningfulDevices = state.devices
    .filter((d) => d.name.trim() !== "" || d.watts > 0)
    .slice(0, MAX_DEVICES)
    .map(deviceToTuple);
  if (meaningfulDevices.length) {
    params.set("l", JSON.stringify(meaningfulDevices));
  }

  params.set("d", String(sanitizeAutonomyDays(state.days)));
  if (state.dailySolarWh > 0) {
    params.set("s", String(clamp(state.dailySolarWh, CLAMPS.dailySolarWh, 0)));
  }
  params.set("e", String(clamp(state.efficiencyPct, CLAMPS.efficiencyPct, 85)));
  params.set("r", String(clamp(state.reservePct, CLAMPS.reservePct, 20)));

  if (prefsConfig.needs240V && state.prefs.needs240V) params.set("p240", "1");
  if (prefsConfig.needsTT30 && state.prefs.needsTT30) params.set("ptt30", "1");
  if (prefsConfig.needsUpsTransfer && state.prefs.needsUpsTransfer) params.set("pups", "1");
  if (prefsConfig.wantsExpandable && state.prefs.wantsExpandable) params.set("pexp", "1");
  if (prefsConfig.prioritisePortability && state.prefs.prioritisePortability) params.set("pport", "1");

  return params.toString();
}

/**
 * Parses and fully validates shared state from URL search params. Returns
 * `null` when there is nothing usable to restore (no `l`/`d`/`s`/`e`/`r`
 * params at all) or when the `t` tag names a different tool than
 * `expectedCalculatorType` — both cases mean "fall back to normal seeded
 * defaults", never a thrown error or a partially-garbled state.
 */
export function decodeLoadListShareState(
  searchParams: URLSearchParams,
  expectedCalculatorType: ToolCalculatorType,
  idFactory: () => string,
): LoadListShareState | null {
  const tag = searchParams.get("t");
  if (tag !== expectedCalculatorType) return null;

  const hasAnyRelevantParam = ["l", "d", "s", "e", "r"].some((k) => searchParams.has(k));
  if (!hasAnyRelevantParam) return null;

  let devices: DeviceInput[] = [];
  const rawLoads = searchParams.get("l");
  if (rawLoads) {
    try {
      const parsed = JSON.parse(rawLoads);
      if (Array.isArray(parsed)) {
        devices = parsed
          .slice(0, MAX_DEVICES)
          .map((t) => tupleToDevice(t, idFactory))
          .filter((d): d is DeviceInput => d !== null);
      }
    } catch {
      devices = []; // malformed JSON — never throws, just yields no restored loads
    }
  }

  /** Number(...) on a missing param would parse "" as 0, a valid-looking number that isn't the intended default — read absence explicitly instead. */
  const parseParam = (key: string, fallback: number, bounds: { min: number; max: number }): number => {
    const raw = searchParams.get(key);
    if (raw === null || raw === "") return fallback;
    return clamp(Number(raw), bounds, fallback);
  };

  // Not routed through parseParam/clamp: sanitizeAutonomyDays already applies
  // the exact same "invalid or non-positive -> 1 day, valid but sub-hour ->
  // rounded up to MIN_DAYS" rule calculatePower itself uses, so a tampered
  // or stale `d` param can never restore a session at a silently different
  // duration than a fresh visit with the same (invalid) input would get.
  const rawDays = searchParams.get("d");
  const days = rawDays === null || rawDays === "" ? 1 : sanitizeAutonomyDays(Number(rawDays));
  const dailySolarWh = parseParam("s", 0, CLAMPS.dailySolarWh);
  const efficiencyPct = parseParam("e", 85, CLAMPS.efficiencyPct);
  const reservePct = parseParam("r", 20, CLAMPS.reservePct);

  const prefs: RecommendationPreferences = {
    needs240V: searchParams.get("p240") === "1",
    needsTT30: searchParams.get("ptt30") === "1",
    needsUpsTransfer: searchParams.get("pups") === "1",
    wantsExpandable: searchParams.get("pexp") === "1",
    prioritisePortability: searchParams.get("pport") === "1",
  };

  return { devices, days, dailySolarWh, efficiencyPct, reservePct, prefs };
}
