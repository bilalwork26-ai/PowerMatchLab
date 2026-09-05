import type { ComponentType, SVGProps } from "react";
import {
  FridgeIcon,
  RouterIcon,
  LampIcon,
  LaptopIcon,
  TvIcon,
  CpapIcon,
  PhoneIcon,
  FanIcon,
  MonitorIcon,
  CoolerIcon,
  LanternIcon,
} from "@/components/ui/icons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_BY_APPLIANCE_KEY: Record<string, IconComponent> = {
  fridge: FridgeIcon,
  "chest-freezer": FridgeIcon,
  "rv-fridge-12v": FridgeIcon,
  "electric-cooler": CoolerIcon,
  "wifi-router": RouterIcon,
  "led-lights": LampIcon,
  "camp-lights": LampIcon,
  lantern: LanternIcon,
  "desk-light": LampIcon,
  laptop: LaptopIcon,
  tv: TvIcon,
  "external-monitor": MonitorIcon,
  cpap: CpapIcon,
  phone: PhoneIcon,
  "portable-fan": FanIcon,
};

export function getApplianceIcon(applianceKey: string): IconComponent {
  return ICON_BY_APPLIANCE_KEY[applianceKey] ?? LampIcon;
}
