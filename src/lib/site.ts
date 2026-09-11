/** Global site configuration: identity, navigation, canonical base URL. */

/** Placeholder production domain used only if the real one is not yet set. */
const FALLBACK_PRODUCTION_URL = "https://www.powermatchlab.com";
const LOCAL_DEV_URL = "http://localhost:3000";

/** The only two hostnames this brand ever runs on: the canonical `www` host and its bare apex. */
const CANONICAL_HOST = "www.powermatchlab.com";
const APEX_HOST = "powermatchlab.com";

/**
 * Forces the `www` host (and https) whenever a configured URL is for this
 * site's own domain but missing `www` — e.g. a hosting provider's env var
 * set to `https://powermatchlab.com`. This is deliberately narrow: it only
 * rewrites this brand's own apex domain, never a different domain someone
 * might legitimately configure (a staging/preview URL, localhost, etc.).
 */
function enforceWwwForOwnDomain(url: URL): URL {
  if (url.hostname.toLowerCase() === APEX_HOST) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
  }
  return url;
}

/**
 * Resolves the canonical site URL used for absolute links, canonical tags,
 * the sitemap, OG/Twitter metadata and JSON-LD.
 *
 * - Prefers `NEXT_PUBLIC_SITE_URL` when it is set and parses as a valid URL
 *   (this is how a real deployment should configure its live domain) — but
 *   if that value is this site's own apex domain without `www`, it is
 *   rewritten to the canonical `www` host rather than trusted as-is. A
 *   hosting provider's env var being misconfigured to the bare apex domain
 *   must never leak into canonical tags, the sitemap, or JSON-LD.
 * - If the env var is set but fails to parse as a URL at all, it is
 *   rejected (not silently used) and treated the same as unset, with a
 *   warning, since a broken value is worse than the documented fallback.
 * - In local development (no env var set) it falls back to localhost, so a
 *   `next dev` run never emits links pointing at the production domain.
 * - In a production build without the env var set, it falls back to the
 *   placeholder production domain and logs a warning so the gap is visible
 *   in build output — this keeps the build green while making clear the
 *   real domain still needs to be configured before public launch.
 */
function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) {
    try {
      const parsed = enforceWwwForOwnDomain(new URL(fromEnv));
      return parsed.origin;
    } catch {
      // eslint-disable-next-line no-console
      console.warn(
        `[PowerMatchLab] NEXT_PUBLIC_SITE_URL is set to "${fromEnv}", which is ` +
          `not a valid URL — ignoring it and falling back to ${FALLBACK_PRODUCTION_URL}.`,
      );
      // falls through to the same fallback logic as "unset" below
    }
  }

  if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "[PowerMatchLab] NEXT_PUBLIC_SITE_URL is not set — falling back to " +
        `${FALLBACK_PRODUCTION_URL}. Set NEXT_PUBLIC_SITE_URL to the real ` +
        "production domain before public launch.",
    );
    return FALLBACK_PRODUCTION_URL;
  }

  return LOCAL_DEV_URL;
}

export const SITE = {
  name: "PowerMatchLab",
  tagline: "Compare. Calculate. Choose smarter.",
  description:
    "PowerMatchLab is an independent decision-support site for portable power stations. Calculate what you actually need, compare models side by side, and follow a verified link to Amazon.",
  /** Canonical base URL. See `resolveSiteUrl` above for the fallback rules. */
  url: resolveSiteUrl(),
  locale: "en_US",
  market: "United States",
  /** The only published contact channel — never a personal address. */
  email: "contact@powermatchlab.com",
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Compare", href: "/compare" },
  { label: "Power Calculator", href: "/power-calculator" },
  { label: "Studio", href: "/power-setup-studio" },
  { label: "Guides", href: "/guides" },
];

/** Full descriptive label for the footer link, distinct from the short "Studio" nav label above. */
export const POWER_SETUP_STUDIO_NAV: NavItem = {
  label: "Power Setup Studio",
  href: "/power-setup-studio",
};

/** Compact bottom navigation for small screens (see mobile reference). */
export const MOBILE_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Calculator", href: "/power-calculator" },
  { label: "Compare", href: "/compare" },
  { label: "Products", href: "/products" },
  { label: "More", href: "/guides" },
];

export const BEST_FOR_NAV: NavItem[] = [
  { label: "Best for Camping", href: "/best-for-camping" },
  { label: "Best for RV", href: "/best-for-rv" },
  { label: "Best for Refrigerator Backup", href: "/best-for-refrigerator-backup" },
  { label: "Best for Home Backup", href: "/best-for-home-backup" },
];

export const LEGAL_NAV: NavItem[] = [
  { label: "About / Methodology", href: "/about-methodology" },
  { label: "Editorial Policy", href: "/editorial-policy" },
  { label: "Contact", href: "/contact" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
];

export const AFFILIATE_DISCLOSURE_SHORT =
  "PowerMatchLab is reader-supported. As an Amazon Associate I earn from qualifying purchases. “Check Price on Amazon” links carry our Amazon Associates tracking ID. We never accept payment for placement or ratings.";
