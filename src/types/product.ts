/**
 * Canonical product data model for PowerMatchLab.
 *
 * The shape mirrors `products.json` at the repository root, which is the single
 * source of truth. Every field that can be genuinely unknown is typed as
 * `T | null`. We never substitute `0`, `false` or `"N/A"` for unknown values.
 */

export type Market = "US";

export type ProductCategory = "portable-power-station";

export type BatteryChemistry = "LiFePO4" | "NMC" | "Lithium-ion" | string;

export interface Product {
  /** Stable slug used as the product route segment. */
  id: string;
  brand: string;
  model: string;
  market: Market;
  category: ProductCategory;

  /** Nameplate battery capacity in watt-hours (manufacturer claim). */
  capacity_wh: number | null;
  /** Rated continuous AC output in watts (manufacturer claim). */
  rated_output_w: number | null;
  /** Peak / surge AC output in watts (manufacturer claim). */
  surge_output_w: number | null;

  battery_chemistry: BatteryChemistry | null;
  cycle_life: string | null;

  /** Unit weight in kilograms. */
  weight_kg: number | null;
  /** Free-form dimension string exactly as published. */
  dimensions: string | null;

  /** Maximum rated solar input in watts. */
  solar_input_w: number | null;
  /** Maximum AC (wall) charging input in watts. */
  ac_charging_w: number | null;
  /** Free-form charging-time description exactly as published. */
  charging_time: string | null;

  ac_outlets: number | null;
  usb_c: number | null;
  usb_a: number | null;
  dc_output: boolean | null;

  /** Has a native RV TT-30 (30A) outlet. */
  rv_tt30: boolean | null;
  /** Provides native 120/240V split-phase output. */
  voltage_240v: boolean | null;
  /** UPS transfer time in milliseconds. */
  ups_ms: number | null;

  expandable: boolean | null;
  max_expanded_capacity_wh: number | null;

  wifi: boolean | null;
  bluetooth: boolean | null;

  warranty: string | null;
  /** Manufacturer-stated idle/standby power draw in watts. */
  idle_consumption_w: number | null;

  best_for: string[];
  pros: string[];
  cons: string[];

  official_source: string | null;
  /** ISO date (YYYY-MM-DD) the record was last checked against the source. */
  last_verified: string | null;

  amazon_asin: string | null;
  /** Direct, normal Amazon product URL. */
  amazon_product_url: string | null;
  /** Future Amazon Associates URL. Intentionally null until registration. */
  amazon_affiliate_url: string | null;
}

/** Use-case keys recognised by the recommendation + best-for logic. */
export type UseCaseKey =
  | "camping"
  | "rv"
  | "refrigerator-backup"
  | "home-backup";
