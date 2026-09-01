import type { Product, UseCaseKey } from "@/types/product";
import { getAllProducts } from "@/data/products";
import { scoreProduct, type ProductScore } from "./score";

/**
 * Dataset-derived product selection for Best-For pages.
 *
 * Deterministic ranking based only on verified fields. Products that clearly do
 * not fit are still listed at the bottom with a caveat rather than silently
 * dropped, so the page never implies a curated "we tested these" set.
 */

const USE_CASE_TAGS: Record<UseCaseKey, string[]> = {
  camping: ["camping", "day trips", "road trips", "outdoors", "light emergency"],
  rv: ["rv"],
  "refrigerator-backup": ["refrigerator", "freezer", "fridge"],
  "home-backup": ["home", "whole-home", "ups", "outage", "emergency home"],
};

export interface BestForEntry {
  product: Product;
  score: ProductScore;
  rank: number;
  tagMatch: boolean;
  highlights: string[];
  caveats: string[];
}

function tagMatches(product: Product, useCase: UseCaseKey): boolean {
  const wanted = USE_CASE_TAGS[useCase];
  return product.best_for.some((t) =>
    wanted.some((w) => t.toLowerCase().includes(w)),
  );
}

function useCaseWeight(product: Product, useCase: UseCaseKey): number {
  let w = 0;
  switch (useCase) {
    case "camping":
      if (product.weight_kg != null) w += Math.max(0, 40 - product.weight_kg * 1.6);
      if (product.idle_consumption_w != null)
        w += Math.max(0, 15 - product.idle_consumption_w);
      if (product.usb_c != null) w += product.usb_c * 3;
      if (product.capacity_wh != null)
        w += product.capacity_wh <= 1200 ? 10 : 0;
      break;
    case "rv":
      if (product.rv_tt30 === true) w += 30;
      if (product.rated_output_w != null) w += product.rated_output_w / 120;
      if (product.surge_output_w != null) w += product.surge_output_w / 400;
      if (product.expandable === true) w += 12;
      break;
    case "refrigerator-backup":
      if (product.surge_output_w != null) w += product.surge_output_w / 300;
      if (product.capacity_wh != null) w += product.capacity_wh / 120;
      if (product.idle_consumption_w != null)
        w += Math.max(0, 18 - product.idle_consumption_w * 1.5);
      if (product.solar_input_w != null) w += product.solar_input_w / 200;
      break;
    case "home-backup":
      if (product.ups_ms != null) w += Math.max(0, 25 - product.ups_ms);
      if (product.rated_output_w != null) w += product.rated_output_w / 120;
      if (product.capacity_wh != null) w += product.capacity_wh / 150;
      if (product.expandable === true) w += 15;
      if (product.voltage_240v === true) w += 10;
      break;
  }
  return w;
}

function highlightsFor(product: Product, useCase: UseCaseKey): string[] {
  const out: string[] = [];
  switch (useCase) {
    case "camping":
      if (product.weight_kg != null && product.weight_kg <= 6)
        out.push(`Only ${product.weight_kg.toFixed(1)} kg`);
      if (product.idle_consumption_w != null)
        out.push(`Idle draw ${product.idle_consumption_w} W (verified)`);
      if (product.usb_c) out.push(`${product.usb_c}× USB-C`);
      break;
    case "rv":
      if (product.rv_tt30 === true) out.push("Native TT-30 outlet");
      if (product.rated_output_w != null)
        out.push(`${product.rated_output_w} W continuous`);
      if (product.expandable === true) out.push("Expandable capacity");
      break;
    case "refrigerator-backup":
      if (product.surge_output_w != null)
        out.push(`${product.surge_output_w} W surge`);
      if (product.capacity_wh != null)
        out.push(`${product.capacity_wh.toLocaleString("en-US")} Wh`);
      if (product.solar_input_w != null)
        out.push(`${product.solar_input_w} W solar input`);
      break;
    case "home-backup":
      if (product.ups_ms != null) out.push(`${product.ups_ms} ms UPS`);
      if (product.voltage_240v === true) out.push("Native 120/240V");
      if (product.expandable === true) out.push("Expandable capacity");
      break;
  }
  return out;
}

function caveatsFor(product: Product, useCase: UseCaseKey): string[] {
  const out: string[] = [];
  if (useCase === "camping" && product.weight_kg != null && product.weight_kg >= 16) {
    out.push(`Heavy for carrying at ${product.weight_kg.toFixed(1)} kg`);
  }
  if (useCase === "rv" && product.rv_tt30 !== true) {
    out.push(
      product.rv_tt30 === false
        ? "No native TT-30 outlet"
        : "TT-30 outlet not verified",
    );
  }
  if (useCase === "home-backup" && product.voltage_240v !== true) {
    out.push(
      product.voltage_240v === false
        ? "No native 240V output"
        : "240V capability not verified",
    );
  }
  if (
    useCase === "refrigerator-backup" &&
    product.surge_output_w == null
  ) {
    out.push("Surge rating not verified");
  }
  return out;
}

export function selectBestFor(
  useCase: UseCaseKey,
  catalog: Product[] = getAllProducts(),
): BestForEntry[] {
  const entries = catalog.map((product) => {
    const tagMatch = tagMatches(product, useCase);
    const pmScore = scoreProduct(product, catalog);
    const baseline = pmScore.overall ?? 45;
    const weight = useCaseWeight(product, useCase) + baseline * 0.5;
    return {
      product,
      score: pmScore,
      weight,
      tagMatch,
      highlights: highlightsFor(product, useCase),
      caveats: caveatsFor(product, useCase),
    };
  });

  entries.sort((a, b) => {
    if (a.tagMatch !== b.tagMatch) return a.tagMatch ? -1 : 1;
    return b.weight - a.weight;
  });

  return entries.map((e, i) => ({
    product: e.product,
    score: e.score,
    rank: i + 1,
    tagMatch: e.tagMatch,
    highlights: e.highlights,
    caveats: e.caveats,
  }));
}
