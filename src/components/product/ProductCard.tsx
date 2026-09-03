import Link from "next/link";
import type { Product } from "@/types/product";
import type { ProductScore } from "@/lib/score";
import { productDisplayName } from "@/data/products";
import { fmtWh, fmtWatts, fmtKg } from "@/lib/format";
import { ProductIllustration } from "@/components/ui/ProductIllustration";
import { Badge } from "@/components/ui/Badge";
import { CompareToggleButton } from "./CompareToggleButton";
import { AmazonCta } from "./AmazonCta";

export function ProductCard({
  product,
  score,
  showActions = true,
}: {
  product: Product;
  score?: ProductScore;
  showActions?: boolean;
}) {
  const name = productDisplayName(product);
  return (
    <article className="card-interactive flex h-full flex-col p-4">
      <div className="flex gap-4">
        <ProductIllustration product={product} size={84} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
            {product.brand}
          </p>
          <h3 className="truncate text-base font-semibold">
            <Link href={`/products/${product.id}`} className="hover:text-brand-700">
              {product.model}
            </Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {product.battery_chemistry ? (
              <Badge tone="neutral">{product.battery_chemistry}</Badge>
            ) : null}
            {score?.overall != null ? (
              <Badge tone="brand">Score {score.overall}/100</Badge>
            ) : (
              <Badge tone="warn">Score not published</Badge>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-navy-50 p-2">
          <dt className="text-navy-500">Capacity</dt>
          <dd className="mt-0.5 font-semibold text-navy-900">
            {fmtWh(product.capacity_wh)}
          </dd>
        </div>
        <div className="rounded-md bg-navy-50 p-2">
          <dt className="text-navy-500">Output</dt>
          <dd className="mt-0.5 font-semibold text-navy-900">
            {fmtWatts(product.rated_output_w)}
          </dd>
        </div>
        <div className="rounded-md bg-navy-50 p-2">
          <dt className="text-navy-500">Weight</dt>
          <dd className="mt-0.5 font-semibold text-navy-900">
            {product.weight_kg == null ? "Not verified" : `${product.weight_kg} kg`}
          </dd>
        </div>
      </dl>

      {product.best_for.length ? (
        <p className="mt-3 line-clamp-2 text-xs text-navy-600">
          <span className="font-medium text-navy-700">Best for:</span>{" "}
          {product.best_for.slice(0, 4).join(", ")}
        </p>
      ) : null}

      <div className="mt-4 flex-1" />

      {showActions ? (
        <div className="mt-4 space-y-2">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex w-full items-center justify-center rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            View product
          </Link>
          <CompareToggleButton productId={product.id} size="sm" />
          <AmazonCta product={product} size="sm" withDisclosure={false} />
        </div>
      ) : (
        <p className="sr-only">{name}</p>
      )}
    </article>
  );
}
