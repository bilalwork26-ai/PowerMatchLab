import type { Product } from "@/types/product";
import { CheckIcon, XIcon } from "@/components/ui/icons";

export function ProsCons({ product }: { product: Product }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-positive-500/30 bg-navy-900/60 p-4">
        <h3 className="text-sm font-semibold text-positive-500">Pros</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-navy-200">
          {product.pros.length ? (
            product.pros.map((p) => (
              <li key={p} className="flex gap-2">
                <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-positive-500" />
                {p}
              </li>
            ))
          ) : (
            <li className="text-navy-400">Not provided.</li>
          )}
        </ul>
      </div>
      <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-4">
        <h3 className="text-sm font-semibold text-navy-200">Cons</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-navy-200">
          {product.cons.length ? (
            product.cons.map((c) => (
              <li key={c} className="flex gap-2">
                <XIcon width={16} height={16} className="mt-0.5 shrink-0 text-navy-500" />
                {c}
              </li>
            ))
          ) : (
            <li className="text-navy-400">Not provided.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
