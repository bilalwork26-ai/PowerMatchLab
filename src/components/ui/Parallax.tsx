"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Very light scroll-tied parallax: translates its children a few pixels
 * as the page scrolls past this element, capped to a small range so nothing
 * ever visually distorts or drifts far from its layout position.
 *
 * Uses scroll position (not mouse movement) so the effect works the same
 * on touch devices. Skips entirely under prefers-reduced-motion — the
 * wrapped content simply stays static, which is a fully valid, readable
 * state on its own (this only ever adds a transform, never opacity).
 */
export function Parallax({
  children,
  range = 14,
  className,
}: {
  children: ReactNode;
  /** Max translateY in px in either direction. */
  range?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const viewportMid = window.innerHeight / 2;
      const elementMid = rect.top + rect.height / 2;
      const distance = (viewportMid - elementMid) / viewportMid;
      const clamped = Math.max(-1, Math.min(1, distance));
      el.style.transform = `translateY(${(clamped * range).toFixed(1)}px)`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [range]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
