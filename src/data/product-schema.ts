import { z } from "zod";

/**
 * Runtime schema for `products.json`.
 *
 * `null` is a first-class, meaningful value: it marks data we have not verified.
 * The schema therefore accepts `null` explicitly and never coerces it away.
 */

const nullableNumber = z.number().finite().nullable();
const nullableString = z.string().min(1).nullable();
const nullableBool = z.boolean().nullable();

export const productSchema = z.object({
  id: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  market: z.literal("US"),
  category: z.literal("portable-power-station"),

  capacity_wh: nullableNumber,
  rated_output_w: nullableNumber,
  surge_output_w: nullableNumber,

  battery_chemistry: nullableString,
  cycle_life: nullableString,

  weight_kg: nullableNumber,
  dimensions: nullableString,

  solar_input_w: nullableNumber,
  ac_charging_w: nullableNumber,
  charging_time: nullableString,

  ac_outlets: nullableNumber,
  usb_c: nullableNumber,
  usb_a: nullableNumber,
  dc_output: nullableBool,

  rv_tt30: nullableBool,
  voltage_240v: nullableBool,
  ups_ms: nullableNumber,

  expandable: nullableBool,
  max_expanded_capacity_wh: nullableNumber,

  wifi: nullableBool,
  bluetooth: nullableBool,

  warranty: nullableString,
  idle_consumption_w: nullableNumber,

  best_for: z.array(z.string().min(1)),
  pros: z.array(z.string().min(1)),
  cons: z.array(z.string().min(1)),

  official_source: nullableString,
  last_verified: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "last_verified must be an ISO date")
    .nullable(),

  amazon_asin: nullableString,
  amazon_product_url: z.string().url().nullable(),
  amazon_affiliate_url: z.string().url().nullable(),
});

export const productsSchema = z.array(productSchema).min(1);

export type ValidatedProduct = z.infer<typeof productSchema>;
