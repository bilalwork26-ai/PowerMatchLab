import { ImageResponse } from "next/og";
import { ogTemplate, OG_SIZE } from "@/lib/og-template";
import { getAllProducts } from "@/data/products";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Portable Power Station Specifications, 2026 — PowerMatchLab Catalog Dataset Report";

export default function Image() {
  const productCount = getAllProducts().length;
  return new ImageResponse(
    ogTemplate({
      eyebrow: "Catalog Dataset Report",
      title: "Portable Power Station Specs, 2026",
      subtitle: `${productCount} products, computed capacity/output/weight distributions, and a free CSV — an open, editorial dataset, not a sales ranking.`,
    }),
    { ...size },
  );
}
