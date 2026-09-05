/**
 * Power Setup Studio — scenario configuration.
 *
 * Purely declarative data: which illustrative scene to show, where the
 * battery/solar/appliance hotspots sit on that image (as PERCENTAGE
 * coordinates, so the overlay scales with the image instead of breaking on
 * a different aspect ratio), and which example appliances are visible and
 * on by default. No product data lives here — the illustrated battery is a
 * category illustration, never a specific model (see /editorial-policy).
 *
 * Appliance wattages are pulled from the shared `APPLIANCE_EXAMPLES` table
 * (src/lib/appliances.ts) — the same numbers the Power Calculator uses —
 * never duplicated or reinvented here. A scenario may give an appliance a
 * different on-screen label than its shared example name (e.g. "Essential
 * Lights" vs. "Interior Lights" vs. "Tent Lights" all reuse the same LED
 * lighting wattage) since the label describes the scene, not the wattage.
 */

import type { UseCaseKey } from "@/types/product";
import { getApplianceExample } from "./appliances";

export interface StudioAnchor {
  /** Percentage from the left edge of the scene image (0-100). */
  x: number;
  /** Percentage from the top edge of the scene image (0-100). */
  y: number;
}

/** How a device visually responds when switched on. Purely cosmetic. */
export type ApplianceReaction =
  | "glow"
  | "screen"
  | "cold"
  | "indicator"
  | "cpap"
  | "phone"
  | "fan";

const REACTION_BY_APPLIANCE_KEY: Record<string, ApplianceReaction> = {
  fridge: "cold",
  "chest-freezer": "cold",
  "rv-fridge-12v": "cold",
  "electric-cooler": "cold",
  "wifi-router": "indicator",
  "led-lights": "glow",
  "camp-lights": "glow",
  lantern: "glow",
  "desk-light": "glow",
  laptop: "screen",
  tv: "screen",
  "external-monitor": "screen",
  cpap: "cpap",
  phone: "phone",
  "portable-fan": "fan",
};

export function getApplianceReaction(applianceKey: string): ApplianceReaction {
  return REACTION_BY_APPLIANCE_KEY[applianceKey] ?? "glow";
}

export interface StudioApplianceInstance {
  /** Stable id within the scenario; used as the DeviceInput id. */
  id: string;
  /** Key into APPLIANCE_EXAMPLES — the source of running/surge watts. */
  applianceKey: string;
  /** On-screen label for this scenario (may differ from the shared example name). */
  label: string;
  anchor: StudioAnchor;
  defaultOn: boolean;
  defaultQuantity: number;
}

export interface StudioScenario {
  id: string;
  label: string;
  shortLabel: string;
  /** Filename stem under /public/power-setup-studio/, without extension. */
  imageStem: string;
  imageAlt: string;
  batteryAnchor: StudioAnchor;
  /**
   * Where the solar panels sit in this scene, or null when this particular
   * illustration does not show any panel (we never draw a panel that is not
   * actually in the image).
   */
  solarAnchor: StudioAnchor | null;
  appliances: StudioApplianceInstance[];
  /** Feeds the existing recommendation engine's use-case preference, or null. */
  useCase: UseCaseKey | null;
}

function device(
  id: string,
  applianceKey: string,
  label: string,
  anchor: StudioAnchor,
  defaultOn: boolean,
): StudioApplianceInstance {
  return { id, applianceKey, label, anchor, defaultOn, defaultQuantity: 1 };
}

export const STUDIO_SCENARIOS: StudioScenario[] = [
  {
    id: "home-backup",
    label: "Solar Home Backup",
    shortLabel: "Home Backup",
    imageStem: "power-setup-studio-home-backup",
    imageAlt:
      "Interactive illustrative scene — not an exact product or installation. Cutaway house at night with rooftop solar panels, a portable power station on the patio, a kitchen refrigerator, a living room, and an upstairs desk.",
    batteryAnchor: { x: 50, y: 57 },
    solarAnchor: { x: 37, y: 14 },
    useCase: "home-backup",
    appliances: [
      device("fridge", "fridge", "Refrigerator", { x: 30, y: 47 }, true),
      device("router", "wifi-router", "Wi-Fi Router", { x: 35, y: 68 }, true),
      device("lights", "led-lights", "Essential Lights", { x: 57, y: 80 }, true),
      device("laptop", "laptop", "Laptop", { x: 74, y: 32 }, false),
      device("tv", "tv", "TV", { x: 72, y: 63 }, false),
    ],
  },
  {
    id: "camping",
    label: "Camping Adventure",
    shortLabel: "Camping",
    imageStem: "power-setup-studio-camping",
    imageAlt:
      "Interactive illustrative scene — not an exact product or installation. Forest campsite at night by a lake, with ground-mounted solar panels, a portable power station, an electric cooler, a lit tent with string lights, a lantern, and a laptop on a camp table.",
    batteryAnchor: { x: 46, y: 60 },
    solarAnchor: { x: 18, y: 53 },
    useCase: "camping",
    appliances: [
      device("cooler", "electric-cooler", "Electric Cooler", { x: 29, y: 70 }, true),
      device("tent-lights", "camp-lights", "Tent Lights", { x: 70, y: 16 }, true),
      device("lantern", "lantern", "Lantern", { x: 57, y: 77 }, true),
      device("laptop", "laptop", "Laptop", { x: 76, y: 47 }, true),
      device("phone", "phone", "Phone Charging", { x: 82, y: 52 }, false),
    ],
  },
  {
    id: "van-life",
    label: "Van Life Setup",
    shortLabel: "Van Life",
    imageStem: "power-setup-studio-van-life",
    imageAlt:
      "Interactive illustrative scene — not an exact product or installation. Camper van interior at dusk with rooftop solar panels, a portable power station on the floor, a small refrigerator, a Wi-Fi router, interior lighting, a laptop on a fold-down table, and a ceiling ventilation fan.",
    batteryAnchor: { x: 44, y: 62 },
    solarAnchor: { x: 28, y: 10 },
    useCase: "rv",
    appliances: [
      device("fridge", "rv-fridge-12v", "Refrigerator", { x: 29, y: 58 }, true),
      device("router", "wifi-router", "Wi-Fi Router", { x: 32, y: 79 }, true),
      device("lights", "led-lights", "Interior Lights", { x: 48, y: 22 }, true),
      device("laptop", "laptop", "Laptop", { x: 57, y: 51 }, true),
      device("fan", "portable-fan", "Ventilation Fan", { x: 48, y: 16 }, false),
    ],
  },
  {
    id: "power-outage",
    label: "Power Outage Essentials",
    shortLabel: "Power Outage",
    imageStem: "power-setup-studio-power-outage",
    imageAlt:
      "Interactive illustrative scene — not an exact product or installation. Dark house interior on a rainy night with a rolling portable power station, a kitchen refrigerator, a Wi-Fi router, a living-room lamp, a CPAP machine on a bedroom nightstand, and a TV.",
    batteryAnchor: { x: 46, y: 47 },
    // This illustration does not show any solar panel — we do not draw one.
    solarAnchor: null,
    useCase: "home-backup",
    appliances: [
      device("fridge", "fridge", "Refrigerator", { x: 24, y: 33 }, true),
      device("router", "wifi-router", "Wi-Fi Router", { x: 33, y: 41 }, true),
      device("lights", "led-lights", "Essential Lights", { x: 62, y: 63 }, true),
      device("cpap", "cpap", "CPAP", { x: 55, y: 31 }, true),
      device("tv", "tv", "TV", { x: 76, y: 56 }, false),
    ],
  },
  {
    id: "remote-work",
    label: "Remote Work",
    shortLabel: "Remote Work",
    imageStem: "power-setup-studio-remote-work",
    imageAlt:
      "Interactive illustrative scene — not an exact product or installation. Wood-paneled home office at night with solar panels visible through the window, a portable power station, a desk with a laptop and external monitor, a Wi-Fi router, a desk lamp, and a phone charging.",
    batteryAnchor: { x: 37, y: 62 },
    solarAnchor: { x: 24, y: 40 },
    useCase: null,
    appliances: [
      device("laptop", "laptop", "Laptop", { x: 63, y: 48 }, true),
      device("monitor", "external-monitor", "External Monitor", { x: 78, y: 37 }, true),
      device("router", "wifi-router", "Wi-Fi Router", { x: 17, y: 68 }, true),
      device("desk-light", "desk-light", "Desk Light", { x: 93, y: 39 }, true),
      device("phone", "phone", "Phone Charging", { x: 85, y: 55 }, true),
    ],
  },
];

export function getStudioScenario(id: string): StudioScenario | undefined {
  return STUDIO_SCENARIOS.find((s) => s.id === id);
}

/** Resolve an appliance instance's watts/surge/hours from the shared example table. */
export function resolveApplianceInstance(instance: StudioApplianceInstance) {
  const example = getApplianceExample(instance.applianceKey);
  if (!example) {
    throw new Error(`Unknown appliance key in Power Setup Studio config: ${instance.applianceKey}`);
  }
  return {
    runningWatts: example.runningWatts,
    surgeWatts: example.surgeWatts,
    hoursPerDay: example.hoursPerDay,
  };
}
