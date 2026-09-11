"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

/** A next/link that also fires a named GA4 event on click. */
export function TrackedLink({
  event,
  eventParams,
  ...props
}: ComponentProps<typeof Link> & {
  event: AnalyticsEvent;
  eventParams?: Record<string, string | number | boolean | undefined>;
}) {
  return (
    <Link {...props} onClick={() => trackEvent(event, eventParams)} />
  );
}
