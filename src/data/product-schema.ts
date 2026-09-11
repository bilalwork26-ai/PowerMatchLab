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

const productObjectSchema = z.object({
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

/**
 * PowerMatchLab's only real Amazon Associates tracking ID. Any
 * `amazon_affiliate_url` claiming to be affiliate must actually carry this
 * tag (or be a genuine amzn.to short link) — this is what stops a plain
 * product link from ever being silently presented as monetized.
 */
export const AMAZON_ASSOCIATES_TAG = "powermatchlab-20";

/**
 * True only when a URL is actually shaped like an Amazon Associates link:
 * an amzn.to short link, or a full URL whose `tag` query param is exactly
 * PowerMatchLab's own Associates ID. Having an ASIN in the path is not
 * enough — plenty of plain, non-monetized amazon.com/dp/ASIN links exist in
 * this catalog on purpose.
 */
export function isAffiliateShapedUrl(url: string): boolean {
  if (/^https:\/\/amzn\.to\//.test(url)) return true;
  try {
    return new URL(url).searchParams.get("tag") === AMAZON_ASSOCIATES_TAG;
  } catch {
    return false;
  }
}

export const productSchema = productObjectSchema.superRefine((p, ctx) => {
  if (p.amazon_affiliate_url !== null) {
    if (!isAffiliateShapedUrl(p.amazon_affiliate_url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amazon_affiliate_url"],
        message: `amazon_affiliate_url must be an amzn.to link or carry tag=${AMAZON_ASSOCIATES_TAG} — a plain link (even one with a real ASIN) is not an affiliate link.`,
      });
    }
    if (p.amazon_product_url !== null && p.amazon_affiliate_url === p.amazon_product_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amazon_affiliate_url"],
        message: "amazon_affiliate_url must not be identical to amazon_product_url — a direct link is never an affiliate link on its own.",
      });
    }
  }
  if (p.amazon_product_url !== null && isAffiliateShapedUrl(p.amazon_product_url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["amazon_product_url"],
      message: "amazon_product_url must be the plain direct listing — it must not itself be an amzn.to link or carry an affiliate tag.",
    });
  }
});

export const productsSchema = z.array(productSchema).min(1);

export type ValidatedProduct = z.infer<typeof productSchema>;
