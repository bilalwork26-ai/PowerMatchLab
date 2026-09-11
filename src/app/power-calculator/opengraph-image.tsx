import { ImageResponse } from "next/og";
import { ogTemplate, OG_SIZE } from "@/lib/og-template";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "PowerMatchLab Power Calculator";

export default function Image() {
  return new ImageResponse(
    ogTemplate({
      eyebrow: "Power Calculator",
      title: "How Much Power Station Do You Actually Need?",
      subtitle:
        "Add your devices, set how long you need them, and get an explainable recommendation — not a guess.",
    }),
    { ...size },
  );
}
