"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type { ProductScore } from "@/lib/score";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/cn";
import { SearchIcon } from "@/components/ui/icons";

type SortKey = "score" | "capacity" | "output" | "weight" | "brand";

interface Props {
  products: Product[];
  scores: Record<string, ProductScore>;
  brands: string[];
  chemistries: string[];
  useCaseTags: string[];
}

interface Filters {
  q: string;
  brands: Set<string>;
  chemistries: Set<string>;
  useCases: Set<string>;
  minCapacity: number | null;
  minOutput: number | null;
  maxWeight: number | null;
  needsSolar: boolean;
  needsExpandable: boolean;
  needs240V: boolean;
  needsTT30: boolean;
  needsUps: boolean;
}

const CAPACITY_STEPS = [
  { label: "Any capacity", value: null },
  { label: "500 Wh+", value: 500 },
  { label: "1,000 Wh+", value: 1000 },
  { label: "2,000 Wh+", value: 2000 },
  { label: "3,500 Wh+", value: 3500 },
];

const OUTPUT_STEPS = [
  { label: "Any output", value: null },
  { label: "1,000 W+", value: 1000 },
  { label: "1,800 W+", value: 1800 },
  { label: "2,400 W+", value: 2400 },
  { label: "4,000 W+", value: 4000 },
];

const WEIGHT_STEPS = [
  { label: "Any weight", value: null },
  { label: "Under 5 kg", value: 5 },
  { label: "Under 12 kg", value: 12 },
  { label: "Under 20 kg", value: 20 },
];

function emptyFilters(): Filters {
  return {
    q: "",
    brands: new Set(),
    chemistries: new Set(),
    useCases: new Set(),
    minCapacity: null,
    minOutput: null,
    maxWeight: null,
    needsSolar: false,
    needsExpandable: false,
    needs240V: false,
    needsTT30: false,
    needsUps: false,
  };
}

export function ProductsBrowser({
  products,
  scores,
  brands,
  chemistries,
  useCaseTags,
}: Props) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("score");

  const toggleSet = (key: "brands" | "chemistries" | "useCases", value: string) => {
    setFilters((f) => {
      const next = new Set(f[key]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...f, [key]: next };
    });
  };

  const results = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (q) {
        const hay = `${p.brand} ${p.model}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.brands.size && !filters.brands.has(p.brand)) return false;
      if (
        filters.chemistries.size &&
        (!p.battery_chemistry || !filters.chemistries.has(p.battery_chemistry))
      )
        return false;
      if (filters.useCases.size) {
        const tagLc = p.best_for.map((t) => t.toLowerCase());
        const ok = Array.from(filters.useCases).some((uc) =>
          tagLc.some((t) => t.includes(uc.toLowerCase())),
        );
        if (!ok) return false;
      }
      if (filters.minCapacity != null) {
        if (p.capacity_wh == null || p.capacity_wh < filters.minCapacity) return false;
      }
      if (filters.minOutput != null) {
        if (p.rated_output_w == null || p.rated_output_w < filters.minOutput)
          return false;
      }
      if (filters.maxWeight != null) {
        if (p.weight_kg == null || p.weight_kg > filters.maxWeight) return false;
      }
      if (filters.needsSolar && !(p.solar_input_w != null && p.solar_input_w > 0))
        return false;
      if (filters.needsExpandable && p.expandable !== true) return false;
      if (filters.needs240V && p.voltage_240v !== true) return false;
      if (filters.needsTT30 && p.rv_tt30 !== true) return false;
      if (filters.needsUps && !(p.ups_ms != null)) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "capacity":
          return (b.capacity_wh ?? -1) - (a.capacity_wh ?? -1);
        case "output":
          return (b.rated_output_w ?? -1) - (a.rated_output_w ?? -1);
        case "weight":
          return (a.weight_kg ?? Infinity) - (b.weight_kg ?? Infinity);
        case "brand":
          return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
        case "score":
        default:
          return (
            (scores[b.id]?.overall ?? -1) - (scores[a.id]?.overall ?? -1)
          );
      }
    });
    return sorted;
  }, [products, scores, filters, sort]);

  const activeCount =
    filters.brands.size +
    filters.chemistries.size +
    filters.useCases.size +
    (filters.q ? 1 : 0) +
    (filters.minCapacity != null ? 1 : 0) +
    (filters.minOutput != null ? 1 : 0) +
    (filters.maxWeight != null ? 1 : 0) +
    [
      filters.needsSolar,
      filters.needsExpandable,
      filters.needs240V,
      filters.needsTT30,
      filters.needsUps,
    ].filter(Boolean).length;

  return (
    <div className="bg-navy-950 py-10 text-white">
      <div className="container-page grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="glass-panel bg-navy-900/60 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Filters</h2>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setFilters(emptyFilters())}
                  className="text-xs font-medium text-cyan-300 hover:underline"
                >
                  Clear ({activeCount})
                </button>
              ) : null}
            </div>

            <label className="mt-3 block">
              <span className="sr-only">Search by brand or model</span>
              <span className="relative block">
                <SearchIcon
                  width={16}
                  height={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-500"
                />
                <input
                  type="search"
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  placeholder="Search brand or model"
                  className="w-full rounded-md border border-navy-700 bg-navy-950/60 py-2 pl-9 pr-3 text-sm text-white placeholder-navy-500 outline-none transition-shadow duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </span>
            </label>

            <FilterGroup label="Brand">
              {brands.map((b) => (
                <CheckRow
                  key={b}
                  label={b}
                  checked={filters.brands.has(b)}
                  onChange={() => toggleSet("brands", b)}
                />
              ))}
            </FilterGroup>

            <FilterGroup label="Battery chemistry">
              {chemistries.map((c) => (
                <CheckRow
                  key={c}
                  label={c}
                  checked={filters.chemistries.has(c)}
                  onChange={() => toggleSet("chemistries", c)}
                />
              ))}
            </FilterGroup>

            <FilterGroup label="Use case">
              {useCaseTags.map((t) => (
                <CheckRow
                  key={t}
                  label={t}
                  checked={filters.useCases.has(t)}
                  onChange={() => toggleSet("useCases", t)}
                />
              ))}
            </FilterGroup>

            <SelectGroup
              label="Minimum capacity"
              options={CAPACITY_STEPS}
              value={filters.minCapacity}
              onChange={(v) => setFilters((f) => ({ ...f, minCapacity: v }))}
            />
            <SelectGroup
              label="Minimum rated output"
              options={OUTPUT_STEPS}
              value={filters.minOutput}
              onChange={(v) => setFilters((f) => ({ ...f, minOutput: v }))}
            />
            <SelectGroup
              label="Maximum weight"
              options={WEIGHT_STEPS}
              value={filters.maxWeight}
              onChange={(v) => setFilters((f) => ({ ...f, maxWeight: v }))}
            />

            <FilterGroup label="Capabilities">
              <CheckRow
                label="Solar input"
                checked={filters.needsSolar}
                onChange={() =>
                  setFilters((f) => ({ ...f, needsSolar: !f.needsSolar }))
                }
              />
              <CheckRow
                label="Expandable capacity"
                checked={filters.needsExpandable}
                onChange={() =>
                  setFilters((f) => ({ ...f, needsExpandable: !f.needsExpandable }))
                }
              />
              <CheckRow
                label="Native 120/240V"
                checked={filters.needs240V}
                onChange={() =>
                  setFilters((f) => ({ ...f, needs240V: !f.needs240V }))
                }
              />
              <CheckRow
                label="RV TT-30 outlet"
                checked={filters.needsTT30}
                onChange={() =>
                  setFilters((f) => ({ ...f, needsTT30: !f.needsTT30 }))
                }
              />
              <CheckRow
                label="UPS switchover (verified)"
                checked={filters.needsUps}
                onChange={() =>
                  setFilters((f) => ({ ...f, needsUps: !f.needsUps }))
                }
              />
            </FilterGroup>
            <p className="mt-3 text-[11px] leading-4 text-navy-400">
              Capability filters only match products where that field is verified in
              our data. A product with an unverified field is excluded from that
              filter, not assumed.
            </p>
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-navy-300" role="status" aria-live="polite">
              {results.length} of {products.length} products
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-navy-300">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border border-navy-700 bg-navy-900/60 py-1.5 pl-2 pr-7 text-sm text-white outline-none transition-shadow duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              >
                <option value="score">PowerMatch Score</option>
                <option value="capacity">Capacity</option>
                <option value="output">Rated output</option>
                <option value="weight">Weight (lightest)</option>
                <option value="brand">Brand / model</option>
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="glass-panel mt-4 flex flex-col items-center gap-2 bg-navy-900/60 p-10 text-center text-sm text-navy-300">
              <SearchIcon width={28} height={28} className="text-navy-600" />
              No products match these filters. Try clearing some.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} score={scores[p.id]} tone="dark" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="mt-4 border-t border-navy-700 pt-3">
      <legend className="text-xs font-semibold uppercase tracking-wide text-navy-400">
        {label}
      </legend>
      <div className="mt-2 space-y-1.5">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm capitalize",
        checked ? "text-white" : "text-navy-400",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
      />
      {label}
    </label>
  );
}

function SelectGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: number | null }[];
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="mt-4 block border-t border-navy-700 pt-3 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className="mt-2 w-full rounded-md border border-navy-700 bg-navy-950/60 py-1.5 pl-2 pr-7 text-sm text-white outline-none transition-shadow duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      >
        {options.map((o) => (
          <option key={o.label} value={o.value ?? ""}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
