/**
 * Shareable-URL state for the /tools load-list calculators (refrigerator,
 * RV, home backup — see LoadListCalculator.tsx).
 *
 * Design goals, matching the "shareable results" requirement without
 * creating an indexing or security problem:
 *  - Only the numeric/boolean CALCULATION inputs are encoded — never
 *    anything that could identify a person, and never free text beyond a
 *    short device name or daily-energy figure, both capped in length.
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
 *  - IMPORTANT: none of the fields decoded here ever feed
 *    `recommendProducts`'s classification or the headline capacity figure
 *    — see LoadListCalculator.tsx's `recommendations` (always built from
 *    the battery-only `result`, never a solar-adjusted one). A tampered or
 *    stale solar/entry-mode param can only ever change a DISPLAY figure
 *    (which entry-mode field is shown, or a per-product autonomy number in
 *    the Runtime Index table), never a product's Suitable/Oversized status.
 */

import { sanitizeAutonomyDays, type DeviceInput } from "./calculator";
import type { RecommendationPreferences } from "./recommend";
import {
  estimateDailySolarWh,
  dailyEnergyUnitToWh,
  deriveWattsAndHoursFromDailyEnergy,
  type DailyEnergyUnit,
  type ToolCalculatorType,
} from "./tools-engine";

const MAX_DEVICES = 20;
const MAX_NAME_LENGTH = 60;
/** Generous enough for any real daily/annual energy figure a visitor would type; prevents an absurdly long string from bloating the URL or the derived-value math. */
const MAX_DAILY_ENERGY_RAW_LENGTH = 20;
const DAILY_ENERGY_UNITS: readonly DailyEnergyUnit[] = ["Wh", "kWh", "kWhYear"];

const CLAMPS = {
  watts: { min: 0, max: 100_000 },
  quantity: { min: 0, max: 999 },
  hoursPerDay: { min: 0, max: 24 },
  surgeWatts: { min: 0, max: 200_000 },
  dailySolarWh: { min: 0, max: 100_000 },
  efficiencyPct: { min: 70, max: 95 },
  reservePct: { min: 0, max: 50 },
  panelWatts: { min: 0, max: 100_000 },
  peakSunHours: { min: 0, max: 24 },
  realizationPct: { min: 0, max: 100 },
};

function clamp(value: number, { min, max }: { min: number; max: number }, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/**
 * A visitor-typed daily/annual energy figure is valid only if it's a plain,
 * bounded, positive decimal string — never trusted as a free-form number
 * straight from a URL. Mirrors the same shape the UI's own <input
 * type="number"> already produces.
 */
function isValidDailyEnergyRaw(raw: string): boolean {
  return (
    raw.length > 0 &&
    raw.length <= MAX_DAILY_ENERGY_RAW_LENGTH &&
    /^\d+(\.\d+)?$/.test(raw) &&
    Number.isFinite(Number(raw)) &&
    Number(raw) > 0 &&
    Number(raw) <= 10_000_000
  );
}

function isValidDailyEnergyUnit(unit: unknown): unit is DailyEnergyUnit {
  return typeof unit === "string" && (DAILY_ENERGY_UNITS as readonly string[]).includes(unit);
}

/**
 * Compact per-device tuple. The last two elements are the ORIGINAL
 * daily-energy entry (raw text + unit) for a row entered that way — present
 * only when `entryMode` is "daily-energy" for that row — so a shared
 * "438 kWh/year" link restores showing "438 kWh/year", not an opaque
 * derived watts/hours pair. `null` in both slots (or a 6-element tuple from
 * an older link) means "this row was entered as watts × hours/day" and
 * decodes exactly as before.
 */
type DeviceTuple = [string, number, number, number, number | null, boolean, string | null, string | null];

export interface DailyEnergyEntry {
  raw: string;
  unit: DailyEnergyUnit;
}

export interface SolarShareState {
  /**
   * "panel-spec" is restored ONLY when the URL carries a complete, valid
   * panel-spec parameter set (see decode below) — an old link that only
   * ever had a plain `dailySolarWh` figure, or a tampered/incomplete one,
   * always falls back to "manual". Note that, either way, this value never
   * affects product classification (see this file's top comment) — it only
   * decides whether the Runtime Index table shows one global autonomy
   * figure or a per-product one capped to each product's own solar input
   * rating.
   */
  source: "manual" | "panel-spec";
  panelWatts: number;
  peakSunHours: number;
  realizationPct: number;
}

export interface LoadListShareState {
  devices: DeviceInput[];
  days: number;
  dailySolarWh: number;
  efficiencyPct: number;
  reservePct: number;
  prefs: RecommendationPreferences;
  entryMode: "watts" | "daily-energy";
  /** Keyed by the RESTORED device's id (from idFactory), for the rows decoded with a valid original daily-energy entry. */
  dailyEnergyEntries: Record<string, DailyEnergyEntry>;
  solar: SolarShareState;
}

function deviceToTuple(d: DeviceInput, dailyEnergy?: DailyEnergyEntry): DeviceTuple {
  const validDailyEnergy =
    dailyEnergy && isValidDailyEnergyRaw(dailyEnergy.raw) && isValidDailyEnergyUnit(dailyEnergy.unit)
      ? dailyEnergy
      : null;
  return [
    d.name.slice(0, MAX_NAME_LENGTH),
    clamp(d.watts, CLAMPS.watts, 0),
    clamp(d.quantity, CLAMPS.quantity, 1),
    clamp(d.hoursPerDay, CLAMPS.hoursPerDay, 0),
    d.surgeWatts != null && Number.isFinite(d.surgeWatts)
      ? clamp(d.surgeWatts, CLAMPS.surgeWatts, 0)
      : null,
    d.simultaneous !== false,
    validDailyEnergy ? validDailyEnergy.raw : null,
    validDailyEnergy ? validDailyEnergy.unit : null,
  ];
}

/**
 * Decodes one device tuple. When a valid original daily-energy entry is
 * present, watts/hoursPerDay are DERIVED from it (via the exact same
 * dailyEnergyUnitToWh -> deriveWattsAndHoursFromDailyEnergy path the live
 * UI uses) rather than trusted from the tuple's own watts/hoursPerDay slots
 * — a single source of truth, so a hand-edited tuple can never claim
 * "raw=1, unit=Wh" (i.e. ~1 Wh/day) while separately carrying an
 * inconsistent watts=99999/hoursPerDay=24.
 */
function tupleToDevice(
  t: unknown,
  idFactory: () => string,
): { device: DeviceInput; dailyEnergy: DailyEnergyEntry | null } | null {
  if (!Array.isArray(t) || t.length < 6) return null;
  const [rawName, rawWatts, rawQty, rawHours, rawSurge, rawSimultaneous, rawDeRaw, rawDeUnit] = t;
  if (typeof rawName !== "string") return null;
  if (typeof rawWatts !== "number" || typeof rawQty !== "number" || typeof rawHours !== "number") {
    return null;
  }

  let watts = clamp(rawWatts, CLAMPS.watts, 0);
  let hoursPerDay = clamp(rawHours, CLAMPS.hoursPerDay, 0);
  let dailyEnergy: DailyEnergyEntry | null = null;
  if (typeof rawDeRaw === "string" && isValidDailyEnergyRaw(rawDeRaw) && isValidDailyEnergyUnit(rawDeUnit)) {
    dailyEnergy = { raw: rawDeRaw, unit: rawDeUnit };
    const derived = deriveWattsAndHoursFromDailyEnergy(dailyEnergyUnitToWh(Number(rawDeRaw), rawDeUnit));
    watts = derived.watts;
    hoursPerDay = derived.hoursPerDay;
  }

  return {
    device: {
      id: idFactory(),
      name: rawName.slice(0, MAX_NAME_LENGTH),
      watts,
      quantity: clamp(rawQty, CLAMPS.quantity, 1),
      hoursPerDay,
      surgeWatts:
        typeof rawSurge === "number" && Number.isFinite(rawSurge)
          ? clamp(rawSurge, CLAMPS.surgeWatts, 0)
          : null,
      simultaneous: rawSimultaneous !== false,
    },
    dailyEnergy,
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
    .map((d) => deviceToTuple(d, state.dailyEnergyEntries[d.id]));
  if (meaningfulDevices.length) {
    params.set("l", JSON.stringify(meaningfulDevices));
  }

  if (state.entryMode === "daily-energy") {
    params.set("em", "d");
  }

  params.set("d", String(sanitizeAutonomyDays(state.days)));
  if (state.dailySolarWh > 0) {
    params.set("s", String(clamp(state.dailySolarWh, CLAMPS.dailySolarWh, 0)));
  }
  params.set("e", String(clamp(state.efficiencyPct, CLAMPS.efficiencyPct, 85)));
  params.set("r", String(clamp(state.reservePct, CLAMPS.reservePct, 20)));

  // Panel-spec solar params are encoded ONLY when that's genuinely the
  // active source — an old-style link with just `s` (dailySolarWh) always
  // means "manual" on both write and read, keeping links from that source
  // short and their meaning unambiguous.
  if (state.solar.source === "panel-spec") {
    params.set("ss", "p");
    params.set("pw", String(clamp(state.solar.panelWatts, CLAMPS.panelWatts, 0)));
    params.set("psh", String(clamp(state.solar.peakSunHours, CLAMPS.peakSunHours, 0)));
    params.set("pr", String(clamp(state.solar.realizationPct, CLAMPS.realizationPct, 70)));
  }

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
  const dailyEnergyEntries: Record<string, DailyEnergyEntry> = {};
  const rawLoads = searchParams.get("l");
  if (rawLoads) {
    try {
      const parsed = JSON.parse(rawLoads);
      if (Array.isArray(parsed)) {
        for (const rawTuple of parsed.slice(0, MAX_DEVICES)) {
          const decoded = tupleToDevice(rawTuple, idFactory);
          if (!decoded) continue;
          devices.push(decoded.device);
          if (decoded.dailyEnergy) dailyEnergyEntries[decoded.device.id] = decoded.dailyEnergy;
        }
      }
    } catch {
      devices = []; // malformed JSON — never throws, just yields no restored loads
    }
  }

  const entryMode: "watts" | "daily-energy" = searchParams.get("em") === "d" ? "daily-energy" : "watts";

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
  const efficiencyPct = parseParam("e", 85, CLAMPS.efficiencyPct);
  const reservePct = parseParam("r", 20, CLAMPS.reservePct);

  // Panel-spec solar state is restored ONLY when `ss=p` AND all three panel
  // params are present and numeric — anything less (an old link with only
  // `s`, a partially-tampered set, or `ss=p` with a param missing) falls
  // back to "manual", never silently treating an incomplete set as
  // panel-spec. `dailySolarWh` is then RECOMPUTED from the restored panel
  // params (never trusted from the separate, independently-editable `s`
  // param) so the two can never disagree.
  const hasCompletePanelSpec =
    searchParams.get("ss") === "p" &&
    searchParams.get("pw") !== null &&
    searchParams.get("psh") !== null &&
    searchParams.get("pr") !== null &&
    Number.isFinite(Number(searchParams.get("pw"))) &&
    Number.isFinite(Number(searchParams.get("psh"))) &&
    Number.isFinite(Number(searchParams.get("pr")));

  let solar: SolarShareState;
  let dailySolarWh: number;
  if (hasCompletePanelSpec) {
    const panelWatts = clamp(Number(searchParams.get("pw")), CLAMPS.panelWatts, 0);
    const peakSunHours = clamp(Number(searchParams.get("psh")), CLAMPS.peakSunHours, 0);
    const realizationPct = clamp(Number(searchParams.get("pr")), CLAMPS.realizationPct, 70);
    solar = { source: "panel-spec", panelWatts, peakSunHours, realizationPct };
    dailySolarWh = Math.round(
      estimateDailySolarWh({ panelWatts, peakSunHours, realizationFraction: realizationPct / 100 }),
    );
  } else {
    solar = { source: "manual", panelWatts: 100, peakSunHours: 4, realizationPct: 70 };
    dailySolarWh = parseParam("s", 0, CLAMPS.dailySolarWh);
  }

  const prefs: RecommendationPreferences = {
    needs240V: searchParams.get("p240") === "1",
    needsTT30: searchParams.get("ptt30") === "1",
    needsUpsTransfer: searchParams.get("pups") === "1",
    wantsExpandable: searchParams.get("pexp") === "1",
    prioritisePortability: searchParams.get("pport") === "1",
  };

  return { devices, days, dailySolarWh, efficiencyPct, reservePct, prefs, entryMode, dailyEnergyEntries, solar };
}
