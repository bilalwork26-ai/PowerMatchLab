"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MatchStatus, Recommendation } from "@/lib/recommend";
import {
  filterRuntimeIndexRows,
  sortRuntimeIndexRows,
  type RuntimeIndexSortKey,
  type SortDirection,
} from "@/lib/runtime-index-sort";
import { fmtWh, fmtWatts, fmtKg, NOT_VERIFIED } from "@/lib/format";
import { productDisplayName } from "@/data/products";
import { STATUS_STYLES_DARK } from "@/components/calculator/RecommendationCard";
import { AmazonCta } from "@/components/product/AmazonCta";
import { CompareToggleButton } from "@/components/product/CompareToggleButton";
import { cn } from "@/lib/cn";
import { formatAutonomy } from "./shared";

/**
 * Shown instead of a battery-only "days of autonomy" figure when the
 * caller determined this product's own (solar-input-capped) estimated daily
 * solar contribution meets or exceeds the daily energy need — an honest
 * explanation, never a bare "Not verified" that would look like missing
 * data when the real reason is "solar may already cover this".
 */
const SOLAR_MAY_COVER_LOAD_MESSAGE =
  "Estimated solar production may cover the stated daily load; battery capacity still provides overnight and low-sun buffering.";

const STATUS_OPTIONS: { value: MatchStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "Best Fit", label: "Best Fit" },
  { value: "Good Fit", label: "Good Fit" },
  { value: "Oversized", label: "Oversized" },
  { value: "Possible Match", label: "Possible / verification required" },
  { value: "Not Suitable", label: "Not suitable" },
];

interface ColumnDef {
  key: RuntimeIndexSortKey;
  label: string;
  /** Only shown when "Show technical specs" is expanded. */
  advanced?: boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: "status", label: "Status" },
  { key: "autonomy", label: "Est. autonomy" },
  { key: "capacity", label: "Capacity" },
  { key: "continuousOutput", label: "Continuous output", advanced: true },
  { key: "surge", label: "Surge (verified)", advanced: true },
  { key: "weight", label: "Weight", advanced: true },
  { key: "solarInput", label: "Solar input", advanced: true },
  { key: "proportionality", label: "Fit ratio", advanced: true },
];

/**
 * Dynamic, sortable, filterable comparison table across every product the
 * shared recommendation engine classified for the current calculation (see
 * lib/recommend.ts — the same list that feeds the grouped card view above,
 * never a separate or re-derived catalog subset). This is additive to the
 * existing "primary/oversized/possible/not-suitable" card groups, not a
 * replacement — the cards already answer "what should I buy" at a glance;
 * this table answers "show me everything, my way" for a visitor (or an
 * editor citing this page) who wants the full comparison.
 */
export function RuntimeIndexTable({
  recommendations,
  autonomyByProductId,
  autonomyUnit,
  catalogCount,
  solarCoveredProductIds,
}: {
  recommendations: Recommendation[];
  /** Precomputed once by the caller (see LoadListCalculator) so this table and the CSV export never compute autonomy independently and risk drifting apart. */
  autonomyByProductId: ReadonlyMap<string, number | null>;
  autonomyUnit: { singular: string; plural: string };
  catalogCount: number;
  /**
   * Product IDs for which the caller determined the estimated (per-product,
   * solar-input-capped) daily solar contribution meets or exceeds the daily
   * energy need — `autonomyByProductId` is `null` for these (a battery-only
   * "days of autonomy" figure isn't a meaningful number when solar may cover
   * the whole load), but that is a DIFFERENT reason than "not enough data",
   * so the table shows an honest explanation instead of the generic
   * not-verified fallback. Defaults to empty.
   */
  solarCoveredProductIds?: ReadonlySet<string>;
}) {
  const [sortKey, setSortKey] = useState<RuntimeIndexSortKey>("status");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "all">("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const rows = useMemo(() => {
    const filtered = filterRuntimeIndexRows(recommendations, statusFilter);
    return sortRuntimeIndexRows(filtered, autonomyByProductId, sortKey, sortDir);
  }, [recommendations, statusFilter, sortKey, sortDir, autonomyByProductId]);

  const toggleSort = (key: RuntimeIndexSortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "status" ? "asc" : "desc");
    }
  };

  const visibleColumns = COLUMNS.filter((c) => showAdvanced || !c.advanced);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Runtime Index</h3>
          <p className="mt-1 max-w-2xl text-sm text-navy-300">
            Every one of the {catalogCount} products in the current PowerMatchLab
            catalog, classified against your calculation above. Sort or filter to
            compare a specific spec — this table doesn&rsquo;t change any ranking,
            it just lets you view the same results a different way.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-navy-200">
          <span className="mr-2">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MatchStatus | "all")}
            className="rounded-md border border-navy-700 bg-navy-900/60 py-1.5 pl-2 pr-7 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          className="rounded-md border border-navy-700 bg-navy-900/60 px-3 py-1.5 text-sm font-medium text-cyan-300 hover:bg-navy-800"
        >
          {showAdvanced ? "Hide technical specs" : "Show technical specs"}
        </button>
        <p className="text-xs text-navy-400">
          {rows.length} of {recommendations.length} product{recommendations.length === 1 ? "" : "s"} shown
        </p>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-navy-700">
        <table className={`w-full text-left text-sm ${showAdvanced ? "min-w-[760px]" : "min-w-[520px]"}`}>
          <caption className="sr-only">
            Runtime Index: every catalog product compared against your current calculation, sortable by column.
          </caption>
          <thead>
            <tr className="border-b border-navy-700 bg-navy-900/60 text-xs uppercase tracking-wide text-navy-400">
              <th scope="col" className="py-2 pl-3 pr-2 font-medium">
                Product
              </th>
              {visibleColumns.map((col) => (
                <th key={col.key} scope="col" className="px-2 py-2 font-medium" aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 uppercase tracking-wide text-navy-400 hover:text-white focus-visible:text-white"
                  >
                    {col.label}
                    <span aria-hidden="true" className="text-[10px]">
                      {sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
              <th scope="col" className="py-2 pl-2 pr-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((rec) => {
              const autonomyUnits = autonomyByProductId.get(rec.product.id) ?? null;
              return (
                <tr key={rec.product.id} className="border-b border-navy-800 last:border-b-0">
                  <td className="py-2 pl-3 pr-2">
                    <Link
                      href={`/products/${rec.product.id}`}
                      className="font-medium text-white hover:text-cyan-300"
                    >
                      {productDisplayName(rec.product)}
                    </Link>
                  </td>
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-2 py-2 text-navy-200",
                        col.key === "autonomy" && solarCoveredProductIds?.has(rec.product.id)
                          ? "whitespace-normal"
                          : "whitespace-nowrap",
                      )}
                    >
                      {col.key === "autonomy" && solarCoveredProductIds?.has(rec.product.id)
                        ? SOLAR_MAY_COVER_LOAD_MESSAGE
                        : renderCell(col.key, rec, autonomyUnits, autonomyUnit)}
                    </td>
                  ))}
                  <td className="py-2 pl-2 pr-3">
                    <div className="flex flex-col gap-1.5 sm:flex-row">
                      <CompareToggleButton productId={rec.product.id} size="sm" tone="dark" />
                      <AmazonCta
                        product={rec.product}
                        size="sm"
                        withDisclosure={false}
                        tone="dark"
                        placement="calculator_recommendation"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="py-6 text-center text-navy-400">
                  No product matches this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderCell(
  key: RuntimeIndexSortKey,
  rec: Recommendation,
  autonomyUnits: number | null,
  autonomyUnit: { singular: string; plural: string },
) {
  switch (key) {
    case "status":
      return (
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES_DARK[rec.status]}`}
        >
          {rec.status}
        </span>
      );
    case "autonomy":
      return formatAutonomy(autonomyUnits, autonomyUnit.singular, autonomyUnit.plural);
    case "capacity":
      return fmtWh(rec.product.capacity_wh);
    case "continuousOutput":
      return fmtWatts(rec.product.rated_output_w);
    case "surge":
      return rec.product.surge_output_w != null ? fmtWatts(rec.product.surge_output_w) : NOT_VERIFIED;
    case "weight":
      return fmtKg(rec.product.weight_kg);
    case "solarInput":
      return rec.product.solar_input_w != null ? fmtWatts(rec.product.solar_input_w) : NOT_VERIFIED;
    case "proportionality":
      return rec.capacityRatio != null ? `${rec.capacityRatio.toFixed(2)}×` : NOT_VERIFIED;
  }
}
