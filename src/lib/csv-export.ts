/**
 * Client-side CSV builder for a calculator's Runtime Index table.
 *
 * Deliberately dependency-free (no CSV library) — this is one small,
 * well-tested string-building function, not something that needs a package.
 * Every value comes from already-computed `Recommendation`s (see
 * lib/recommend.ts) or the calculation summary the visitor entered — never
 * a manual price, invented spec, or fabricated review.
 */

import type { Recommendation } from "./recommend";
import { NOT_VERIFIED } from "./format";

/** RFC 4180-ish escaping: wrap in quotes and double any embedded quote whenever the field contains a comma, quote, or newline. */
function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvRow(fields: (string | number)[]): string {
  return fields.map((f) => escapeCsvField(String(f))).join(",");
}

export interface RuntimeIndexCsvMeta {
  toolTitle: string;
  generatedAtIso: string;
  siteUrl: string;
  formulaText: string;
  dailyEnergyWh: number;
  recommendedCapacityWh: number;
  requiredContinuousOutputW: number;
  requiredSurgeOutputW: number;
  days: number;
  efficiencyPct: number;
  reservePct: number;
  autonomyUnitPlural: string;
}

function autonomyValue(units: number | null, unitPlural: string): string {
  if (units == null) return NOT_VERIFIED;
  return `${(Math.round(units * 10) / 10).toFixed(1)} ${unitPlural}`;
}

/**
 * Builds the full downloadable CSV: a short metadata header block (each
 * line starting with a comment marker so spreadsheet software renders it as
 * plain text, never mistaken for data), a blank separator line, then one
 * header row and one row per catalog product.
 */
export function buildRuntimeIndexCsv(
  recommendations: Recommendation[],
  autonomyByProductId: Map<string, number | null>,
  meta: RuntimeIndexCsvMeta,
): string {
  const lines: string[] = [
    `# ${meta.toolTitle} — PowerMatchLab Runtime Index export`,
    `# Generated: ${meta.generatedAtIso}`,
    `# Source: ${meta.siteUrl}`,
    `# Formula: ${meta.formulaText}`,
    `# Daily energy: ${Math.round(meta.dailyEnergyWh)} Wh — Recommended minimum capacity: ${Math.round(meta.recommendedCapacityWh)} Wh`,
    `# Required continuous output: ${Math.round(meta.requiredContinuousOutputW)} W — Required surge: ${Math.round(meta.requiredSurgeOutputW)} W`,
    `# Autonomy target: ${meta.days} day(s) — Usable efficiency assumption: ${meta.efficiencyPct}% — Reserve headroom assumption: ${meta.reservePct}%`,
    `# These are PowerMatchLab planning estimates from the numbers entered above — not a lab measurement, not a guarantee. PowerMatchLab has not physically tested these products unless a specific product page states otherwise.`,
    "",
    toCsvRow([
      "Brand",
      "Model",
      "Status",
      `Estimated autonomy (${meta.autonomyUnitPlural})`,
      "Capacity (Wh)",
      "Continuous output (W)",
      "Surge output (W)",
      "Surge verified?",
      "Weight (kg)",
      "Solar input (W)",
      "Capacity ratio vs. recommended minimum",
      "Has Amazon affiliate link",
      "Last verified",
      "Official source",
    ]),
  ];

  for (const rec of recommendations) {
    const p = rec.product;
    lines.push(
      toCsvRow([
        p.brand,
        p.model,
        rec.status,
        autonomyValue(autonomyByProductId.get(p.id) ?? null, meta.autonomyUnitPlural),
        p.capacity_wh ?? NOT_VERIFIED,
        p.rated_output_w ?? NOT_VERIFIED,
        p.surge_output_w ?? NOT_VERIFIED,
        p.surge_output_w != null ? "Yes" : "Not verified",
        p.weight_kg ?? NOT_VERIFIED,
        p.solar_input_w ?? NOT_VERIFIED,
        rec.capacityRatio != null ? rec.capacityRatio.toFixed(2) : NOT_VERIFIED,
        p.amazon_affiliate_url ? "Yes" : "No",
        p.last_verified ?? NOT_VERIFIED,
        p.official_source ?? NOT_VERIFIED,
      ]),
    );
  }

  return lines.join("\r\n");
}

/** Triggers a browser download of the given CSV text — no library, a temporary anchor + Blob URL. */
export function downloadCsv(csvText: string, filename: string): void {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
