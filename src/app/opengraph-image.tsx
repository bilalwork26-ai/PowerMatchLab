import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/**
 * Default Open Graph image for the whole site. Reuses the same navy/brand
 * bolt mark and wordmark treatment as the header <Logo> (see
 * src/components/layout/Logo.tsx) so social previews match the in-site
 * identity. Generated at build/request time — no binary asset checked into
 * the repo, and no product imagery involved.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} — ${SITE.tagline}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1f3a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 100,
              height: 100,
              borderRadius: 24,
              background: "#1657ac",
            }}
          >
            <svg width="58" height="58" viewBox="0 0 24 24" fill="none">
              <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="#ffffff" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#ffffff" }}>
            <span>Power</span>
            <span style={{ color: "#4f8ee6" }}>Match</span>
            <span>Lab</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 34,
            color: "#b7c8e0",
          }}
        >
          {SITE.tagline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 24,
            color: "#8aa5cb",
          }}
        >
          Independent decision-support for portable power stations — US
        </div>
      </div>
    ),
    { ...size },
  );
}
