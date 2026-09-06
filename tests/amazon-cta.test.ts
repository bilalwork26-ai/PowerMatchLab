import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression guard for a real bug: inside prose-scoped pages (globals.css
 * `.prose-pml a`), the centralized "Check Price on Amazon" button
 * (AmazonCta.tsx) inherited cyan link text on top of its amber background,
 * because `.prose-pml a` (one class + one element = higher specificity than
 * a bare utility class) overrode the button's own `text-amazon-text` class.
 * First reproduced on /guides/power-stations-for-remote-work-and-van-life's
 * "Related products" section (ProductCard -> AmazonCta, rendered inside
 * <article className="prose-pml ...">).
 *
 * Fix: AmazonCta's anchor carries a bare `amazon-cta-link` styling hook, and
 * `.prose-pml a` is scoped with `:not(.amazon-cta-link)` to exclude it —
 * no `!important`, no change to the button's own colors, and no effect on
 * any other prose link (which must stay cyan).
 */
describe("AmazonCta: dark text survives inside prose-scoped pages", () => {
  const amazonCtaSrc = readFileSync(
    join(process.cwd(), "src/components/product/AmazonCta.tsx"),
    "utf8",
  );
  const globalsCss = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

  it("the CTA anchor carries the amazon-cta-link marker class", () => {
    expect(amazonCtaSrc).toContain("amazon-cta-link");
  });

  it("the CTA anchor still sets its own dark text color utility", () => {
    expect(amazonCtaSrc).toContain("text-amazon-text");
  });

  it(".prose-pml a excludes .amazon-cta-link (the actual fix)", () => {
    expect(globalsCss).toContain(".prose-pml a:not(.amazon-cta-link)");
  });

  it("no bare, unscoped '.prose-pml a {' rule exists (would re-break the exclusion)", () => {
    // Matches only a rule opener with nothing before the brace besides
    // ".prose-pml a" (allowing whitespace) — the scoped selector above is a
    // different string and won't match this pattern.
    expect(globalsCss).not.toMatch(/\.prose-pml a\s*\{/);
  });

  it("the fix does not reach for !important", () => {
    const proseAnchorRuleMatch = globalsCss.match(/\.prose-pml a:not\(\.amazon-cta-link\)\s*\{[^}]*\}/);
    expect(proseAnchorRuleMatch, "expected to find the scoped .prose-pml a rule").not.toBeNull();
    expect(proseAnchorRuleMatch![0]).not.toContain("!important");
    expect(amazonCtaSrc).not.toContain("!text-amazon-text");
  });

  it("other prose links (not the Amazon CTA) are untouched by the exclusion", () => {
    // The scoped selector only carves out .amazon-cta-link; every other <a>
    // inside .prose-pml keeps matching the cyan/underline styling.
    const rule = globalsCss.match(/\.prose-pml a:not\(\.amazon-cta-link\)\s*\{([^}]*)\}/);
    expect(rule).not.toBeNull();
    expect(rule![1]).toContain("text-cyan-300");
  });
});
