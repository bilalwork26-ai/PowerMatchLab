/**
 * Canonical author identity data.
 *
 * Single source of truth for every place PowerMatchLab names a real person
 * as author/editor — the author page, guide bylines, the dataset report
 * byline, and Person/Article structured data. Nothing here may state or
 * imply a credential, certification, degree, lab facility, physical test,
 * team, location, award, membership, or years of experience that is not
 * true. Keep every reference sourced from this object rather than
 * retyping the name or biography elsewhere.
 */

export interface Author {
  slug: string;
  name: string;
  jobTitle: string;
  email: string;
  market: string;
  /** Approved short biography, verbatim. */
  bio: string;
  /** Route to this author's page, e.g. "/authors/bilal-siali". */
  path: string;
  /** Conservative, factual topics for Person JSON-LD `knowsAbout` — never a credential claim. */
  knowsAbout: string[];
}

export const BILAL_SIALI: Author = {
  slug: "bilal-siali",
  name: "Bilal Siali",
  jobTitle: "Founder and editor",
  email: "contact@powermatchlab.com",
  market: "United States",
  bio: "Bilal Siali is the founder and editor of PowerMatchLab. He researches manufacturer-published specifications and oversees the development of transparent tools for calculating and comparing portable power stations. PowerMatchLab does not perform laboratory testing, and information that cannot be confirmed is identified as not verified.",
  path: "/authors/bilal-siali",
  knowsAbout: [
    "Portable power station specifications",
    "Power station comparison methodology",
  ],
};
