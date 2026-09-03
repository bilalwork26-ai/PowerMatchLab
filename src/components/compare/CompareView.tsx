"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import type { ProductScore } from "@/lib/score";
import { useCompare, MAX_COMPARE } from "@/context/CompareContext";
import { COMPARE_ROWS, rowWinner } from "@/lib/compare-rows";
import { cn } from "@/lib/cn";
import { ProductIllustration } from "@/components/ui/ProductIllustration";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { RadarChart } from "@/components/ui/RadarChart";
import { Callout } from "@/components/ui/Callout";
import { AmazonCta } from "@/components/product/AmazonCta";
import { CheckIcon, TrashIcon, XIcon } from "@/components/ui/icons";

const USE_CASES = [
  { key: "", label: "General" },
  { key: "camping", label: "Camping" },
  { key: "rv", label: "RV" },
  { key: "refrigerator-backup", label: "Refrigerator backup" },
  { key: "home-backup", label: "Home backup" },
];

interface Props {
  catalog: Product[];
  scores: Record<string, ProductScore>;
}

export function CompareView({ catalog, scores }: Props) {
  const { ids, add, remove, clear, ready, isFull, count } = useCompare();
  const searchParams = useSearchParams();
  const seededRef = useRef(false);
  const [useCase, setUseCase] = useState("");

  // Seed selection from ?ids= once, after hydration.
  useEffect(() => {
    if (!ready || seededRef.current) return;
    seededRef.current = true;
    const param = searchParams.get("ids");
    if (!param) return;
    const wanted = param
      .split(",")
      .map((s) => s.trim())
      .filter((s) => catalog.some((p) => p.id === s));
    if (wanted.length === 0) return;
    // Only seed when the user has nothing selected yet, to avoid clobbering.
    if (ids.length === 0) {
      wanted.slice(0, MAX_COMPARE).forEach(add);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const selected = useMemo(
    () =>
      ids
        .map((id) => catalog.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [ids, catalog],
  );

  const remaining = catalog.filter((p) => !ids.includes(p.id));

  const priorityKeys = useMemo(() => {
    if (!useCase) return new Set<string>();
    return new Set(
      COMPARE_ROWS.filter((r) => r.priorityFor?.includes(useCase)).map(
        (r) => r.key,
      ),
    );
  }, [useCase]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, typeof COMPARE_ROWS>();
    for (const row of COMPARE_ROWS) {
      if (!map.has(row.group)) {
        map.set(row.group, []);
        order.push(row.group);
      }
      map.get(row.group)!.push(row);
    }
    return order.map((g) => ({ group: g, rows: map.get(g)! }));
  }, []);

  // Winner tally for the summary.
  const winTally = useMemo(() => {
    const tally: Record<string, number> = {};
    for (const p of selected) tally[p.id] = 0;
    for (const row of COMPARE_ROWS) {
      const w = rowWinner(row, selected);
      if (!w.tie) w.winnerIds.forEach((id) => (tally[id] += 1));
    }
    return tally;
  }, [selected]);

  // Radar: common scored dimensions across all selected products.
  const radar = useMemo(() => {
    if (selected.length < 2) return null;
    const perProduct = selected.map((p) => scores[p.id]?.dimensions ?? []);
    if (perProduct.some((d) => d.length === 0)) return null;
    const commonKeys = perProduct
      .map((d) => new Set(d.map((x) => x.key)))
      .reduce((acc, s) => new Set([...acc].filter((k) => s.has(k))));
    const keys = [...commonKeys];
    if (keys.length < 3) return null;
    const labels = keys.map(
      (k) => perProduct[0].find((d) => d.key === k)?.label ?? k,
    );
    return {
      axes: labels,
      series: selected.map((p) => ({
        name: `${p.brand} ${p.model}`,
        values: keys.map(
          (k) =>
            scores[p.id]?.dimensions.find((d) => d.key === k)?.score ?? 0,
        ),
      })),
    };
  }, [selected, scores]);

  if (!ready) {
    return (
      <div className="bg-navy-950 py-12 text-sm text-navy-300">
        <p className="container-page">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-950 py-8 text-white">
      <div className="container-page">
      {/* Selection tray */}
      <div className="glass-panel bg-navy-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">
            Your selection ({count}/{MAX_COMPARE})
          </h2>
          {count > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-xs font-medium text-navy-300 hover:text-white"
            >
              <TrashIcon width={14} height={14} />
              Clear all
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-800 py-1 pl-3 pr-1 text-sm text-white"
            >
              {p.brand} {p.model}
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`Remove ${p.brand} ${p.model} from comparison`}
                className="grid h-6 w-6 place-items-center rounded-full text-navy-400 hover:bg-navy-700 hover:text-white"
              >
                <XIcon width={14} height={14} />
              </button>
            </span>
          ))}

          {!isFull ? (
            <label className="inline-flex items-center gap-2 text-sm">
              <span className="sr-only">Add a product to compare</span>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) add(e.target.value);
                }}
                className="rounded-full border border-dashed border-cyan-400/50 bg-navy-900/60 py-1.5 pl-3 pr-8 text-sm text-cyan-300 outline-none transition-shadow duration-200 focus:ring-2 focus:ring-cyan-400/30"
              >
                <option value="">+ Add another product…</option>
                {remaining.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.model}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="text-xs text-navy-400">
              Maximum of {MAX_COMPARE} products.
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy-700 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Highlight what matters for
          </span>
          {USE_CASES.map((uc) => (
            <button
              key={uc.key}
              type="button"
              onClick={() => setUseCase(uc.key)}
              aria-pressed={useCase === uc.key}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                useCase === uc.key
                  ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-glow-brand"
                  : "bg-navy-800 text-navy-300 hover:bg-navy-700",
              )}
            >
              {uc.label}
            </button>
          ))}
        </div>
      </div>

      {selected.length === 0 ? (
        <Callout tone="info" dark className="mt-6">
          Add products from the{" "}
          <Link href="/products" className="underline">
            catalog
          </Link>{" "}
          or with the picker above. You can compare up to {MAX_COMPARE} side by
          side. Nothing here is a fabricated score — empty cells mean the data is
          not verified.
        </Callout>
      ) : (
        <>
          {selected.length === 1 ? (
            <Callout tone="neutral" dark className="mt-6">
              Add at least one more product to see a side-by-side comparison and
              winner highlights.
            </Callout>
          ) : null}

          {/* Header row with product cards */}
          <div className="mt-6 overflow-x-auto">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `minmax(180px, 220px) repeat(${selected.length}, minmax(180px, 1fr))`,
              }}
            >
              <div />
              {selected.map((p) => (
                <div
                  key={p.id}
                  className="glass-panel bg-navy-900/60 p-3 text-center"
                >
                  <ProductIllustration
                    product={p}
                    size={72}
                    className="mx-auto"
                    tone="dark"
                  />
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-navy-400">
                    {p.brand}
                  </p>
                  <p className="text-sm font-semibold text-white">{p.model}</p>
                  <div className="mt-1 flex justify-center">
                    <ScoreCircle
                      value={scores[p.id]?.overall ?? null}
                      band={scores[p.id]?.band ?? null}
                      size={64}
                      label="PowerMatch Score"
                      tone="dark"
                    />
                  </div>
                  <Link
                    href={`/products/${p.id}`}
                    className="mt-1 inline-block text-xs font-medium text-cyan-300 hover:underline"
                  >
                    View product →
                  </Link>
                </div>
              ))}
            </div>

            {/* Spec comparison table */}
            <table className="mt-4 w-full border-collapse text-sm">
              <caption className="sr-only">
                Specification comparison. Highlighted cells hold the best verified
                value in that row.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="sr-only">
                    Specification
                  </th>
                  {selected.map((p) => (
                    <th key={p.id} scope="col" className="sr-only">
                      {p.brand} {p.model}
                    </th>
                  ))}
                </tr>
              </thead>
              {groups.map((g) => (
                <tbody key={g.group}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={selected.length + 1}
                      className="bg-navy-900/80 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-navy-300"
                    >
                      {g.group}
                    </th>
                  </tr>
                  {g.rows.map((row) => {
                    const winner = rowWinner(row, selected);
                    const isPriority = priorityKeys.has(row.key);
                    return (
                      <tr
                        key={row.key}
                        className={cn(
                          "border-b border-navy-800",
                          isPriority && "bg-cyan-400/5",
                        )}
                      >
                        <th
                          scope="row"
                          className="min-w-[180px] px-3 py-2.5 text-left font-medium text-navy-300"
                        >
                          {row.label}
                          {isPriority ? (
                            <span className="ml-1.5 rounded bg-gradient-to-r from-brand-600 to-cyan-600 px-1 py-0.5 text-[9px] font-semibold uppercase text-white">
                              Key
                            </span>
                          ) : null}
                        </th>
                        {selected.map((p) => {
                          const isWin =
                            !winner.tie && winner.winnerIds.includes(p.id);
                          return (
                            <td
                              key={p.id}
                              className={cn(
                                "px-3 py-2.5 tabular-nums",
                                isWin
                                  ? "font-semibold text-positive-500"
                                  : "text-navy-100",
                              )}
                            >
                              <span className="inline-flex items-center gap-1">
                                {isWin ? (
                                  <CheckIcon
                                    width={14}
                                    height={14}
                                    className="text-positive-500"
                                  />
                                ) : null}
                                {row.display(p)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              ))}
            </table>
          </div>

          {/* PowerMatch score overview */}
          {selected.length >= 2 ? (
            <section className="mt-10 grid items-start gap-8 lg:grid-cols-2">
              <div className="glass-panel bg-navy-900/60 p-5">
                <h2 className="text-base font-semibold text-white">
                  PowerMatch Score overview
                </h2>
                <p className="mt-1 text-xs text-navy-400">
                  Editorial scores, normalised across the whole catalog. “Not
                  scored” means insufficient verified data.
                </p>
                <div className="mt-4 space-y-3">
                  {selected.map((p) => (
                    <ScoreBar
                      key={p.id}
                      value={scores[p.id]?.overall ?? null}
                      label={`${p.brand} ${p.model}`}
                      tone="dark"
                    />
                  ))}
                </div>
              </div>

              <div className="glass-panel bg-navy-900/60 p-5">
                <h2 className="text-base font-semibold text-white">
                  Category performance radar
                </h2>
                {radar ? (
                  <div className="mt-3">
                    <RadarChart
                      axes={radar.axes}
                      series={radar.series}
                      caption="Common PowerMatch Score dimensions across the selected products"
                      tone="dark"
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-navy-400">
                    A radar chart needs at least three score dimensions that every
                    selected product has in common. The current selection does not
                    meet that, so no chart is shown (we do not fill it with
                    guessed values).
                  </p>
                )}
              </div>
            </section>
          ) : null}

          {/* Comparison summary */}
          {selected.length >= 2 ? (
            <section className="mt-8">
              <h2 className="text-base font-semibold text-white">Comparison summary</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selected.map((p) => {
                  const wins = winTally[p.id] ?? 0;
                  const sc = scores[p.id];
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4 shadow-glow-soft"
                    >
                      <p className="text-sm font-semibold text-white">
                        {p.brand} {p.model}
                      </p>
                      <p className="mt-1 text-xs text-navy-300">
                        Leads on {wins} comparable {wins === 1 ? "spec" : "specs"} in
                        this selection.
                        {sc?.overall != null
                          ? ` PowerMatch Score ${sc.overall}/100 (${sc.band}).`
                          : " PowerMatch Score not published."}
                      </p>
                      <p className="mt-1.5 text-xs text-navy-400">
                        Best for: {p.best_for.slice(0, 3).join(", ") || "—"}
                      </p>
                      <div className="mt-3">
                        <AmazonCta product={p} size="sm" withDisclosure={false} tone="dark" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <Callout tone="warn" dark className="mt-8">
            Winner highlights compare only verified numeric values. A blank or
            “Not verified” cell is excluded from that row — it is not treated as
            zero. Scores are editorial calculations, not test results.{" "}
            <Link href="/about-methodology" className="underline">
              Read the methodology
            </Link>
            .
          </Callout>
        </>
      )}
      </div>
    </div>
  );
}
