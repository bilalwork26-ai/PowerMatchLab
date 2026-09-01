/** Global site configuration: identity, navigation, canonical base URL. */

export const SITE = {
  name: "PowerMatchLab",
  tagline: "Compare. Calculate. Choose smarter.",
  description:
    "PowerMatchLab is an independent decision-support site for portable power stations. Calculate what you actually need, compare models side by side, and follow a verified link to Amazon.",
  /** Overridable at build time; used for canonical URLs, sitemap and OG tags. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.powermatchlab.com").replace(
    /\/$/,
    "",
  ),
  locale: "en_US",
  market: "United States",
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
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
];

export const AFFILIATE_DISCLOSURE_SHORT =
  "PowerMatchLab is reader-supported. “Check Price on Amazon” links currently point to normal Amazon product pages; Amazon Associates tracking will be added once the site is registered. We never accept payment for placement or ratings.";
