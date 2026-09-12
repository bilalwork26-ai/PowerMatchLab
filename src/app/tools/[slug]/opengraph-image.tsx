import { ImageResponse } from "next/og";
import { getTool, TOOLS } from "@/content/tools";
import { ogTemplate, OG_SIZE } from "@/lib/og-template";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const tool = getTool(params.slug);
  if (!tool) return [];
  return [{ id: "tool-og", size, contentType, alt: tool.title }];
}

export default async function Image({ params }: { params: { slug: string } }) {
  const tool = getTool(params.slug);
  const title = tool?.title ?? "PowerMatchLab Calculator";
  // shortAnswer runs long on some tools; next/og has no native line-clamp,
  // so truncate to a length that reliably fits two lines at this font size
  // instead of overflowing the canvas.
  const subtitle = tool
    ? tool.shortAnswer.length > 140
      ? `${tool.shortAnswer.slice(0, 137)}...`
      : tool.shortAnswer
    : undefined;

  return new ImageResponse(
    ogTemplate({ eyebrow: "Free Calculator", title, subtitle }),
    { ...size },
  );
}
