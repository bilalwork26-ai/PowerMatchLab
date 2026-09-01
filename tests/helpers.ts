import type { Product } from "@/types/product";

/**
 * Build a synthetic product for tests.
 *
 * Defaults are spread first so an explicitly-passed `null` in `over` wins —
 * important for exercising the "unknown value" code paths.
 */
export function makeProduct(over: Partial<Product> = {}): Product {
  const defaults: Product = {
    id: "test-unit",
    brand: "TestBrand",
    model: "Model X",
    market: "US",
    category: "portable-power-station",
    capacity_wh: 1024,
    rated_output_w: 1800,
    surge_output_w: 3600,
    battery_chemistry: "LiFePO4",
    cycle_life: "4000 cycles",
    weight_kg: 12,
    dimensions: null,
    solar_input_w: 500,
    ac_charging_w: 1200,
    charging_time: null,
    ac_outlets: 4,
    usb_c: 2,
    usb_a: 2,
    dc_output: true,
    rv_tt30: false,
    voltage_240v: false,
    ups_ms: 10,
    expandable: false,
    max_expanded_capacity_wh: null,
    wifi: null,
    bluetooth: null,
    warranty: "5 years",
    idle_consumption_w: null,
    best_for: ["camping"],
    pros: ["Pro"],
    cons: ["Con"],
    official_source: "TestBrand",
    last_verified: "2026-09-01",
    amazon_asin: "B000TEST",
    amazon_product_url: "https://www.amazon.com/dp/B000TEST",
    amazon_affiliate_url: null,
  };
  return { ...defaults, ...over };
}
