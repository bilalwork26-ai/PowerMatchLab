/**
 * GA4 event tracking.
 *
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID` controls everything: unset, no gtag script
 * is ever loaded (see components/analytics/GoogleAnalytics.tsx) and every
 * call below becomes a safe no-op. Never hardcode a Measurement ID here.
 *
 * Event names match the fixed vocabulary PowerMatchLab tracks:
 * view_product, affiliate_click, calculator_start, calculator_completed,
 * compare_add_product, comparison_started, comparison_completed,
 * guide_cta_click.
 *
 * Every param value must be an internal identifier (a product id, a guide
 * slug, an enum string from a fixed list below), a count, or a boolean —
 * never free text a visitor typed, an Amazon URL, an ASIN, an affiliate
 * tag, or anything else that could identify a person. This is enforced by
 * the type signature below (no bare `string` param) and by
 * tests/analytics-events.test.ts.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export type AnalyticsEvent =
  | "calculator_start"
  | "calculator_completed"
  | "compare_add_product"
  | "comparison_started"
  | "comparison_completed"
  | "affiliate_click"
  | "view_product"
  | "guide_cta_click"
  | "share_click"
  | "csv_download"
  | "recommendation_click";

/**
 * Which recommendation surface a click happened on — an internal enum, so
 * recommendation_click can answer "which surface converts" without ever
 * carrying free text. Shared by RecommendationCard's three current callers:
 * the general Power Calculator, the six /tools/[slug] calculators, and
 * Power Setup Studio.
 */
export type RecommendationClickLocation =
  | "power_calculator"
  | "tool_results"
  | "power_setup_studio";

/** Which shareable content block a share/copy/download action happened on — an internal enum, never a URL. */
export type ShareableContentKey =
  | "research_report"
  | "guide"
  | "best_for"
  | "product"
  | "compare"
  | "tool";

/** How a share_click was fulfilled — never which specific network, since the native picker doesn't report that. */
export type ShareMethod = "native_share" | "copy_link";

/**
 * Where on the site an affiliate click happened — an internal enum, never a
 * URL or free text, so `affiliate_click` events can answer "which placement
 * converts" without carrying anything identifying.
 */
export type AffiliateClickPlacement =
  | "product_page_hero"
  | "product_page_reviews_tab"
  | "product_page_mobile_bar"
  | "product_card"
  | "compare_page"
  | "model_comparison_page"
  | "calculator_recommendation"
  | "deals_page";

/** Only internal identifiers, counts, and booleans — never free text, PII, URLs, ASINs, or affiliate tags. */
type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: AnalyticsEvent, params: EventParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
