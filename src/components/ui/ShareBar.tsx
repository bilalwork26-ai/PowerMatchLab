"use client";

import { useState } from "react";
import { trackEvent, type ShareableContentKey } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { CopyIcon, CheckIcon } from "@/components/ui/icons";

/**
 * Discreet share/copy/download row — not a social-icon strip, no external
 * share-widget script. Uses the native Web Share API where the browser
 * supports it (mobile Safari/Chrome show the OS share sheet — the real
 * social buttons the visitor already has installed) and falls back to a
 * plain "Copy link" button everywhere else, including desktop browsers
 * that don't implement navigator.share.
 */
export function ShareBar({
  url,
  title,
  contentKey,
  csvHref,
  csvLabel = "Download CSV",
  className,
}: {
  /** Absolute URL of the current page. */
  url: string;
  title: string;
  contentKey: ShareableContentKey;
  /** When set, shows a third "download" link — e.g. the research report's CSV route. */
  csvHref?: string;
  csvLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("share_click", { content_key: contentKey, method: "copy_link" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API unavailable/denied — button just stays "Copy link" */
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
      trackEvent("share_click", { content_key: contentKey, method: "native_share" });
    } catch {
      /* user cancelled the share sheet, or it's unsupported after all — no-op, not an error */
    }
  };

  const buttonCls =
    "inline-flex items-center gap-1.5 rounded-md border border-navy-700 px-3 py-1.5 text-xs font-medium text-navy-300 hover:border-navy-500 hover:text-white";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {canNativeShare ? (
        <button type="button" onClick={nativeShare} className={buttonCls}>
          Share
        </button>
      ) : null}
      <button type="button" onClick={copyLink} className={buttonCls}>
        {copied ? (
          <>
            <CheckIcon width={13} height={13} />
            Copied
          </>
        ) : (
          <>
            <CopyIcon width={13} height={13} />
            Copy link
          </>
        )}
      </button>
      {csvHref ? (
        <a
          href={csvHref}
          onClick={() => trackEvent("csv_download", { content_key: contentKey })}
          className={buttonCls}
        >
          {csvLabel}
        </a>
      ) : null}
    </div>
  );
}
