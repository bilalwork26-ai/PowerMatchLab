/**
 * Editable EXAMPLE presets for the /tools calculators.
 *
 * Same discipline as `appliances.ts`: every number here is a commonly-cited
 * starting point, not a universal or guaranteed figure for a specific
 * device. The UI must label these as examples and keep every value
 * user-editable — never present them as accurate for "all refrigerators",
 * "all CPAP machines", etc.
 */

export interface LoadPreset {
  key: string;
  name: string;
  runningWatts: number;
  surgeWatts: number | null;
  hoursPerDay: number;
  note?: string;
}

// ---------------------------------------------------------------------------
// Tool 1: Refrigerator & freezer
// ---------------------------------------------------------------------------
export const REFRIGERATOR_PRESETS: LoadPreset[] = [
  {
    key: "household-fridge",
    name: "Household refrigerator (full-size)",
    runningWatts: 150,
    surgeWatts: 600,
    hoursPerDay: 8,
    note: "Compressor cycles on/off; daily energy is well below running watts × 24.",
  },
  {
    key: "fridge-freezer-combo",
    name: "Refrigerator + freezer (combo unit)",
    runningWatts: 200,
    surgeWatts: 800,
    hoursPerDay: 8,
    note: "Two compressors rarely surge at exactly the same instant, but this preset assumes the worst case.",
  },
  {
    key: "mini-fridge",
    name: "Mini-fridge / dorm fridge",
    runningWatts: 70,
    surgeWatts: 250,
    hoursPerDay: 8,
  },
  {
    key: "chest-freezer",
    name: "Chest freezer (standalone)",
    runningWatts: 100,
    surgeWatts: 400,
    hoursPerDay: 8,
  },
];

// ---------------------------------------------------------------------------
// Tool 2: CPAP
// ---------------------------------------------------------------------------
export interface CpapPreset {
  key: string;
  name: string;
  baseWatts: number;
  humidifierExtraWatts: number;
  heatedTubeExtraWatts: number;
}

/**
 * Educational ranges only. CPAP power draw varies by brand, model, pressure
 * setting and altitude — always check the device's own rating label or the
 * manufacturer's power-supply specification before relying on a number.
 */
export const CPAP_PRESETS: CpapPreset[] = [
  {
    key: "cpap-basic",
    name: "CPAP, no humidifier (example range)",
    baseWatts: 35,
    humidifierExtraWatts: 0,
    heatedTubeExtraWatts: 0,
  },
  {
    key: "cpap-humidifier",
    name: "CPAP with heated humidifier (example range)",
    baseWatts: 35,
    humidifierExtraWatts: 30,
    heatedTubeExtraWatts: 0,
  },
  {
    key: "cpap-full",
    name: "CPAP with humidifier + heated tube (example range)",
    baseWatts: 35,
    humidifierExtraWatts: 30,
    heatedTubeExtraWatts: 15,
  },
];

// ---------------------------------------------------------------------------
// Tool 3: RV / van life
// ---------------------------------------------------------------------------
export const RV_DEVICE_PRESETS: LoadPreset[] = [
  { key: "rv-lights", name: "LED lights (interior)", runningWatts: 20, surgeWatts: null, hoursPerDay: 4 },
  { key: "rv-fridge-12v", name: "12V compressor fridge", runningWatts: 60, surgeWatts: 180, hoursPerDay: 10 },
  { key: "rv-water-pump", name: "Water pump", runningWatts: 60, surgeWatts: 150, hoursPerDay: 0.5 },
  { key: "rv-fan", name: "Roof/portable fan", runningWatts: 30, surgeWatts: null, hoursPerDay: 6 },
  { key: "rv-laptop", name: "Laptop", runningWatts: 60, surgeWatts: null, hoursPerDay: 3 },
  { key: "rv-router", name: "Router / hotspot", runningWatts: 15, surgeWatts: null, hoursPerDay: 24 },
  { key: "rv-tv", name: "TV (LED, RV-size)", runningWatts: 65, surgeWatts: null, hoursPerDay: 2 },
  { key: "rv-coffee-maker", name: "Coffee maker", runningWatts: 800, surgeWatts: null, hoursPerDay: 0.2 },
  { key: "rv-microwave", name: "Microwave", runningWatts: 1200, surgeWatts: 1800, hoursPerDay: 0.2 },
  { key: "rv-starlink", name: "Starlink (standard kit, example)", runningWatts: 50, surgeWatts: null, hoursPerDay: 12 },
];

// ---------------------------------------------------------------------------
// Tool 4: Starlink & connectivity
// ---------------------------------------------------------------------------
export interface StarlinkProfile {
  key: string;
  name: string;
  avgWatts: number;
  note: string;
}

/**
 * Published average consumption varies by Starlink hardware generation,
 * dish size, temperature (heating snow melt draws far more) and duty cycle.
 * These are example starting points for planning only — enter your own
 * measured watts whenever you have one.
 */
export const STARLINK_PROFILES: StarlinkProfile[] = [
  {
    key: "standard",
    name: "Standard kit, typical use (example)",
    avgWatts: 50,
    note: "Typical average in mild conditions without snow-melt heating active.",
  },
  {
    key: "standard-heating",
    name: "Standard kit, active snow-melt heating (example)",
    avgWatts: 110,
    note: "Heating the dish to melt snow/ice can roughly double average draw.",
  },
  {
    key: "mini",
    name: "Mini kit, typical use (example)",
    avgWatts: 25,
    note: "The smaller Mini hardware generally draws less than the standard dish.",
  },
];

// ---------------------------------------------------------------------------
// Tool 5: Home backup
// ---------------------------------------------------------------------------
export const HOME_BACKUP_PRESETS: LoadPreset[] = [
  { key: "hb-fridge", name: "Refrigerator", runningWatts: 150, surgeWatts: 600, hoursPerDay: 8 },
  { key: "hb-freezer", name: "Freezer", runningWatts: 100, surgeWatts: 400, hoursPerDay: 8 },
  { key: "hb-lights", name: "Lights (essential rooms)", runningWatts: 40, surgeWatts: null, hoursPerDay: 6 },
  { key: "hb-router", name: "Router / modem", runningWatts: 18, surgeWatts: null, hoursPerDay: 24 },
  { key: "hb-phones", name: "Phone charging (household)", runningWatts: 20, surgeWatts: null, hoursPerDay: 4 },
  { key: "hb-laptop", name: "Laptop", runningWatts: 60, surgeWatts: null, hoursPerDay: 4 },
  { key: "hb-cpap", name: "CPAP machine", runningWatts: 40, surgeWatts: null, hoursPerDay: 8 },
  { key: "hb-fan", name: "Fan", runningWatts: 30, surgeWatts: null, hoursPerDay: 8 },
  { key: "hb-sump-pump", name: "Sump pump", runningWatts: 800, surgeWatts: 2200, hoursPerDay: 1 },
  { key: "hb-tv", name: "TV", runningWatts: 100, surgeWatts: null, hoursPerDay: 3 },
];
