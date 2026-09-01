import { cn } from "@/lib/cn";
import type { ScoreBand } from "@/lib/score";

const bandColor: Record<ScoreBand, string> = {
  Excellent: "#16a34a",
  Great: "#16a34a",
  Good: "#1c6dd0",
  Fair: "#d97706",
  Limited: "#64748b",
};

/**
 * Circular score gauge. `value` is 0-100; when null we render an explicit
 * "not scored" state rather than an empty ring.
 */
export function ScoreCircle({
  value,
  band,
  size = 88,
  label = "PowerMatch Score",
  className,
}: {
  value: number | null;
  band?: ScoreBand | null;
  size?: number;
  label?: string;
  className?: string;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value == null ? 0 : Math.min(100, Math.max(0, value));
  const color = band ? bandColor[band] : "#1c6dd0";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={
          value == null
            ? `${label}: not scored — not enough verified data`
            : `${label}: ${value} out of 100${band ? `, rated ${band}` : ""}`
        }
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        {value != null ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (pct / 100) * c}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fontSize={size * 0.28}
          fontWeight={700}
          fill="#0b1f3a"
        >
          {value == null ? "—" : value}
        </text>
      </svg>
      {value != null && band ? (
        <span className="mt-1 text-sm font-semibold" style={{ color }}>
          {band}
        </span>
      ) : (
        <span className="mt-1 text-xs text-navy-500">Not scored</span>
      )}
    </div>
  );
}
