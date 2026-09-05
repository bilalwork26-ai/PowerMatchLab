/**
 * Editable EXAMPLE appliances for the Power Calculator.
 *
 * These are starting points only. Real device power varies widely by model,
 * age and settings. The UI must label them as examples and every value stays
 * user-editable. We deliberately avoid presenting any of these as a universal
 * or guaranteed wattage.
 */

export interface ApplianceExample {
  key: string;
  name: string;
  /** Example running watts. */
  runningWatts: number;
  /** Example startup/surge watts, when the appliance type typically has one. */
  surgeWatts: number | null;
  /** Example hours of use per day. */
  hoursPerDay: number;
  category: "essentials" | "kitchen" | "comfort" | "work" | "outdoors" | "medical";
  note?: string;
}

export const APPLIANCE_EXAMPLES: ApplianceExample[] = [
  {
    key: "fridge",
    name: "Refrigerator (full size)",
    runningWatts: 150,
    surgeWatts: 600,
    hoursPerDay: 8,
    category: "essentials",
    note: "Compressor cycles on and off; daily energy is far below running watts × 24.",
  },
  {
    key: "chest-freezer",
    name: "Chest freezer",
    runningWatts: 100,
    surgeWatts: 400,
    hoursPerDay: 8,
    category: "essentials",
  },
  {
    key: "wifi-router",
    name: "Wi-Fi router + modem",
    runningWatts: 18,
    surgeWatts: null,
    hoursPerDay: 24,
    category: "essentials",
  },
  {
    key: "led-lights",
    name: "LED lights (a few rooms)",
    runningWatts: 40,
    surgeWatts: null,
    hoursPerDay: 5,
    category: "essentials",
  },
  {
    key: "phone",
    name: "Phone charging",
    runningWatts: 12,
    surgeWatts: null,
    hoursPerDay: 3,
    category: "essentials",
  },
  {
    key: "laptop",
    name: "Laptop",
    runningWatts: 60,
    surgeWatts: null,
    hoursPerDay: 4,
    category: "work",
  },
  {
    key: "tv",
    name: "TV (LED, mid-size)",
    runningWatts: 100,
    surgeWatts: null,
    hoursPerDay: 3,
    category: "comfort",
  },
  {
    key: "cpap",
    name: "CPAP machine (no humidifier)",
    runningWatts: 40,
    surgeWatts: null,
    hoursPerDay: 8,
    category: "medical",
    note: "Heated humidifier and heated tubing can add 20-60 W or more.",
  },
  {
    key: "microwave",
    name: "Microwave (1000 W cooking)",
    runningWatts: 1200,
    surgeWatts: 1800,
    hoursPerDay: 0.3,
    category: "kitchen",
  },
  {
    key: "coffee-maker",
    name: "Drip coffee maker",
    runningWatts: 900,
    surgeWatts: null,
    hoursPerDay: 0.2,
    category: "kitchen",
  },
  {
    key: "space-heater",
    name: "Space heater",
    runningWatts: 1500,
    surgeWatts: null,
    hoursPerDay: 3,
    category: "comfort",
    note: "Resistive heat is very energy-hungry and will drain most stations quickly.",
  },
  {
    key: "portable-fan",
    name: "Portable fan",
    runningWatts: 30,
    surgeWatts: null,
    hoursPerDay: 6,
    category: "comfort",
  },
  {
    key: "sump-pump",
    name: "Sump pump (1/3 HP)",
    runningWatts: 800,
    surgeWatts: 2200,
    hoursPerDay: 1,
    category: "essentials",
  },
  {
    key: "well-pump",
    name: "Well pump (1/2 HP)",
    runningWatts: 1000,
    surgeWatts: 3000,
    hoursPerDay: 1,
    category: "essentials",
  },
  {
    key: "rv-fridge-12v",
    name: "RV 12V compressor fridge",
    runningWatts: 60,
    surgeWatts: 180,
    hoursPerDay: 10,
    category: "outdoors",
  },
  {
    key: "camp-lights",
    name: "Campsite string lights",
    runningWatts: 20,
    surgeWatts: null,
    hoursPerDay: 4,
    category: "outdoors",
  },
  {
    key: "electric-cooler",
    name: "Electric cooler (12V compressor)",
    runningWatts: 55,
    surgeWatts: 150,
    hoursPerDay: 24,
    category: "outdoors",
    note: "Compressor cycles on and off like a fridge; runs continuously to hold temperature.",
  },
  {
    key: "lantern",
    name: "LED lantern",
    runningWatts: 5,
    surgeWatts: null,
    hoursPerDay: 5,
    category: "outdoors",
  },
  {
    key: "external-monitor",
    name: "External monitor",
    runningWatts: 30,
    surgeWatts: null,
    hoursPerDay: 8,
    category: "work",
  },
  {
    key: "desk-light",
    name: "Desk lamp (LED)",
    runningWatts: 10,
    surgeWatts: null,
    hoursPerDay: 6,
    category: "work",
  },
];

export function getApplianceExample(key: string): ApplianceExample | undefined {
  return APPLIANCE_EXAMPLES.find((a) => a.key === key);
}
