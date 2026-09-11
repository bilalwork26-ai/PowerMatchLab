import { ImageResponse } from "next/og";
import { getGuide, GUIDES } from "@/content/guides";
import { ogTemplate, OG_SIZE } from "@/lib/og-template";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) return [];
  return [{ id: "guide-og", size, contentType, alt: guide.title }];
}

export default async function Image({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  const title = guide?.title ?? "PowerMatchLab Guide";
  // metaDescription runs long on some guides; next/og has no native
  // line-clamp, so truncate to a length that reliably fits two lines at
  // this font size instead of overflowing the canvas.
  const subtitle = guide
    ? guide.metaDescription.length > 140
      ? `${guide.metaDescription.slice(0, 137)}...`
      : guide.metaDescription
    : undefined;

  return new ImageResponse(
    ogTemplate({ eyebrow: "PowerMatchLab Guide", title, subtitle }),
    { ...size },
  );
}
