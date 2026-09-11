/**
 * GA4 event tracking.
 *
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID` controls everything: unset, no gtag script
 * is ever loaded (see components/analytics/GoogleAnalytics.tsx) and every
 * call below becomes a safe no-op. Never hardcode a Measurement ID here.
 *
 * Event names match the fixed vocabulary PowerMatchLab tracks:
 * calculator_start, calculator_complete, compare_add_product,
 * compare_complete, amazon_affiliate_click, product_view, guide_cta_click.
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
  | "calculator_complete"
  | "compare_add_product"
  | "compare_complete"
  | "amazon_affiliate_click"
  | "product_view"
  | "guide_cta_click";

export function trackEvent(
  name: AnalyticsEvent,
  params: Record<string, string | number | boolean | undefined> = {},
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
