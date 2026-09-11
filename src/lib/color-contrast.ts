/**
 * WCAG 2.x relative luminance / contrast ratio, for verifying real color
 * pairs used together in the UI actually meet AA — not just "this color
 * class looked fine on the background it was designed for." Used by
 * tests/color-contrast.test.ts to catch a class of bug that slipped
 * through once already: a light-on-dark color reused on a light surface
 * (or vice versa), which reads correctly in isolation but is nearly
 * invisible in combination.
 */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two hex colors, in the range 1 (no contrast) to 21 (black on white). */
export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

export const WCAG_AA_NORMAL_TEXT = 4.5;
export const WCAG_AA_LARGE_TEXT_OR_UI = 3.0;

export function meetsAaNormalText(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= WCAG_AA_NORMAL_TEXT;
}

export function meetsAaLargeTextOrUi(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= WCAG_AA_LARGE_TEXT_OR_UI;
}
