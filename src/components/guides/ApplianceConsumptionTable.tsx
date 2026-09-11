import { Fragment } from "react";
import { APPLIANCE_EXAMPLES } from "@/lib/appliances";

/**
 * Renders every entry in the shared APPLIANCE_EXAMPLES data — the same list
 * the Power Calculator seeds its "+ Add example appliance" picker from — as
 * a table. Reading the array directly (not a hand-copied list) means this
 * table can never drift out of sync with the calculator: add an appliance
 * there and it appears here automatically.
 */
export function ApplianceConsumptionTable() {
  const categoryLabels: Record<string, string> = {
    essentials: "Essentials",
    kitchen: "Kitchen",
    comfort: "Comfort",
    work: "Work",
    outdoors: "Outdoors",
    medical: "Medical",
  };

  const byCategory = new Map<string, typeof APPLIANCE_EXAMPLES>();
  for (const a of APPLIANCE_EXAMPLES) {
    if (!byCategory.has(a.category)) byCategory.set(a.category, []);
    byCategory.get(a.category)!.push(a);
  }

  return (
    <div className="not-prose my-8 rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-5">
      <h2 className="text-lg font-bold text-white">Appliance Power Consumption Table</h2>
      <p className="mt-1 text-sm text-navy-300">
        Running watts, typical startup surge (when the appliance type has
        one) and example hours of use for every device in PowerMatchLab&rsquo;s
        Power Calculator. These are starting-point examples, not a
        measurement of any specific product — always check your own
        device&rsquo;s rating label for its real number.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy-700 text-left text-navy-400">
              <th className="py-2 pr-3 font-medium">Appliance</th>
              <th className="py-2 pr-3 font-medium">Running watts</th>
              <th className="py-2 pr-3 font-medium">Surge watts</th>
              <th className="py-2 pr-3 font-medium">Example hours/day</th>
            </tr>
          </thead>
          <tbody>
            {[...byCategory.entries()].map(([category, items]) => (
              <Fragment key={category}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={4}
                    className="bg-navy-900/80 px-0 py-2 text-left text-xs font-semibold uppercase tracking-wide text-navy-300"
                  >
                    {categoryLabels[category] ?? category}
                  </th>
                </tr>
                {items.map((a) => (
                  <tr key={a.key} className="border-b border-navy-800">
                    <td className="py-2 pr-3 text-navy-200">
                      {a.name}
                      {a.note ? (
                        <span className="block text-xs text-navy-400">{a.note}</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 font-medium text-white">{a.runningWatts} W</td>
                    <td className="py-2 pr-3 text-navy-200">
                      {a.surgeWatts != null ? `${a.surgeWatts} W` : "—"}
                    </td>
                    <td className="py-2 pr-3 text-navy-200">{a.hoursPerDay} h</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-navy-400">
        Every one of these examples is editable in the{" "}
        <a href="/power-calculator" className="underline hover:text-white">
          Power Calculator
        </a>{" "}
        — add it, then change the watts and hours to match your actual device.
      </p>
    </div>
  );
}
