"use client";

import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { GoogleAnalyticsPageview } from "./GoogleAnalyticsPageview";

/**
 * Loads gtag.js and configures the GA4 property. `send_page_view: false`
 * turns off gtag's own automatic initial page_view — GoogleAnalyticsPageview
 * below is the single, explicit source of every page_view (the first one and
 * every Next.js App Router navigation after it), so there's exactly one
 * mechanism and no double-counting. This replaces an earlier design that
 * relied entirely on GA4 Enhanced Measurement's "Page changes based on
 * browser history events" — a per-Data-Stream Admin toggle this codebase has
 * no way to read or guarantee is on, which made every page_view silently
 * dependent on GA4 property configuration alone.
 *
 * This component is only ever mounted by AnalyticsConsent.tsx once the
 * visitor has explicitly accepted — see lib/consent.ts. It performs no
 * consent check of its own; being mounted at all IS the signal.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <GoogleAnalyticsPageview />
    </>
  );
}
