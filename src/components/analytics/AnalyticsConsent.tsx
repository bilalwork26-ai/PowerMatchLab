"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  applyConsentUpdate,
  getStoredConsent,
  setStoredConsent,
  REOPEN_CONSENT_EVENT,
  type ConsentChoice,
} from "@/lib/consent";
import { GoogleAnalytics } from "./GoogleAnalytics";

/**
 * Single owner of the visitor's consent choice and the one place that
 * decides whether GA4 loads at all. Server-rendered output is always "no
 * banner, no GA4" (both need localStorage, which only exists client-side);
 * the real choice is read in the effect below, right after mount.
 */
export function AnalyticsConsent() {
  const [choice, setChoice] = useState<ConsentChoice | null | "unset">("unset");

  useEffect(() => {
    setChoice(getStoredConsent());
    const reopen = () => setChoice(null);
    window.addEventListener(REOPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_CONSENT_EVENT, reopen);
  }, []);

  const choose = (next: ConsentChoice) => {
    setStoredConsent(next);
    applyConsentUpdate(next);
    setChoice(next);
  };

  return (
    <>
      {choice === "accepted" ? <GoogleAnalytics /> : null}
      {choice === null ? (
        <div
          role="region"
          aria-label="Cookie preferences"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-cyan-400/20 bg-navy-950/95 p-4 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.4)] backdrop-blur"
        >
          <div className="container-page flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-2xl text-sm text-navy-200">
              We use Google Analytics to understand how visitors use this site
              and Google AdSense for site-ownership verification. Both stay off
              until you accept — see our{" "}
              <Link href="/privacy-policy" className="underline hover:text-white">
                Privacy Policy
              </Link>{" "}
              for exactly what each one does.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => choose("rejected")}
                className="rounded-md border border-navy-600 px-4 py-2 text-sm font-medium text-navy-200 hover:border-navy-400 hover:text-white"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
