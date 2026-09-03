"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Hard ceiling on how long content may stay armed (opacity 0) without an
 * intersection ever firing — see the note in the effect below. */
const MAX_HIDDEN_MS = 1200;

/**
 * Wraps children in a gentle fade/rise-in-on-scroll effect.
 *
 * The server-rendered output carries no reveal classes, so content is
 * fully visible with JavaScript disabled. On mount, if the visitor has
 * not requested reduced motion, we arm the element (opacity 0, slight
 * offset) and observe it; the moment it enters the viewport we flip it
 * visible and stop observing. A reduced-motion visitor, or one whose
 * browser lacks IntersectionObserver, skips the arm step entirely and
 * simply sees the content as normal, unanimated markup.
 *
 * A bounded fallback timer also forces the element visible after
 * MAX_HIDDEN_MS regardless of whether it ever intersected. Below-the-fold
 * content otherwise depends entirely on the visitor scrolling far enough,
 * slowly enough, for the browser to dispatch an intersection — a
 * full-page screenshot tool that resizes rather than scrolls, a very fast
 * programmatic scroll, or any other edge case that never triggers the
 * observer would otherwise leave that content invisible indefinitely.
 * This timer guarantees the page is always fully readable within ~2s of
 * load even in that worst case, while changing nothing for the normal,
 * much faster scroll-triggered reveal.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") return;

    setArmed(true);
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      setVisible(true);
      observer.disconnect();
      clearTimeout(fallback);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    const fallback = setTimeout(reveal, MAX_HIDDEN_MS);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(armed && (visible ? "reveal-visible" : "reveal-armed"), className)}
      style={armed && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
