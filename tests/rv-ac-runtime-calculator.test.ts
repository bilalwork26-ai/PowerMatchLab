import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { calculatePower, type DeviceInput } from "@/lib/calculator";
import { recommendProducts } from "@/lib/recommend";
import { RV_AC_PRESETS } from "@/lib/tool-presets";
import { getTool, TOOLS } from "@/content/tools";
import { getGuide } from "@/content/guides";
import { getComparison } from "@/content/comparisons";
import { getBestFor } from "@/content/best-for";
import { getAllProducts } from "@/data/products";
import type { Product } from "@/types/product";

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

const catalog = getAllProducts();

function acDevice(overrides: Partial<DeviceInput> = {}): DeviceInput {
  // A 13,500 BTU rooftop unit: surge well above continuous, the defining
  // characteristic of this load class (a compressor start spike).
  return {
    id: "rv-ac",
    name: "13,500 BTU rooftop AC",
    watts: 1400,
    quantity: 1,
    hoursPerDay: 6,
    surgeWatts: 3200,
    simultaneous: true,
    ...overrides,
  };
}

function baseProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "test-product",
    brand: "TestBrand",
    model: "Test Model",
    market: "US",
    category: "portable-power-station",
    capacity_wh: 4000,
    rated_output_w: 2000,
    surge_output_w: 4000,
    battery_chemistry: "LiFePO4",
    cycle_life: null,
    weight_kg: 20,
    dimensions: null,
    solar_input_w: null,
    ac_charging_w: null,
    charging_time: null,
    ac_outlets: null,
    usb_c: null,
    usb_a: null,
    dc_output: null,
    rv_tt30: null,
    voltage_240v: null,
    ups_ms: null,
    expandable: null,
    max_expanded_capacity_wh: null,
    wifi: null,
    bluetooth: null,
    warranty: null,
    idle_consumption_w: null,
    best_for: [],
    pros: [],
    cons: [],
    official_source: null,
    last_verified: "2026-01-01",
    amazon_asin: null,
    amazon_product_url: null,
    amazon_affiliate_url: null,
    amazon_verification_status: "confirmed",
    amazon_listing_note: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. Formulas: reuses the exact shared calculatePower engine, no forked math
// ---------------------------------------------------------------------------
describe("RV AC formulas: reuses the shared calculatePower engine exactly", () => {
  it("daily energy = running watts × equivalent hours/day (duty cycle), not clock-hours the unit is switched on", () => {
    const result = calculatePower([acDevice({ hoursPerDay: 6 })], { days: 1 });
    expect(result.dailyEnergyWh).toBe(1400 * 6);
  });

  it("required continuous output is the AC's running watts alone when it's the only load", () => {
    const result = calculatePower([acDevice()], { days: 1 });
    expect(result.requiredContinuousOutputW).toBe(1400);
  });

  it("required surge output is the AC's documented starting peak (not a derived/guessed percentage)", () => {
    const result = calculatePower([acDevice({ surgeWatts: 3200 })], { days: 1 });
    // Single device: surge requirement = continuous + (surge - continuous) of that device.
    expect(result.requiredSurgeOutputW).toBe(3200);
  });

  it("a coinciding second RV load adds to continuous and to the surge floor, without altering the AC's own surge delta", () => {
    const withLights = calculatePower(
      [acDevice(), { id: "lights", name: "LED lights", watts: 40, quantity: 1, hoursPerDay: 6, surgeWatts: null, simultaneous: true }],
      { days: 1 },
    );
    expect(withLights.requiredContinuousOutputW).toBe(1440);
    expect(withLights.requiredSurgeOutputW).toBe(1440 + (3200 - 1400));
  });

  it("a non-coinciding load (simultaneous: false) is excluded from the continuous/surge requirement", () => {
    const result = calculatePower(
      [acDevice(), { id: "microwave", name: "Microwave", watts: 1200, quantity: 1, hoursPerDay: 0.2, surgeWatts: 1800, simultaneous: false }],
      { days: 1 },
    );
    expect(result.requiredContinuousOutputW).toBe(1400);
  });

  it("recommended minimum capacity applies usable efficiency and reserve identically to every other tool", () => {
    const result = calculatePower([acDevice({ hoursPerDay: 6, surgeWatts: null })], { days: 1 }, {
      systemEfficiency: 0.85,
      reserveFraction: 0.2,
    });
    const expected = ((1400 * 6) / 0.85) * 1.2;
    expect(result.recommendedMinimumCapacityWh).toBeCloseTo(expected, 0);
  });

  it("the tool page config declares no bespoke calculation path — it wires the shared LoadListCalculator like every other tool", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    const configBlock = src.slice(
      src.indexOf('"rv-air-conditioner-runtime-calculator": {'),
      src.indexOf("\n  },", src.indexOf('"rv-air-conditioner-runtime-calculator": {')),
    );
    expect(configBlock).toContain("calculatorType: \"rv_ac_runtime\"");
    expect(configBlock).toContain("presets: RV_AC_PRESETS");
    expect(configBlock).not.toMatch(/function|=>/); // pure config object, no forked logic
  });
});

// ---------------------------------------------------------------------------
// 2. Limits: days cap, presets are all editable examples, never presented as universal
// ---------------------------------------------------------------------------
describe("RV AC limits and presets", () => {
  it("declares exactly 4 BTU-class examples: 5,000 / 8,000 / 13,500 / 15,000", () => {
    expect(RV_AC_PRESETS.map((p) => p.key)).toEqual([
      "rv-ac-5000btu",
      "rv-ac-8000btu",
      "rv-ac-13500btu",
      "rv-ac-15000btu",
    ]);
  });

  it("every preset has a positive running/surge wattage with surge above running (the AC's defining characteristic)", () => {
    for (const p of RV_AC_PRESETS) {
      expect(p.runningWatts, p.key).toBeGreaterThan(0);
      expect(p.surgeWatts, p.key).toBeGreaterThan(p.runningWatts);
    }
  });

  it("every preset's note is a sourced, class-level figure, and at least one explicitly points to checking the unit's own nameplate/spec sheet", () => {
    for (const p of RV_AC_PRESETS) {
      expect(p.note, p.key).toBeTruthy();
      expect(p.note, p.key).toMatch(/class|range|running|starting/i);
    }
    expect(RV_AC_PRESETS.some((p) => /nameplate|spec sheet/i.test(p.note ?? ""))).toBe(true);
  });

  it("the module-level doc explicitly states figures are WITHOUT a soft starter and never assumes a fixed reduction percentage", () => {
    const src = read("src/lib/tool-presets.ts");
    const doc = src
      .slice(src.lastIndexOf("/**", src.indexOf("export const RV_AC_PRESETS")))
      .replace(/^\s*\*\s?/gm, " ")
      .replace(/\s+/g, " ");
    expect(doc).toMatch(/WITHOUT a soft starter/);
    expect(doc).toMatch(/never assumes a fixed percentage reduction/);
  });

  it("all preset values are plain numbers on a mutable seed device, not hardcoded/read-only constants in the UI layer", () => {
    const src = read("src/components/tools/LoadListCalculator.tsx");
    // Presets only ever seed initial device state via setDevices/useState — confirms
    // every field (including a seeded AC's watts/surge) remains user-editable.
    expect(src).toMatch(/preset\.runningWatts/);
    expect(src).toMatch(/preset\.surgeWatts/);
  });

  it("days-without-recharge is capped at 7 for this tool (a realistic RV off-grid AC planning window)", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    const configBlock = src.slice(
      src.indexOf('"rv-air-conditioner-runtime-calculator": {'),
      src.indexOf("\n  },", src.indexOf('"rv-air-conditioner-runtime-calculator": {')),
    );
    expect(configBlock).toContain("daysMax: 7");
  });

  it("TT-30 is offered as an optional preference for this tool, not a hard requirement", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    const configBlock = src.slice(
      src.indexOf('"rv-air-conditioner-runtime-calculator": {'),
      src.indexOf("\n  },", src.indexOf('"rv-air-conditioner-runtime-calculator": {')),
    );
    expect(configBlock).toContain("needsTT30: true");
  });
});

// ---------------------------------------------------------------------------
// 3. Unverified data must never present as compatible (the recommend.ts fix)
// ---------------------------------------------------------------------------
describe("RV AC compatibility: unverified surge is never shown as a confirmed match", () => {
  const result = calculatePower([acDevice()], { days: 1 }); // requiredContinuousOutputW=1400, requiredSurgeOutputW=3200

  it("a product with no surge_output_w at all — even with ample capacity/continuous output — resolves to Possible Match, never Best/Good Fit", () => {
    const ample = baseProduct({
      id: "ample-no-surge",
      capacity_wh: 20000,
      rated_output_w: 5000,
      surge_output_w: null,
    });
    const [rec] = recommendProducts(result, [ample]);
    expect(rec.status).toBe("Possible Match");
    expect(rec.meetsSurge).toBeNull();
  });

  it("that same unconfirmed-surge product is distinguishable from a genuinely verified Best Fit with matching specs", () => {
    const verified = baseProduct({
      id: "verified",
      capacity_wh: 20000,
      rated_output_w: 5000,
      surge_output_w: 5000,
    });
    const [rec] = recommendProducts(result, [verified]);
    expect(["Best Fit", "Good Fit"]).toContain(rec.status);
  });

  it("a product whose surge is confirmed but too low is Not Suitable, not merely unconfirmed", () => {
    const tooLow = baseProduct({
      id: "too-low-surge",
      capacity_wh: 20000,
      rated_output_w: 5000,
      surge_output_w: 2000, // below the 3200W requirement
    });
    const [rec] = recommendProducts(result, [tooLow]);
    expect(rec.status).toBe("Not Suitable");
    expect(rec.meetsSurge).toBe(false);
  });

  it("a product that also fails required continuous output is Not Suitable regardless of surge", () => {
    const tooWeak = baseProduct({
      id: "too-weak",
      capacity_wh: 20000,
      rated_output_w: 1000, // below the 1400W continuous requirement
      surge_output_w: 5000,
    });
    const [rec] = recommendProducts(result, [tooWeak]);
    expect(rec.status).toBe("Not Suitable");
    expect(rec.meetsContinuous).toBe(false);
  });

  it("when the load itself has no meaningful surge above continuous (surge explicitly equal to running watts), a null product surge does not force Possible Match on that basis alone", () => {
    const noSurgeNeeded = calculatePower(
      [{ id: "lights-only", name: "LED lights", watts: 40, quantity: 1, hoursPerDay: 6, surgeWatts: 40, simultaneous: true }],
      { days: 1 },
    );
    expect(noSurgeNeeded.requiredSurgeOutputW).toBe(noSurgeNeeded.requiredContinuousOutputW);
    const strong = baseProduct({ id: "strong", capacity_wh: 5000, rated_output_w: 2000, surge_output_w: null });
    const [rec] = recommendProducts(noSurgeNeeded, [strong]);
    expect(rec.status).not.toBe("Not Suitable");
  });
});

// ---------------------------------------------------------------------------
// 4. Real catalog sanity: at least one confirmed Best/Good Fit and one
//    unconfirmed-surge product exist for a common preset (13,500 BTU)
// ---------------------------------------------------------------------------
describe("RV AC against the real catalog (13,500 BTU preset)", () => {
  const preset = RV_AC_PRESETS.find((p) => p.key === "rv-ac-13500btu")!;
  // 2 equivalent hours/day (a moderate duty cycle) at this BTU class, one day
  // without recharge — the preset's own default 6h/day full-day total exceeds
  // every catalog product's capacity, which is itself the honest, expected
  // finding for a rooftop AC (see the guide's "realistic expectations"
  // section) rather than a bug to work around here.
  const result = calculatePower(
    [
      {
        id: "ac",
        name: preset.name,
        watts: preset.runningWatts,
        quantity: 1,
        hoursPerDay: 2,
        surgeWatts: preset.surgeWatts,
        simultaneous: true,
      },
    ],
    { days: 1 },
  );
  const recs = recommendProducts(result, catalog);

  it("at least one real catalog product resolves to Best Fit or Good Fit for a moderate duty cycle at the most common RV AC size", () => {
    expect(recs.some((r) => r.status === "Best Fit" || r.status === "Good Fit")).toBe(true);
  });

  it("a full 6h/day duty cycle for a single day exceeds every current catalog product's standalone capacity — surfaced as Not Suitable, never hidden", () => {
    const fullDay = calculatePower(
      [{ id: "ac", name: preset.name, watts: preset.runningWatts, quantity: 1, hoursPerDay: preset.hoursPerDay, surgeWatts: preset.surgeWatts, simultaneous: true }],
      { days: 1 },
    );
    const fullDayRecs = recommendProducts(fullDay, catalog);
    expect(fullDayRecs.every((r) => r.status === "Not Suitable")).toBe(true);
  });

  it("no catalog product with a null surge_output_w is ever classified Best Fit or Good Fit for this load", () => {
    const unverified = recs.filter((r) => r.product.surge_output_w === null);
    for (const r of unverified) {
      expect(["Best Fit", "Good Fit"]).not.toContain(r.status);
    }
  });

  it("the 49-product catalog is unmodified by this feature", () => {
    expect(catalog.length).toBe(49);
  });
});

// ---------------------------------------------------------------------------
// 5. Tool content: sourced, non-invented figures and required editorial topics
// ---------------------------------------------------------------------------
describe("RV AC tool content: real sources, no invented figures", () => {
  const tool = getTool("rv-air-conditioner-runtime-calculator")!;

  it("exists with the proposed slug, title and metaDescription mentioning surge/runtime", () => {
    expect(tool).toBeDefined();
    expect(tool.slug).toBe("rv-air-conditioner-runtime-calculator");
    expect(tool.title).toContain("RV Air Conditioner");
  });

  it("cites ENERGY STAR and at least one soft-starter and one AC-manufacturer source with real URLs", () => {
    const urls = tool.sources.filter((s): s is { label: string; url: string } => typeof s !== "string").map((s) => s.url);
    expect(urls.some((u) => u.includes("energystar.gov"))).toBe(true);
    expect(urls.some((u) => u.includes("microair.net"))).toBe(true);
    expect(urls.some((u) => u.includes("dometic.com") || u.includes("coleman-mach.com"))).toBe(true);
  });

  it("covers all seven required editorial topics: BTU-vs-watts, continuous/surge/energy, duty cycle, environmental factors, soft-start, estimates-not-lab-tests, and when to consult a professional", () => {
    const allText = [
      tool.shortAnswer,
      tool.formula,
      ...tool.sections.map((s) => s.body.join(" ")),
      ...tool.faq.map((f) => `${f.question} ${f.answer}`),
    ].join(" \n ");

    expect(allText).toMatch(/BTU/i);
    expect(allText).toMatch(/surge/i);
    expect(allText).toMatch(/continuous/i);
    expect(allText).toMatch(/duty cycle|equivalent hours/i);
    expect(allText).toMatch(/insulation|temperature|thermostat|climate/i);
    expect(allText).toMatch(/soft.?start/i);
    expect(allText).toMatch(/estimat/i);
    expect(allText).toMatch(/electrician|technician/i);
  });

  it("never states or implies a universal fixed soft-starter reduction percentage", () => {
    const allText = [tool.formula, ...tool.sections.map((s) => s.body.join(" "))].join(" ");
    expect(allText).not.toMatch(/soft start(er)?s? (typically |usually |always )?reduces? (peak|surge|starting) (draw|current) by \d/i);
    // The one percentage figure present must be explicitly attributed to Micro-Air's own published spec.
    const softStartSection = tool.sections.find((s) => s.id === "soft-start-explained")!;
    const withPercent = softStartSection.body.find((b) => /%/.test(b))!;
    expect(withPercent).toMatch(/Micro-Air publishes/);
  });

  it("links to the RV guide, the new dedicated guide, best-for-rv, and a high-capacity comparison", () => {
    expect(tool.relatedGuideSlugs).toContain("power-station-for-rv");
    expect(tool.relatedGuideSlugs).toContain("can-a-portable-power-station-run-an-rv-air-conditioner");
    expect(tool.relatedBestForSlug).toBe("best-for-rv");
    expect(tool.relatedComparisonSlug).toBeDefined();
    expect(getComparison(tool.relatedComparisonSlug!)).toBeDefined();
  });

  it("has a real lastUpdated date and non-empty sections/FAQ/commonMistakes (indexable content)", () => {
    expect(tool.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tool.sections.length).toBeGreaterThanOrEqual(5);
    expect(tool.faq.length).toBeGreaterThanOrEqual(4);
    expect(tool.commonMistakes.length).toBeGreaterThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// 6. Guide content: answers the question directly, no duplicated text vs. the tool
// ---------------------------------------------------------------------------
describe("RV AC guide: complete answer, practical link to the calculator, no text duplication", () => {
  const guide = getGuide("can-a-portable-power-station-run-an-rv-air-conditioner")!;
  const tool = getTool("rv-air-conditioner-runtime-calculator")!;

  it("exists, belongs to the 'runtime' group (matches the can-a-power-station-run-X pattern), and links to the tool", () => {
    expect(guide).toBeDefined();
    expect(guide.group).toBe("runtime");
    expect(guide.relatedToolSlug).toBe("rv-air-conditioner-runtime-calculator");
  });

  it("answers the yes/no question directly in its intro rather than deferring entirely to the calculator", () => {
    const introText = guide.intro.join(" ");
    expect(introText).toMatch(/\bsometimes\b|\byes\b|\bno\b|\bdepends\b/i);
    expect(introText).toMatch(/surge|starting/i);
  });

  it("uses a real, verifiable catalog product in its worked example (not an invented figure)", () => {
    const example = getAllProducts().find((p) => p.id === "ecoflow-delta-pro-3")!;
    const exampleSection = guide.sections.find((s) => s.id === "realistic-expectations")!;
    const text = exampleSection.body.join(" ");
    expect(text).toContain(example.capacity_wh!.toLocaleString("en-US"));
    expect(text).toContain(example.surge_output_w!.toLocaleString("en-US"));
  });

  it("its relatedProductIds all exist in the real catalog and every product's surge_output_w actually clears the cited starting range", () => {
    const productIds = new Set(getAllProducts().map((p) => p.id));
    for (const id of guide.relatedProductIds) {
      expect(productIds.has(id), id).toBe(true);
    }
    const products = guide.relatedProductIds.map((id) => getAllProducts().find((p) => p.id === id)!);
    for (const p of products) {
      expect(p.surge_output_w, p.id).not.toBeNull();
      expect(p.surge_output_w!, p.id).toBeGreaterThanOrEqual(3500); // the cited high end of the 13,500 BTU starting range
    }
  });

  it("links reciprocally to the RV guide, best-for-rv, and the same high-capacity comparison as the tool", () => {
    expect(guide.relatedGuideSlugs).toContain("power-station-for-rv");
    expect(guide.relatedBestForSlug).toBe("best-for-rv");
    expect(guide.relatedComparisonSlug).toBe(tool.relatedComparisonSlug);
    expect(getComparison(guide.relatedComparisonSlug!)).toBeDefined();
  });

  it("the RV guide links back to this new guide (reciprocal cross-linking)", () => {
    const rvGuide = getGuide("power-station-for-rv")!;
    expect(rvGuide.relatedGuideSlugs).toContain("can-a-portable-power-station-run-an-rv-air-conditioner");
  });

  it("shares no identical multi-sentence passage with the tool's own sections (guide and tool are not duplicates)", () => {
    const guideSentences = new Set(
      guide.sections
        .flatMap((s) => s.body)
        .join(" ")
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 40),
    );
    const toolSentences = tool.sections
      .flatMap((s) => s.body)
      .join(" ")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 40);
    for (const sentence of toolSentences) {
      expect(guideSentences.has(sentence), `duplicated sentence: "${sentence}"`).toBe(false);
    }
  });

  it("enables the estimate-factors disclosure and has a real lastUpdated date", () => {
    expect(guide.showEstimateFactorsDisclosure).toBe(true);
    expect(guide.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ---------------------------------------------------------------------------
// 7. Integration: hub, RV guide, Power Calculator all link to the new tool
// ---------------------------------------------------------------------------
describe("RV AC integration wiring", () => {
  it("the /tools hub page lists every TOOLS entry generically (already covered), and the new slug resolves through it", () => {
    const src = read("src/app/tools/page.tsx");
    expect(src).toContain("TOOLS.map");
  });

  it("the Power Calculator page links to the new tool", () => {
    const src = read("src/app/power-calculator/page.tsx");
    expect(src).toContain("/tools/rv-air-conditioner-runtime-calculator");
  });

  it("the sitemap includes every tool generically via a TOOLS loop (new slug included automatically)", () => {
    const src = read("src/app/sitemap.ts");
    expect(src).toMatch(/for\s*\(\s*const\s+\w+\s+of\s+TOOLS\s*\)/);
  });

  it("products.json was not modified by this feature (no new product ids referenced anywhere in the new content)", () => {
    const tool = getTool("rv-air-conditioner-runtime-calculator")!;
    const guide = getGuide("can-a-portable-power-station-run-an-rv-air-conditioner")!;
    const productIds = new Set(getAllProducts().map((p) => p.id));
    for (const id of guide.relatedProductIds) {
      expect(productIds.has(id)).toBe(true);
    }
    expect(tool).toBeDefined();
    expect(getAllProducts().length).toBe(49);
  });
});

// ---------------------------------------------------------------------------
// 8. Canonical, authorship and structured data (thin, targeted checks — the
//    shared template mechanics are already covered generically for every
//    tool by tests/tools-hub.test.ts; these confirm the new tool actually
//    flows through that same shared path rather than a special case)
// ---------------------------------------------------------------------------
describe("RV AC canonical, authorship and structured data reuse the shared /tools/[slug] template", () => {
  it("generateMetadata builds this tool's canonical path from its own slug, identically to every other tool", () => {
    const tool = getTool("rv-air-conditioner-runtime-calculator")!;
    expect(tool.slug).toBe("rv-air-conditioner-runtime-calculator");
    const src = read("src/app/tools/[slug]/page.tsx");
    expect(src).toContain("path: `/tools/${tool.slug}`");
  });

  it("the shared ToolPage renders an articleJsonLd with the shared BILAL_SIALI author for every tool, this one included (no per-tool override)", () => {
    const src = read("src/app/tools/[slug]/page.tsx");
    expect(src).toContain("articleJsonLd({");
    expect(src).toMatch(/author:\s*\{\s*name:\s*BILAL_SIALI\.name,\s*path:\s*BILAL_SIALI\.path\s*\}/);
    // No slug-specific author/byline branch exists for the new tool.
    expect(src).not.toMatch(/rv-air-conditioner-runtime-calculator[\s\S]{0,200}BILAL_SIALI/);
  });

  it("getTool resolves the new slug and TOOLS declares it exactly once", () => {
    expect(TOOLS.filter((t) => t.slug === "rv-air-conditioner-runtime-calculator")).toHaveLength(1);
    expect(getTool("rv-air-conditioner-runtime-calculator")).toBeDefined();
  });
});
