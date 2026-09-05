import Link from "next/link";
import type { Product } from "@/types/product";
import type { ProductScore } from "@/lib/score";
import { productDisplayName } from "@/data/products";
import { fmtWh, fmtWatts, fmtKg } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ProductIllustration } from "@/components/ui/ProductIllustration";
import { Badge } from "@/components/ui/Badge";
import { CompareToggleButton } from "./CompareToggleButton";
import { AmazonCta } from "./AmazonCta";

/**
 * `tone="dark"` is a purely visual variant for placing this exact card
 * (same real data, same required affiliate CTA/disclosure, same compare
 * toggle) on a dark navy section, e.g. the home page's featured picks.
 * Nothing about the underlying product data or link logic changes.
 */
export function ProductCard({
  product,
  score,
  showActions = true,
  tone = "light",
}: {
  product: Product;
  score?: ProductScore;
  showActions?: boolean;
  tone?: "light" | "dark";
}) {
  const name = productDisplayName(product);
  const dark = tone === "dark";
  return (
    <article
      className={cn(
        "flex h-full flex-col p-4",
        dark
          ? "rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 shadow-glow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-glow-cyan"
          : "card-interactive",
      )}
    >
      <div className="flex gap-4">
        <ProductIllustration product={product} size={84} tone={tone} />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              dark ? "text-navy-400" : "text-navy-500",
            )}
          >
            {product.brand}
          </p>
          <h3 className={cn("truncate text-base font-semibold", dark && "text-white")}>
            <Link
              href={`/products/${product.id}`}
              className={dark ? "hover:text-cyan-300" : "hover:text-brand-700"}
            >
              {product.model}
            </Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {product.battery_chemistry ? (
              <Badge tone="neutral" dark={dark}>{product.battery_chemistry}</Badge>
            ) : null}
            {score?.overall != null ? (
              <Badge tone="brand" dark={dark}>Score {score.overall}/100</Badge>
            ) : null}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        {[
          ["Capacity", fmtWh(product.capacity_wh)],
          ["Output", fmtWatts(product.rated_output_w)],
          ["Weight", fmtKg(product.weight_kg)],
        ].map(([label, value]) => (
          <div
            key={label}
            className={cn("rounded-md p-2", dark ? "bg-navy-950/50" : "bg-navy-50")}
          >
            <dt className={dark ? "text-navy-400" : "text-navy-500"}>{label}</dt>
            <dd className={cn("mt-0.5 font-semibold", dark ? "text-white" : "text-navy-900")}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {product.best_for.length ? (
        <p className={cn("mt-3 line-clamp-2 text-xs", dark ? "text-navy-300" : "text-navy-600")}>
          <span className={cn("font-medium", dark ? "text-navy-200" : "text-navy-700")}>
            Best for:
          </span>{" "}
          {product.best_for.slice(0, 4).join(", ")}
        </p>
      ) : null}

      <div className="mt-4 flex-1" />

      {showActions ? (
        <div className="mt-4 space-y-2">
          <Link
            href={`/products/${product.id}`}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium",
              dark
                ? "border-navy-600 bg-navy-800 text-cyan-300 hover:bg-navy-700"
                : "border-brand-200 bg-white text-brand-700 hover:bg-brand-50",
            )}
          >
            View product
          </Link>
          <CompareToggleButton productId={product.id} size="sm" tone={tone} />
          <AmazonCta product={product} size="sm" withDisclosure={false} tone={tone} />
        </div>
      ) : (
        <p className="sr-only">{name}</p>
      )}
    </article>
  );
}
