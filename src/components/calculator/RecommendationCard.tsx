import Link from "next/link";
import type { Recommendation, MatchStatus } from "@/lib/recommend";
import { productDisplayName } from "@/data/products";
import { fmtWh, fmtWatts, fmtKg } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ProductIllustration } from "@/components/ui/ProductIllustration";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { AmazonCta } from "@/components/product/AmazonCta";
import { CompareToggleButton } from "@/components/product/CompareToggleButton";
import { CheckIcon, InfoIcon, XIcon } from "@/components/ui/icons";

const STATUS_STYLES: Record<MatchStatus, string> = {
  "Best Match": "bg-positive-50 text-positive-700 border-positive-200",
  "Good Match": "bg-brand-50 text-brand-700 border-brand-200",
  "Possible Match": "bg-warn-50 text-warn-DEFAULT border-warn-100",
  "Not Suitable": "bg-navy-100 text-navy-600 border-navy-200",
};

const STATUS_STYLES_DARK: Record<MatchStatus, string> = {
  "Best Match": "bg-navy-800 text-positive-500 border-positive-500/40",
  "Good Match": "bg-navy-800 text-cyan-300 border-cyan-400/40",
  "Possible Match": "bg-navy-800 text-amber-300 border-amber-400/40",
  "Not Suitable": "bg-navy-800 text-navy-300 border-navy-600",
};

export function RecommendationCard({
  rec,
  tone = "light",
}: {
  rec: Recommendation;
  tone?: "light" | "dark";
}) {
  const { product, status, reasons, limitations, powerMatchScore } = rec;
  const dark = tone === "dark";
  return (
    <article
      className={cn(
        "p-4",
        dark
          ? "rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 shadow-glow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-glow-cyan"
          : "card",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <ProductIllustration product={product} size={64} tone={tone} />
          <div>
            <p className={cn("text-xs font-medium uppercase tracking-wide", dark ? "text-navy-400" : "text-navy-500")}>
              {product.brand}
            </p>
            <h3 className={cn("text-base font-semibold", dark && "text-white")}>
              <Link
                href={`/products/${product.id}`}
                className={dark ? "hover:text-cyan-300" : "hover:text-brand-700"}
              >
                {product.model}
              </Link>
            </h3>
            <p className={cn("mt-0.5 text-xs", dark ? "text-navy-400" : "text-navy-500")}>
              {fmtWh(product.capacity_wh)} · {fmtWatts(product.rated_output_w)} rated
              {product.weight_kg != null ? <> · {fmtKg(product.weight_kg)}</> : null}
            </p>
            <span
              className={cn(
                "mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                dark ? STATUS_STYLES_DARK[status] : STATUS_STYLES[status],
              )}
            >
              {status}
            </span>
          </div>
        </div>
        <ScoreCircle
          value={powerMatchScore.overall}
          band={powerMatchScore.band}
          size={60}
          tone={tone}
        />
      </div>

      {reasons.length ? (
        <ul className={cn("mt-3 space-y-1 text-sm", dark ? "text-navy-200" : "text-navy-700")}>
          {reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <CheckIcon width={15} height={15} className="mt-0.5 shrink-0 text-positive-500" />
              {r}
            </li>
          ))}
        </ul>
      ) : null}

      {limitations.length ? (
        <ul className={cn("mt-2 space-y-1 text-sm", dark ? "text-navy-300" : "text-navy-600")}>
          {limitations.map((l) => (
            <li key={l} className="flex gap-2">
              {status === "Not Suitable" ? (
                <XIcon width={15} height={15} className={cn("mt-0.5 shrink-0", dark ? "text-navy-500" : "text-navy-400")} />
              ) : (
                <InfoIcon width={15} height={15} className="mt-0.5 shrink-0 text-warn-DEFAULT" />
              )}
              {l}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <CompareToggleButton productId={product.id} size="sm" tone={tone} />
        <AmazonCta product={product} size="sm" withDisclosure={false} tone={tone} />
      </div>
      <p className="sr-only">{productDisplayName(product)}</p>
    </article>
  );
}
