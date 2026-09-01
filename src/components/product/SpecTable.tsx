import type { ReactNode } from "react";
import type { Product } from "@/types/product";
import {
  NOT_VERIFIED,
  fmtBool,
  fmtCount,
  fmtKg,
  fmtMs,
  fmtText,
  fmtWatts,
  fmtWh,
} from "@/lib/format";

interface Row {
  label: string;
  value: ReactNode;
  claim?: boolean;
}

function group(title: string, rows: Row[]) {
  return { title, rows };
}

export function buildSpecGroups(product: Product) {
  return [
    group("Energy & output", [
      { label: "Battery capacity", value: fmtWh(product.capacity_wh), claim: true },
      {
        label: "Rated continuous output",
        value: fmtWatts(product.rated_output_w),
        claim: true,
      },
      { label: "Surge / peak output", value: fmtWatts(product.surge_output_w), claim: true },
      {
        label: "Expandable",
        value: fmtBool(product.expandable),
      },
      {
        label: "Max expanded capacity",
        value: fmtWh(product.max_expanded_capacity_wh),
        claim: true,
      },
    ]),
    group("Battery", [
      { label: "Chemistry", value: fmtText(product.battery_chemistry), claim: true },
      { label: "Cycle life", value: fmtText(product.cycle_life), claim: true },
      { label: "Warranty", value: fmtText(product.warranty), claim: true },
      {
        label: "Idle consumption",
        value:
          product.idle_consumption_w == null
            ? NOT_VERIFIED
            : `${product.idle_consumption_w} W`,
        claim: true,
      },
    ]),
    group("Charging", [
      { label: "Solar input (max)", value: fmtWatts(product.solar_input_w), claim: true },
      { label: "AC charging (max)", value: fmtWatts(product.ac_charging_w), claim: true },
      { label: "Charging time", value: fmtText(product.charging_time), claim: true },
    ]),
    group("Ports & outlets", [
      { label: "AC outlets", value: fmtCount(product.ac_outlets, "outlet"), claim: true },
      { label: "USB-C ports", value: fmtCount(product.usb_c, "port"), claim: true },
      { label: "USB-A ports", value: fmtCount(product.usb_a, "port"), claim: true },
      { label: "DC output", value: fmtBool(product.dc_output) },
      { label: "RV TT-30 outlet", value: fmtBool(product.rv_tt30) },
      { label: "Native 120/240V", value: fmtBool(product.voltage_240v) },
      { label: "UPS switchover", value: fmtMs(product.ups_ms), claim: true },
    ]),
    group("Physical", [
      { label: "Weight", value: fmtKg(product.weight_kg), claim: true },
      { label: "Dimensions", value: fmtText(product.dimensions), claim: true },
    ]),
    group("Connectivity", [
      { label: "Wi-Fi", value: fmtBool(product.wifi) },
      { label: "Bluetooth", value: fmtBool(product.bluetooth) },
    ]),
    group("Provenance", [
      { label: "Official source", value: fmtText(product.official_source) },
      { label: "Last verified", value: fmtText(product.last_verified) },
      { label: "Amazon ASIN", value: fmtText(product.amazon_asin) },
    ]),
  ];
}

export function SpecTable({ product }: { product: Product }) {
  const groups = buildSpecGroups(product);
  return (
    <div className="space-y-6">
      <p className="text-xs text-navy-500">
        Values marked “manufacturer claim” come from the official source listed
        under Provenance. PowerMatchLab has not independently tested them.
      </p>
      {groups.map((g) => (
        <div key={g.title} className="overflow-hidden rounded-lg border border-navy-100">
          <h3 className="bg-navy-50 px-4 py-2 text-sm font-semibold text-navy-800">
            {g.title}
          </h3>
          <table className="w-full text-sm">
            <tbody>
              {g.rows.map((row) => (
                <tr key={row.label} className="border-t border-navy-100">
                  <th
                    scope="row"
                    className="w-1/2 px-4 py-2.5 text-left font-medium text-navy-600"
                  >
                    {row.label}
                    {row.claim ? (
                      <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-navy-400">
                        claim
                      </span>
                    ) : null}
                  </th>
                  <td className="px-4 py-2.5 text-navy-900">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
