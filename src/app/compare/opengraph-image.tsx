import { ImageResponse } from "next/og";
import { ogTemplate, OG_SIZE } from "@/lib/og-template";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Compare Power Stations Side by Side on PowerMatchLab";

export default function Image() {
  return new ImageResponse(
    ogTemplate({
      eyebrow: "Compare Tool",
      title: "Compare Power Stations Side by Side",
      subtitle:
        "Capacity, output, surge, charging speed and weight — with the best verified value highlighted in every row.",
    }),
    { ...size },
  );
}
