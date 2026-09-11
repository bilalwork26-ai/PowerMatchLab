"use client";

import { REOPEN_CONSENT_EVENT } from "@/lib/consent";

/** Reopens the cookie-consent banner so a visitor can change an earlier choice. */
export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(REOPEN_CONSENT_EVENT))}
      className={className}
    >
      Cookie preferences
    </button>
  );
}
