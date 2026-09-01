import Link from "next/link";
import type { Recommendation, MatchStatus } from "@/lib/recommend";
import { productDisplayName } from "@/data/products";
import { fmtWh, fmtWatts } from "@/lib/format";
import { ProductThumb } from "@/components/ui/ProductThumb";
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

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const { product, status, reasons, limitations, powerMatchScore } = rec;
  return (
    <article className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <ProductThumb brand={product.brand} model={product.model} size={64} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
              {product.brand}
            </p>
            <h3 className="text-base font-semibold">
              <Link href={`/products/${product.id}`} className="hover:text-brand-700">
                {product.model}
              </Link>
            </h3>
            <p className="mt-0.5 text-xs text-navy-500">
              {fmtWh(product.capacity_wh)} · {fmtWatts(product.rated_output_w)} rated
            </p>
            <span
              className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
            >
              {status}
            </span>
          </div>
        </div>
        <ScoreCircle
          value={powerMatchScore.overall}
          band={powerMatchScore.band}
          size={60}
        />
      </div>

      {reasons.length ? (
        <ul className="mt-3 space-y-1 text-sm text-navy-700">
          {reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <CheckIcon width={15} height={15} className="mt-0.5 shrink-0 text-positive-600" />
              {r}
            </li>
          ))}
        </ul>
      ) : null}

      {limitations.length ? (
        <ul className="mt-2 space-y-1 text-sm text-navy-600">
          {limitations.map((l) => (
            <li key={l} className="flex gap-2">
              {status === "Not Suitable" ? (
                <XIcon width={15} height={15} className="mt-0.5 shrink-0 text-navy-400" />
              ) : (
                <InfoIcon width={15} height={15} className="mt-0.5 shrink-0 text-warn-DEFAULT" />
              )}
              {l}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <CompareToggleButton productId={product.id} size="sm" />
        <AmazonCta product={product} size="sm" withDisclosure={false} />
      </div>
      <p className="sr-only">{productDisplayName(product)}</p>
    </article>
  );
}
