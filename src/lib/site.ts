/** Global site configuration: identity, navigation, canonical base URL. */

/** Placeholder production domain used only if the real one is not yet set. */
const FALLBACK_PRODUCTION_URL = "https://www.powermatchlab.com";
const LOCAL_DEV_URL = "http://localhost:3000";

/**
 * Resolves the canonical site URL used for absolute links, canonical tags,
 * the sitemap, OG/Twitter metadata and JSON-LD.
 *
 * - Always prefers `NEXT_PUBLIC_SITE_URL` when it is set (this is how a real
 *   deployment should configure its live domain).
 * - In local development (no env var set) it falls back to localhost, so a
 *   `next dev` run never emits links pointing at the production domain.
 * - In a production build without the env var set, it falls back to the
 *   placeholder production domain and logs a warning so the gap is visible
 *   in build output — this keeps the build green while making clear the
 *   real domain still needs to be configured before public launch.
 */
function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

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
  { label: "Guides", href: "/guides" },
  { label: "Deals", href: "/deals" },
];

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
