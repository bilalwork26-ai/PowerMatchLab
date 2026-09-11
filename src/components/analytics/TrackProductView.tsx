"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/** Fires view_product once when a product detail page mounts. Renders nothing. */
export function TrackProductView({ productId }: { productId: string }) {
  useEffect(() => {
    trackEvent("view_product", { product_id: productId });
  }, [productId]);

  return null;
}
