import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Web app manifest. Ships the static brand icon (src/app/icon.svg) so the
 * declared icon URL is stable and guaranteed to exist; the dynamically
 * generated apple-icon and opengraph-image (see sibling files) are wired
 * into <head> automatically by Next.js and do not need to be duplicated
 * here.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#0b1f3a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
