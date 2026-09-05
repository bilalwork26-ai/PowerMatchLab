import { describe, expect, it } from "vitest";
import { GUIDES, getGuide } from "@/content/guides";
import { BEST_FOR, getBestFor } from "@/content/best-for";
import { getAllProducts } from "@/data/products";

const catalog = getAllProducts();
const productIds = new Set(catalog.map((p) => p.id));
const guideSlugs = new Set(GUIDES.map((g) => g.slug));
const bestForSlugs = new Set(BEST_FOR.map((b) => b.slug));

describe("guide cross-link integrity", () => {
  it("every guide's relatedGuideSlugs references a guide that actually exists", () => {
    for (const g of GUIDES) {
      for (const slug of g.relatedGuideSlugs ?? []) {
        expect(
          guideSlugs.has(slug),
          `Guide "${g.slug}" relatedGuideSlugs references nonexistent guide "${slug}"`,
        ).toBe(true);
      }
    }
  });

  it("every guide's relatedProductIds references a product in the current catalog", () => {
    for (const g of GUIDES) {
      for (const pid of g.relatedProductIds) {
        expect(
          productIds.has(pid),
          `Guide "${g.slug}" relatedProductIds references nonexistent product "${pid}"`,
        ).toBe(true);
      }
    }
  });

  it("every guide's relatedBestForSlug (when set) references a best-for page that actually exists", () => {
    for (const g of GUIDES) {
      if (!g.relatedBestForSlug) continue;
      expect(
        bestForSlugs.has(g.relatedBestForSlug),
        `Guide "${g.slug}" relatedBestForSlug references nonexistent best-for page "${g.relatedBestForSlug}"`,
      ).toBe(true);
      // getBestFor must resolve it too, for the guide page template's own lookup.
      expect(getBestFor(g.relatedBestForSlug)).toBeDefined();
    }
  });

  it("every guide's studioLinkLabel (when set) is non-empty text, never a URL or scenario param", () => {
    for (const g of GUIDES) {
      if (g.studioLinkLabel === undefined) continue;
      expect(g.studioLinkLabel.length).toBeGreaterThan(0);
      expect(g.studioLinkLabel).not.toMatch(/^https?:\/\//);
      expect(g.studioLinkLabel).not.toContain("?");
    }
  });
});

describe("best-for cross-link integrity", () => {
  it("every best-for page's relatedGuideSlugs references a guide that actually exists", () => {
    for (const b of BEST_FOR) {
      for (const slug of b.relatedGuideSlugs ?? []) {
        expect(
          guideSlugs.has(slug),
          `Best-for page "${b.slug}" relatedGuideSlugs references nonexistent guide "${slug}"`,
        ).toBe(true);
        expect(getGuide(slug)).toBeDefined();
      }
    }
  });

  it("every best-for page's studioLinkLabel (when set) is non-empty text, never a URL or scenario param", () => {
    for (const b of BEST_FOR) {
      if (b.studioLinkLabel === undefined) continue;
      expect(b.studioLinkLabel.length).toBeGreaterThan(0);
      expect(b.studioLinkLabel).not.toMatch(/^https?:\/\//);
      expect(b.studioLinkLabel).not.toContain("?");
    }
  });

  it("the new optional fields are absent on pages that were not part of this round (e.g. home-backup), and the page still resolves cleanly", () => {
    const homeBackup = getBestFor("best-for-home-backup");
    expect(homeBackup).toBeDefined();
    expect(homeBackup!.relatedGuideSlugs).toBeUndefined();
    expect(homeBackup!.studioLinkLabel).toBeUndefined();
  });

  it("populates the three authorized pages (camping, rv, refrigerator-backup) with at least one related guide and a Studio link", () => {
    for (const slug of ["best-for-camping", "best-for-rv", "best-for-refrigerator-backup"]) {
      const b = getBestFor(slug)!;
      expect(b, `"${slug}" should exist`).toBeDefined();
      expect(
        (b.relatedGuideSlugs ?? []).length,
        `"${slug}" should have at least one related guide`,
      ).toBeGreaterThan(0);
      expect(b.studioLinkLabel, `"${slug}" should have a Studio link label`).toBeTruthy();
    }
  });
});

describe("this round's specific link requirements", () => {
  it("both refrigerator guides link to each other, watts-vs-watt-hours, power-outage, best-for-refrigerator-backup, and Power Setup Studio", () => {
    const canRun = getGuide("can-a-power-station-run-a-refrigerator")!;
    const sizing = getGuide("power-station-for-refrigerator")!;

    expect(canRun.relatedGuideSlugs).toContain("power-station-for-refrigerator");
    expect(canRun.relatedBestForSlug).toBe("best-for-refrigerator-backup");
    expect(canRun.studioLinkLabel).toBeTruthy();

    expect(sizing.relatedGuideSlugs).toContain("can-a-power-station-run-a-refrigerator");
    expect(sizing.relatedGuideSlugs).toContain("watts-vs-watt-hours");
    expect(sizing.relatedGuideSlugs).toContain("power-station-for-power-outage");
    expect(sizing.relatedBestForSlug).toBe("best-for-refrigerator-backup");
    expect(sizing.studioLinkLabel).toBeTruthy();
  });

  it("the camping guide and best-for-camping link to each other and to Power Setup Studio", () => {
    const guide = getGuide("power-station-for-camping")!;
    const bestFor = getBestFor("best-for-camping")!;

    expect(guide.relatedBestForSlug).toBe("best-for-camping");
    expect(guide.studioLinkLabel).toBeTruthy();
    expect(bestFor.relatedGuideSlugs).toContain("power-station-for-camping");
    expect(bestFor.studioLinkLabel).toBeTruthy();
  });

  it("the RV guide and best-for-rv link to each other, to the van-life guide, and to Power Setup Studio", () => {
    const guide = getGuide("power-station-for-rv")!;
    const vanLifeGuide = getGuide("power-stations-for-remote-work-and-van-life")!;
    const bestFor = getBestFor("best-for-rv")!;

    expect(guide.relatedBestForSlug).toBe("best-for-rv");
    expect(guide.studioLinkLabel).toBeTruthy();
    expect(bestFor.relatedGuideSlugs).toContain("power-station-for-rv");
    expect(bestFor.relatedGuideSlugs).toContain("power-stations-for-remote-work-and-van-life");
    expect(bestFor.studioLinkLabel).toBeTruthy();
    expect(vanLifeGuide.relatedBestForSlug).toBe("best-for-rv");
    expect(vanLifeGuide.studioLinkLabel).toBeTruthy();
  });

  it("mentions 'camper' at least once in the RV guide and best-for-rv, without repeating it excessively", () => {
    const guide = getGuide("power-station-for-rv")!;
    const bestFor = getBestFor("best-for-rv")!;

    const guideText = [guide.intro.join(" "), ...guide.sections.map((s) => s.body.join(" "))].join(
      " ",
    );
    const bestForText = [bestFor.intro.join(" ")].join(" ");

    const countMatches = (text: string) => (text.match(/camper/gi) ?? []).length;

    expect(countMatches(guideText)).toBeGreaterThanOrEqual(1);
    expect(countMatches(guideText)).toBeLessThanOrEqual(2);
    expect(countMatches(bestForText)).toBeGreaterThanOrEqual(1);
    expect(countMatches(bestForText)).toBeLessThanOrEqual(2);
  });

  it("never links Power Setup Studio with a query string or scenario parameter", () => {
    for (const g of GUIDES) {
      if (g.studioLinkLabel !== undefined) {
        // The template always renders a bare href="/power-setup-studio" —
        // this guards the label text itself never smuggling in a URL/param.
        expect(g.studioLinkLabel).not.toMatch(/power-setup-studio\?/);
      }
    }
    for (const b of BEST_FOR) {
      if (b.studioLinkLabel !== undefined) {
        expect(b.studioLinkLabel).not.toMatch(/power-setup-studio\?/);
      }
    }
  });
});
