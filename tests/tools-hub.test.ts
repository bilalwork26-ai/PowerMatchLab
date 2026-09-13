import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { TOOLS, getTool } from "@/content/tools";
import { GUIDES, getGuide } from "@/content/guides";
import { BEST_FOR, getBestFor } from "@/content/best-for";
import { COMPARISONS, getComparison } from "@/content/comparisons";
import { BILAL_SIALI } from "@/lib/authors";
import { PRIMARY_NAV } from "@/lib/site";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}
const srcFiles = walk(SRC_DIR);
const srcContents = new Map(srcFiles.map((f) => [f, readFileSync(f, "utf8")]));
function read(rel: string): string {
  return srcContents.get(join(ROOT, rel))!;
}

const EXPECTED_SLUGS = [
  "refrigerator-runtime-calculator",
  "cpap-battery-calculator",
  "rv-power-calculator",
  "rv-air-conditioner-runtime-calculator",
  "starlink-runtime-calculator",
  "home-backup-calculator",
];

describe("TOOLS content: exactly the 5 specialized calculators, all well-formed", () => {
  it("declares exactly the 5 expected slugs, no more, no fewer", () => {
    expect(TOOLS.map((t) => t.slug).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it("every slug is unique", () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every tool has non-empty title, shortTitle, metaDescription, shortAnswer, forWhom, and formula", () => {
    for (const t of TOOLS) {
      expect(t.title.length, t.slug).toBeGreaterThan(10);
      expect(t.shortTitle.length, t.slug).toBeGreaterThan(0);
      expect(t.metaDescription.length, t.slug).toBeGreaterThan(20);
      expect(t.shortAnswer.length, t.slug).toBeGreaterThan(20);
      expect(t.forWhom.length, t.slug).toBeGreaterThan(10);
      expect(t.formula.length, t.slug).toBeGreaterThan(10);
    }
  });

  it("every tool has substantial indexable content: at least 2 sections, 2 common mistakes, 2 FAQ, 1 source", () => {
    for (const t of TOOLS) {
      expect(t.sections.length, t.slug).toBeGreaterThanOrEqual(2);
      expect(t.commonMistakes.length, t.slug).toBeGreaterThanOrEqual(2);
      expect(t.faq.length, t.slug).toBeGreaterThanOrEqual(2);
      expect(t.sources.length, t.slug).toBeGreaterThanOrEqual(1);
      for (const s of t.sections) {
        expect(s.body.length, `${t.slug}/${s.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("every relatedGuideSlugs entry references a real guide in GUIDES", () => {
    for (const t of TOOLS) {
      for (const slug of t.relatedGuideSlugs) {
        expect(getGuide(slug), `${t.slug} references missing guide "${slug}"`).toBeDefined();
      }
    }
  });

  it("every relatedBestForSlug references a real best-for page in BEST_FOR", () => {
    for (const t of TOOLS) {
      if (t.relatedBestForSlug) {
        expect(getBestFor(t.relatedBestForSlug), `${t.slug} references missing best-for "${t.relatedBestForSlug}"`).toBeDefined();
      }
    }
  });

  it("getTool resolves every declared slug and returns undefined for an unknown one", () => {
    for (const t of TOOLS) {
      expect(getTool(t.slug)?.slug).toBe(t.slug);
    }
    expect(getTool("not-a-real-tool")).toBeUndefined();
  });
});

describe("Guides <-> Tools reciprocal linking", () => {
  it("every guide.relatedToolSlug references a real tool in TOOLS", () => {
    for (const g of GUIDES) {
      if (g.relatedToolSlug) {
        expect(getTool(g.relatedToolSlug), `${g.slug} references missing tool "${g.relatedToolSlug}"`).toBeDefined();
      }
    }
  });

  it("the refrigerator, CPAP, RV and home-backup tools each have at least one guide linking back to them", () => {
    const guidesWithTool = new Set(GUIDES.filter((g) => g.relatedToolSlug).map((g) => g.relatedToolSlug));
    for (const slug of [
      "refrigerator-runtime-calculator",
      "cpap-battery-calculator",
      "rv-power-calculator",
      "home-backup-calculator",
    ]) {
      expect(guidesWithTool.has(slug), `no guide links back to ${slug}`).toBe(true);
    }
  });

  it("the guide template renders a relatedTool 'Next steps' link when guide.relatedToolSlug is set", () => {
    const src = read("src/app/guides/[slug]/page.tsx");
    expect(src).toContain("guide.relatedToolSlug");
    expect(src).toContain("relatedTool.slug");
  });
});

describe("Solar charging calculator: audited, kept as ONE page (embedded in its guide), never duplicated as a competing /tools route", () => {
  it("no /tools slug duplicates the solar-charging guide's intent", () => {
    const solarLikeSlugs = TOOLS.filter((t) => /solar/i.test(t.slug));
    expect(solarLikeSlugs).toEqual([]);
  });

  it("the solar-charging guide keeps its embedded calculator and is not itself in TOOLS", () => {
    const guide = getGuide("how-long-to-charge-power-station-with-solar");
    expect(guide).toBeDefined();
    expect(guide!.embed).toBe("solar-charge-calculator");
    expect(guide!.relatedToolSlug).toBeUndefined();
  });

  it("the /tools hub links directly to the existing solar-charging guide instead of a new route", () => {
    const src = read("src/app/tools/page.tsx");
    expect(src).toContain("/guides/how-long-to-charge-power-station-with-solar");
  });
});

describe("Routing: no collisions with existing top-level routes, sitemap and nav wired up", () => {
  it("no existing top-level src/app route folder is named 'tools' before this change conflicts", () => {
    // The /tools/[slug] catch-all must not shadow any sibling top-level route.
    const appDir = join(SRC_DIR, "app");
    const topLevel = readdirSync(appDir).filter((e) => statSync(join(appDir, e)).isDirectory());
    expect(topLevel.filter((e) => e === "tools").length).toBe(1);
  });

  it("sitemap.ts includes /tools and every tool's own path", () => {
    const src = read("src/app/sitemap.ts");
    expect(src).toContain('"/tools"');
    expect(src).toContain("TOOLS");
    expect(src).toMatch(/absoluteUrl\(`\/tools\/\$\{t\.slug\}`\)/);
  });

  it("PRIMARY_NAV includes a Tools entry pointing at /tools", () => {
    expect(PRIMARY_NAV.some((i) => i.href === "/tools" && i.label === "Tools")).toBe(true);
  });

  it("the dynamic tool route declares generateStaticParams for all 5 tools (no orphaned/unreachable pages)", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    expect(src).toContain("export function generateStaticParams()");
    expect(src).toContain("TOOLS.map((t) => ({ slug: t.slug }))");
  });

  it("every LoadListCalculator-kind tool has a registered config in the page template", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    for (const t of TOOLS.filter((t) => t.calculatorKind === "load-list")) {
      expect(src, `${t.slug} missing from LOAD_LIST_CONFIGS`).toContain(`"${t.slug}":`);
    }
  });
});

describe("Do-not-modify scope: catalog and affiliate data are untouched by the /tools feature", () => {
  it("no /tools source file imports products.json directly (only via the shared @/data/products module) — a prose mention of the filename is fine", () => {
    const toolFiles = srcFiles.filter((f) => f.includes(`${join("src", "app", "tools")}`) || f.includes(`${join("src", "components", "tools")}`));
    for (const f of toolFiles) {
      expect(srcContents.get(f)!, f).not.toMatch(/(?:import|require)\s*\(?\s*["'][^"']*products\.json["']/);
    }
  });

  it("no /tools source file references amazon_product_url as a CTA source (only the shared AmazonCta/RecommendationCard path is used)", () => {
    const toolFiles = srcFiles.filter((f) => f.includes(`${join("src", "app", "tools")}`) || f.includes(`${join("src", "components", "tools")}`));
    for (const f of toolFiles) {
      expect(srcContents.get(f)!, f).not.toContain("amazon_product_url");
    }
  });
});

describe("Accessibility basics: every interactive input in the shared tool UI has an accessible name", () => {
  const uiFiles = [
    "src/components/tools/LoadListCalculator.tsx",
    "src/components/tools/CpapCalculator.tsx",
    "src/components/tools/StarlinkCalculator.tsx",
  ];

  /**
   * Linear scan tracking whether we're currently nested inside a JSX
   * <label>...</label> (implicit accessible name — valid without
   * aria-label). Every <input>/<select> encountered must either be inside
   * that nesting, or carry its own aria-label — a bare, unlabelled control
   * is the failure this guards against.
   */
  function checkAccessibleNames(src: string): string[] {
    const offenders: string[] = [];
    // `(?:=>|[^>])*` lets a JSX arrow function inside an attribute value
    // (`onChange={(e) => ...}`) pass through without prematurely closing the
    // tag match at its `>` character.
    const tagPattern = /<label\b(?:=>|[^>])*>|<\/label>|<(input|select)\b(?:=>|[^>])*\/?>/g;
    let labelDepth = 0;
    for (const m of src.matchAll(tagPattern)) {
      const tag = m[0];
      if (tag.startsWith("</label>")) {
        labelDepth = Math.max(0, labelDepth - 1);
      } else if (tag.startsWith("<label")) {
        labelDepth += 1;
      } else {
        const hasAriaLabel = /aria-label=/.test(tag);
        const idMatch = tag.match(/\bid="([^"]+)"/);
        const hasMatchingHtmlFor = idMatch != null && src.includes(`htmlFor="${idMatch[1]}"`);
        if (labelDepth === 0 && !hasAriaLabel && !hasMatchingHtmlFor) offenders.push(tag);
      }
    }
    return offenders;
  }

  it("every <input>/<select> is either nested in a <label> or carries its own aria-label", () => {
    for (const file of uiFiles) {
      const src = read(file);
      const controlCount = [...src.matchAll(/<(input|select)\b[^>]*>/g)].length;
      expect(controlCount, `${file} should render form controls`).toBeGreaterThan(0);
      const offenders = checkAccessibleNames(src);
      expect(offenders, `${file}: unlabelled controls: ${offenders.join(" | ")}`).toEqual([]);
    }
  });
});

/**
 * 2026-09-13 integration: the shared tool template (src/app/tools/[slug]/page.tsx)
 * now carries a visible Bilal Siali byline and JSON-LD Person authorship,
 * matching the pattern already established on guides and /compare/[slug].
 * These 5 editorial tool pages (refrigerator/CPAP/RV/home-backup/Starlink)
 * are content pages with sections, FAQ and sources — not a bare interactive
 * picker like /tools or /compare, which correctly stay unattributed.
 */
describe("Tool pages: visible Bilal Siali byline (matches guides/compare pattern)", () => {
  const templateSrc = read("src/app/tools/[slug]/page.tsx");

  it("imports the canonical author object rather than duplicating author fields", () => {
    expect(templateSrc).toContain('from "@/lib/authors"');
    expect(templateSrc).not.toContain('"Bilal Siali"');
  });

  it("renders 'By Bilal Siali' sourced from BILAL_SIALI, linked to the canonical author path", () => {
    expect(templateSrc).toContain("By{\" \"}");
    expect(templateSrc).toContain("{BILAL_SIALI.name}");
    expect(templateSrc).toContain("href={BILAL_SIALI.path}");
  });

  it("the byline appears exactly once in the shared template", () => {
    const matches = templateSrc.match(/href=\{BILAL_SIALI\.path\}/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  it("reuses the tool's own real lastUpdated date — no invented or 'today' date", () => {
    expect(templateSrc).toContain("fmtDate(tool.lastUpdated)");
    expect(templateSrc).not.toContain("new Date()");
    expect(templateSrc).not.toContain("Date.now()");
  });

  it("passes the same author into the route's articleJsonLd (Person, not the default Organization)", () => {
    expect(templateSrc).toContain("author: { name: BILAL_SIALI.name, path: BILAL_SIALI.path }");
  });

  it("the interactive /tools hub still carries no byline (it is a picker, not an article)", () => {
    const hubSrc = read("src/app/tools/page.tsx");
    expect(hubSrc).not.toContain("BILAL_SIALI");
  });

  it("every tool's own lastUpdated field is a real ISO date (no invented 'reviewed today')", () => {
    for (const t of TOOLS) {
      expect(t.lastUpdated, `${t.slug} missing lastUpdated`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("Tool pages: optional related-comparison link resolves to a real, approved comparison", () => {
  it("every relatedComparisonSlug (when set) resolves to a real comparison", () => {
    for (const t of TOOLS) {
      if (t.relatedComparisonSlug === undefined) continue;
      expect(
        getComparison(t.relatedComparisonSlug),
        `${t.slug} links to nonexistent comparison "${t.relatedComparisonSlug}"`,
      ).toBeDefined();
    }
  });

  it("the refrigerator tool links a refrigerator-relevant comparison", () => {
    const tool = getTool("refrigerator-runtime-calculator")!;
    expect(tool.relatedComparisonSlug).toBeDefined();
    const comparison = getComparison(tool.relatedComparisonSlug!)!;
    expect(comparison.relatedBestForSlugs).toContain("best-for-refrigerator-backup");
  });

  it("the template renders the related-comparison link only when the field is set", () => {
    const templateSrc = read("src/app/tools/[slug]/page.tsx");
    expect(templateSrc).toContain("relatedComparison");
    expect(templateSrc).toContain("/compare/${relatedComparison.slug}");
  });

  it("does not duplicate any comparison's editorial fields into content/tools.ts (slug reference only)", () => {
    const src = read("src/content/tools.ts");
    for (const c of COMPARISONS) {
      expect(src).not.toContain(c.h1);
    }
  });
});

/**
 * Real mobile-overflow regression found during the 2026-09-13 integration
 * audit, pre-existing in PR #44's own Runtime Index feature (confirmed via
 * `git diff` against the original commit — untouched by the main-branch
 * merge). Root cause: a sr-only <span> (Tailwind's `position: absolute`
 * visually-hidden technique) sits in the LAST <th> of a wide table. Its
 * absolute "static position" is computed from the table's full intrinsic
 * width (up to 760px), and with no positioned ancestor between it and the
 * document root, it escapes the table's own overflow-x-auto scroll box —
 * invisible, but it still widens document.documentElement.scrollWidth on a
 * narrow viewport, the same failure mode the compare-page spec table was
 * fixed for previously. The page-level overflow-x-hidden safety net in
 * layout.tsx masks it as "no visible scrollbar" without containing it, so
 * `document.body.scrollWidth` alone would have missed this — only
 * `document.documentElement.scrollWidth` catches it.
 * Fix: `relative` on the overflow-x-auto wrapper makes it the containing
 * block for that sr-only span, keeping it inside the same scroll box.
 */
describe("Tool pages: wide-table sr-only span no longer escapes its scroll container (mobile overflow fix)", () => {
  it("LoadListCalculator's load-list table wrapper is a positioned containing block", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    expect(src).toContain('className="relative mt-4 overflow-x-auto"');
  });

  it("RuntimeIndexTable's results table wrapper is a positioned containing block", () => {
    const src = read("src/components/tools/RuntimeIndexTable.tsx");
    expect(src).toContain('className="relative mt-3 overflow-x-auto rounded-lg border border-navy-700"');
  });

  it("both wrappers still scroll horizontally rather than being clipped or reflowed", () => {
    const loadListSrc = read("src/components/tools/LoadListCalculator.tsx");
    const runtimeIndexSrc = read("src/components/tools/RuntimeIndexTable.tsx");
    expect(loadListSrc).toContain("overflow-x-auto");
    expect(runtimeIndexSrc).toContain("overflow-x-auto");
  });
});
