import Link from "next/link";
import type { Product } from "@/types/product";
import { getAllProducts, productDisplayName } from "@/data/products";
import { fmtWh, fmtWatts, fmtKg } from "@/lib/format";

/** Picks the products closest in capacity to `product` for an at-a-glance table. */
function nearestByCapacity(product: Product, n: number): Product[] {
  const others = getAllProducts().filter((p) => p.id !== product.id);
  if (product.capacity_wh == null) return others.slice(0, n);
  return [...others]
    .sort(
      (a, b) =>
        Math.abs((a.capacity_wh ?? 0) - product.capacity_wh!) -
        Math.abs((b.capacity_wh ?? 0) - product.capacity_wh!),
    )
    .slice(0, n);
}

export function QuickComparison({ product }: { product: Product }) {
  const peers = nearestByCapacity(product, 3);
  const row = [product, ...peers];
  const ids = row.map((p) => p.id).join(",");

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="sr-only">
            Quick comparison of {productDisplayName(product)} with similar-capacity
            units
          </caption>
          <thead>
            <tr className="text-left text-navy-400">
              <th scope="col" className="py-2 pr-3 font-medium">
                Model
              </th>
              <th scope="col" className="py-2 px-3 font-medium">
                Capacity
              </th>
              <th scope="col" className="py-2 px-3 font-medium">
                Rated output
              </th>
              <th scope="col" className="py-2 px-3 font-medium">
                Weight
              </th>
              <th scope="col" className="py-2 pl-3 font-medium">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {row.map((p) => {
              const current = p.id === product.id;
              return (
                <tr
                  key={p.id}
                  className={current ? "bg-cyan-400/5" : "border-t border-navy-800"}
                >
                  <th
                    scope="row"
                    className="py-2.5 pr-3 text-left font-medium text-navy-100"
                  >
                    {productDisplayName(p)}
                    {current ? (
                      <span className="ml-2 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        This product
                      </span>
                    ) : null}
                  </th>
                  <td className="py-2.5 px-3 text-navy-300">{fmtWh(p.capacity_wh)}</td>
                  <td className="py-2.5 px-3 text-navy-300">
                    {fmtWatts(p.rated_output_w)}
                  </td>
                  <td className="py-2.5 px-3 text-navy-300">{fmtKg(p.weight_kg)}</td>
                  <td className="py-2.5 pl-3">
                    {!current ? (
                      <Link
                        href={`/products/${p.id}`}
                        className="text-cyan-300 hover:underline"
                      >
                        View
                      </Link>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Link
        href={`/compare?ids=${ids}`}
        className="inline-flex text-sm font-semibold text-cyan-300 hover:underline"
      >
        Open full comparison →
      </Link>
    </div>
  );
}
