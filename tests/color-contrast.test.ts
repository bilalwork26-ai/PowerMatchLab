import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import tailwindConfig from "../tailwind.config";
import { contrastRatio, WCAG_AA_NORMAL_TEXT, WCAG_AA_LARGE_TEXT_OR_UI } from "@/lib/color-contrast";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}
const srcFiles = walk(SRC_DIR);
const srcContents = new Map(srcFiles.map((f) => [f, readFileSync(f, "utf8")]));
function read(rel: string): string {
  return srcContents.get(join(ROOT, rel))!;
}

// Pull the real hex values straight from the design tokens rather than
// hardcoding a second copy here — if a shade is ever retuned, this test
// re-checks against the value actually shipped, not a stale snapshot.
const colors = (tailwindConfig as { theme: { extend: { colors: Record<string, Record<string, string> | string> } } })
  .theme.extend.colors;
const navy = colors.navy as Record<string, string>;
const cyan = colors.cyan as Record<string, string>;
const white = "#ffffff";

/**
 * Regression coverage for a real bug: the /research report page used a
 * white body background (bg-white) while relying on the site's shared
 * `.prose-pml` class for its default text styling — but `.prose-pml` is
 * exclusively tuned for the dark navy-950 surface every other page pairs
 * it with (light body text, `text-white` headings/strong). On a white
 * background, that made every heading literally invisible (white-on-white)
 * and most body text/links fail WCAG AA. Fixed by moving the whole page to
 * the standard dark surface instead of inventing one-off light-mode
 * overrides for a dozen elements.
 */
describe("prose-pml is always paired with the dark navy-950 surface it's designed for", () => {
  // Matches an actual className usage ("prose-pml" inside a className
  // string), not a doc-comment that merely mentions the class name (e.g.
  // AmazonCta.tsx explains its `.prose-pml a` CSS-specificity workaround in
  // a comment without ever rendering prose-pml itself).
  const usesProsePmlAsClassName = (content: string) =>
    /className=\{?[`"'][^`"']*\bprose-pml\b/.test(content);
  const filesUsingProsePml = srcFiles.filter((f) => usesProsePmlAsClassName(srcContents.get(f)!));

  it("at least one real usage exists (sanity check for this test itself)", () => {
    expect(filesUsingProsePml.length).toBeGreaterThan(0);
  });

  it("every file that uses prose-pml also renders a bg-navy-950 surface — never bg-white or another light background alongside it", () => {
    const offenders: string[] = [];
    for (const file of filesUsingProsePml) {
      const content = srcContents.get(file)!;
      const hasDarkSurface = content.includes("bg-navy-950");
      const hasLightSurface = /\bbg-white\b/.test(content) || /\bbg-navy-50\b(?!\d)/.test(content);
      if (!hasDarkSurface || hasLightSurface) {
        offenders.push(`${file} (dark surface present: ${hasDarkSurface}, light surface present: ${hasLightSurface})`);
      }
    }
    expect(offenders, `prose-pml used without its required dark surface, or alongside a light one:\n${offenders.join("\n")}`).toEqual([]);
  });
});

describe("Color pairs actually used on the /research report page meet WCAG AA", () => {
  const bg = navy[950]; // the page's own background after the fix

  it("navy-950 is the page's declared background (confirms this test targets the real color, not a guess)", () => {
    const src = read("src/app/research/portable-power-station-specs-2026/page.tsx");
    expect(src).toContain("bg-navy-950");
    expect(src).not.toContain("bg-white");
  });

  const normalTextPairs: [string, string][] = [
    ["prose-pml body text (navy-200)", navy[200]],
    ["headings/strong (white)", white],
    ["links (cyan-300)", cyan[300]],
    ["Stat card value (white)", white],
    ["Stat card label (navy-400)", navy[400]],
    ["table header (navy-400)", navy[400]],
    ["table body (navy-200)", navy[200]],
    ["table body emphasis (white)", white],
    ["capacity chart label (navy-300)", navy[300]],
    ["citation box body (navy-200)", navy[200]],
    ["footer note (navy-400)", navy[400]],
  ];

  for (const [label, fg] of normalTextPairs) {
    it(`${label} on navy-950 clears 4.5:1`, () => {
      const ratio = contrastRatio(fg, bg);
      expect(ratio, `${label} (${fg}) on navy-950 (${bg}) = ${ratio.toFixed(2)}:1, needs >= ${WCAG_AA_NORMAL_TEXT}`).toBeGreaterThanOrEqual(
        WCAG_AA_NORMAL_TEXT,
      );
    });
  }

  it("the capacity-distribution bar fill (cyan-400) clears the 3:1 large-graphic/UI threshold against its own track (navy-800)", () => {
    const ratio = contrastRatio(cyan[400], navy[800]);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT_OR_UI);
  });
});

describe("color-contrast.ts sanity checks (known reference values)", () => {
  it("black on white is the maximum ratio (21:1)", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  it("identical colors have a 1:1 ratio", () => {
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
  });

  it("known-bad pair from the actual incident: navy-200 text on a white background fails badly", () => {
    const ratio = contrastRatio(navy[200], white);
    expect(ratio).toBeLessThan(WCAG_AA_NORMAL_TEXT);
  });

  it("known-bad pair from the actual incident: white text on white background is 1:1 (the invisible-heading bug)", () => {
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
  });
});
