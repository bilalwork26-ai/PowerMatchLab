/**
 * Lightweight SVG radar chart with a mandatory text-equivalent table.
 *
 * Only render this when every series has justified underlying scores — callers
 * are responsible for that check (see score.ts / MIN_DIMENSIONS_FOR_OVERALL).
 */

import { cn } from "@/lib/cn";

const SERIES_COLORS = ["#1c6dd0", "#16a34a", "#7c3aed", "#d97706"];

export interface RadarSeries {
  name: string;
  /** One value (0-100) per axis, in the same order as `axes`. */
  values: number[];
}

export function RadarChart({
  axes,
  series,
  size = 320,
  caption,
  tone = "light",
}: {
  axes: string[];
  series: RadarSeries[];
  size?: number;
  caption?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const gridColor = dark ? "#334766" : "#e2e8f0";
  const axisLabelColor = dark ? "#94a3b8" : "#475569";
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 46;
  const step = (Math.PI * 2) / axes.length;

  const pointFor = (axisIndex: number, value: number) => {
    const angle = -Math.PI / 2 + axisIndex * step;
    const r = (Math.min(100, Math.max(0, value)) / 100) * radius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  };

  const gridLevels = [25, 50, 75, 100];

  return (
    <figure className="w-full">
      <svg
        width="100%"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={
          caption ??
          `Radar chart comparing ${series.map((s) => s.name).join(", ")} across ${axes.join(", ")}`
        }
        className="mx-auto max-w-[360px]"
      >
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={axes
              .map((_, i) => pointFor(i, level).join(","))
              .join(" ")}
            fill="none"
            stroke={gridColor}
            strokeWidth={1}
          />
        ))}
        {axes.map((_, i) => {
          const [x, y] = pointFor(i, 100);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={gridColor}
              strokeWidth={1}
            />
          );
        })}
        {series.map((s, si) => {
          const color = SERIES_COLORS[si % SERIES_COLORS.length];
          return (
            <polygon
              key={s.name}
              points={s.values.map((v, i) => pointFor(i, v).join(",")).join(" ")}
              fill={color}
              fillOpacity={0.14}
              stroke={color}
              strokeWidth={2}
            />
          );
        })}
        {axes.map((axis, i) => {
          const [x, y] = pointFor(i, 118);
          return (
            <text
              key={axis}
              x={x}
              y={y}
              fontSize={10}
              fill={axisLabelColor}
              textAnchor={x < cx - 4 ? "end" : x > cx + 4 ? "start" : "middle"}
              dominantBaseline="middle"
            >
              {axis}
            </text>
          );
        })}
      </svg>

      <div
        className={cn(
          "mt-3 flex flex-wrap justify-center gap-3 text-xs",
          dark && "text-navy-300",
        )}
      >
        {series.map((s, si) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: SERIES_COLORS[si % SERIES_COLORS.length] }}
            />
            {s.name}
          </span>
        ))}
      </div>

      <figcaption className="sr-only">
        Text equivalent of the radar chart follows.
      </figcaption>
      <table className="mt-4 w-full border-collapse text-xs sm:text-sm">
        <caption className="sr-only">
          {caption ?? "Radar chart data"}
        </caption>
        <thead>
          <tr
            className={cn(
              "border-b text-left",
              dark ? "border-navy-700 text-navy-400" : "border-navy-100 text-navy-500",
            )}
          >
            <th scope="col" className="py-1.5 pr-2 font-medium">
              Dimension
            </th>
            {series.map((s) => (
              <th key={s.name} scope="col" className="py-1.5 px-2 font-medium">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {axes.map((axis, ai) => (
            <tr key={axis} className={dark ? "border-b border-navy-800" : "border-b border-navy-50"}>
              <th
                scope="row"
                className={cn(
                  "py-1.5 pr-2 text-left font-medium",
                  dark ? "text-navy-200" : "text-navy-700",
                )}
              >
                {axis}
              </th>
              {series.map((s) => (
                <td
                  key={s.name}
                  className={cn(
                    "py-1.5 px-2 tabular-nums",
                    dark ? "text-navy-200" : "text-navy-700",
                  )}
                >
                  {Math.round(s.values[ai])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
