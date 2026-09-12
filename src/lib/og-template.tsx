import { SITE } from "@/lib/site";

/**
 * Shared Open Graph image layout for route-specific `opengraph-image.tsx`
 * files (next/og ImageResponse). Every route-level OG image before this
 * shared once all rendered the same generic homepage logo card (the site
 * default at src/app/opengraph-image.tsx) — this gives each important page
 * a social preview that actually names the page instead.
 *
 * Deliberately excludes: prices, availability claims, "best"/award language
 * without context, and the Amazon logo/wordmark — this image is what gets
 * pasted into a forum post, a Pinterest pin, or a Slack message, so it has
 * to stand on its own without implying anything unverified.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const NAVY_950 = "#0b1220";
const NAVY_900 = "#0b1f3a";
const CYAN_300 = "#67e8f9";
const BRAND_300 = "#93c5fd";

/**
 * next/og's ImageResponse renderer has no glyph for "≈" (renders as a
 * missing-character box) even though the same text displays fine in a
 * normal browser via system fonts — found while adding OG images for the
 * /tools calculators, several of which quote their formula with "≈" in
 * copy also reused here. "~" conveys the same "approximately" meaning and
 * is present in every font next/og uses.
 */
function sanitizeForOgFont(text: string): string {
  return text.replace(/≈/g, "~");
}

export function ogTemplate({
  eyebrow,
  title,
  subtitle,
}: {
  /** Small uppercase label above the title, e.g. "Power Calculator" or "Guide". */
  eyebrow: string;
  /** Main headline — the page's own title, not the site name. */
  title: string;
  /** One supporting line, e.g. the page's own metaDescription, truncated by the caller if needed. */
  subtitle?: string;
}) {
  title = sanitizeForOgFont(title);
  subtitle = subtitle ? sanitizeForOgFont(subtitle) : subtitle;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: `linear-gradient(135deg, ${NAVY_950} 0%, ${NAVY_900} 100%)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#1657ac",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="#ffffff" />
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#ffffff" }}>
          <span>Power</span>
          <span style={{ color: BRAND_300 }}>Match</span>
          <span>Lab</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: CYAN_300,
            marginBottom: 18,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 46 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.08,
            color: "#ffffff",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 26,
              lineHeight: 1.4,
              color: "#b7c8e0",
              maxWidth: 920,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", fontSize: 20, color: "#6b84ab" }}>
        {SITE.url.replace(/^https?:\/\//, "")} · independent, editorial, U.S. market
      </div>
    </div>
  );
}
