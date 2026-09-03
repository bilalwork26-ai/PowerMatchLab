import type { Product } from "@/types/product";
import { buildRuntimeTable } from "@/lib/runtime";
import { RUNTIME_EFFICIENCY } from "@/lib/assumptions";
import { fmtHours } from "@/lib/format";
import { Callout } from "@/components/ui/Callout";

export function RuntimeExamples({ product }: { product: Product }) {
  const rows = buildRuntimeTable(product.capacity_wh);
  const pct = Math.round(RUNTIME_EFFICIENCY * 100);

  return (
    <div className="space-y-3">
      <p className="text-sm text-navy-300">
        Estimated runtime ={" "}
        <span className="font-mono text-[13px] text-cyan-200">
          capacity_wh × {RUNTIME_EFFICIENCY} ÷ device_watts
        </span>
        . This is a calculation using an assumed {pct}% usable efficiency — never a
        guaranteed or tested figure. Real runtime depends on the device, its duty
        cycle and temperature.
      </p>

      {product.capacity_wh == null ? (
        <Callout tone="warn" dark>
          Battery capacity is not verified for this unit, so we cannot estimate
          runtime.
        </Callout>
      ) : (
        <table className="w-full overflow-hidden rounded-lg border border-navy-700 text-sm">
          <caption className="sr-only">
            Estimated runtime for example loads
          </caption>
          <thead>
            <tr className="bg-navy-900/70 text-left text-navy-300">
              <th scope="col" className="px-4 py-2 font-medium">
                Example load
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Assumed draw
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Estimated runtime
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-navy-800">
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-navy-200">
                  {r.label}
                </th>
                <td className="px-4 py-2.5 text-navy-300">{r.deviceWatts} W</td>
                <td className="px-4 py-2.5 font-semibold text-white">
                  {fmtHours(r.hours)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
