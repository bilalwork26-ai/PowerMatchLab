"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * The one place page_view is ever dispatched. GoogleAnalytics.tsx's config
 * call sets `send_page_view: false`, so this is not a supplement to GA4's
 * own automatic page_view — it replaces it. That's a deliberate choice: the
 * automatic behavior for Next.js App Router navigations depends on GA4
 * Enhanced Measurement's "Page changes based on browser history events"
 * toggle, a per-Data-Stream Admin setting this codebase has no way to read
 * or guarantee is on, especially for a newly created property. Sending it
 * explicitly here removes that dependency entirely.
 */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const query = searchParams.toString();
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: query ? `${pathname}?${query}` : pathname,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

/**
 * `useSearchParams()` opts the whole render tree that reaches it out of
 * static generation at build time unless wrapped in Suspense (Next.js App
 * Router requirement) — this boundary keeps that opt-out scoped to just
 * this tracker instead of the entire root layout.
 */
export function GoogleAnalyticsPageview() {
  return (
    <Suspense fallback={null}>
      <PageviewTracker />
    </Suspense>
  );
}
