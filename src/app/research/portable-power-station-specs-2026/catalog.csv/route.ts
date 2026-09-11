import { getAllProducts } from "@/data/products";
import { buildCatalogCsv } from "@/lib/catalog-stats";

/**
 * Served at /research/portable-power-station-specs-2026/catalog.csv —
 * generated from the live catalog on every request (the route itself is
 * static-cacheable output, not a file checked into the repo, so it can
 * never drift from products.json). Deliberately excludes every amazon_*
 * field — see CSV_COLUMNS in lib/catalog-stats.ts for the exact allowed
 * column set.
 */
export async function GET() {
  const csv = buildCatalogCsv(getAllProducts());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="powermatchlab-power-station-specs-2026.csv"',
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
