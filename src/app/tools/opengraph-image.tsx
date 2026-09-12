import { ImageResponse } from "next/og";
import { ogTemplate, OG_SIZE } from "@/lib/og-template";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "PowerMatchLab Power Station Calculators & Tools";

export default function Image() {
  return new ImageResponse(
    ogTemplate({
      eyebrow: "Tools Hub",
      title: "Power Station Calculators & Tools",
      subtitle:
        "One shared, transparent engine behind refrigerator, CPAP, RV, Starlink, and home-backup sizing — plus the general calculator and comparator.",
    }),
    { ...size },
  );
}
