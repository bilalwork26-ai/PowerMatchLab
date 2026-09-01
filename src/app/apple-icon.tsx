import { ImageResponse } from "next/og";

/**
 * Apple touch icon. Reuses the same navy/brand bolt mark as the header <Logo>
 * (see src/components/layout/Logo.tsx) so the home-screen icon matches the
 * in-site identity. Generated at build/request time — no binary asset checked
 * into the repo.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1f3a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 124,
            height: 124,
            borderRadius: 30,
            background: "#1657ac",
          }}
        >
          <svg width="74" height="74" viewBox="0 0 24 24" fill="none">
            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="#ffffff" />
          </svg>
        </div>
      </div>
    ),
    { ...size },
  );
}
