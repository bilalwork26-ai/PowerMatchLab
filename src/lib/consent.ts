/**
 * Consent Mode v2 state.
 *
 * PowerMatchLab defaults every Consent Mode signal to "denied" (see
 * components/analytics/ConsentDefaults.tsx, which sets that default before
 * any other tag runs). Nothing here ever grants consent on its own — only an
 * explicit visitor choice, read back from storage, can do that.
 *
 * This is "Basic" Consent Mode for Google Analytics specifically: the GA4
 * library itself (gtag.js + the measurement config call) is never loaded at
 * all until the visitor accepts — see AnalyticsConsent.tsx. The
 * gtag('consent', ...) calls below matter for Google AdSense's existing
 * verification script (loaded unconditionally in layout.tsx), which does
 * read these signals even before any ad units are placed.
 */

export type ConsentChoice = "accepted" | "rejected";

const CONSENT_KEY = "pml.consent.v1";

/** Custom event a "Cookie preferences" link anywhere on the site can dispatch to reopen the banner. */
export const REOPEN_CONSENT_EVENT = "pml:open-cookie-preferences";

export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw === "accepted" || raw === "rejected" ? raw : null;
  } catch {
    return null;
  }
}

export function setStoredConsent(choice: ConsentChoice): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* storage unavailable — the choice still applies for this page view via gtag consent update */
  }
}

/** Pushes the visitor's choice to gtag's Consent Mode state (affects AdSense immediately; GA4 only loads post-acceptance). */
export function applyConsentUpdate(choice: ConsentChoice): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const value = choice === "accepted" ? "granted" : "denied";
  window.gtag("consent", "update", {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
}
