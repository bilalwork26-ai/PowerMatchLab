"use client";

import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * Loads gtag.js and configures the GA4 property. Page views are NOT sent
 * manually here — a single strategy only: GA4's own automatic measurement
 * sends the initial page_view, and Enhanced Measurement's "Page changes
 * based on browser history events" (on by default for a new GA4 web data
 * stream — confirm it in GA4 Admin → Data Streams → your stream → Enhanced
 * Measurement) detects the pushState-based navigations Next.js's App Router
 * uses for client-side transitions and sends a page_view for each. Adding a
 * manual page_view dispatch on top of that would double-count every
 * navigation, so there must be exactly one mechanism — this file only ever
 * sends the one config call.
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
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
