"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/** Fires product_view once when a product detail page mounts. Renders nothing. */
export function TrackProductView({ productId }: { productId: string }) {
  useEffect(() => {
    trackEvent("product_view", { product_id: productId });
  }, [productId]);

  return null;
}
