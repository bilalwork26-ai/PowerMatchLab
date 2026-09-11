/**
 * Layout-matching placeholder for <CompareView>, shown only while the page
 * segment (which reads ?ids= via useSearchParams) is still resolving. It
 * mirrors the real selection tray + product-card row so nothing shifts once
 * the real content swaps in, and says explicitly what's loading rather than
 * a bare "Loading…".
 */
export function CompareSkeleton() {
  return (
    <div className="animate-pulse bg-navy-950 py-8 text-white" aria-hidden="true">
      <div className="container-page">
        <div className="glass-panel bg-navy-900/60 p-4">
          <div className="h-4 w-40 rounded bg-navy-800" />
          <div className="mt-3 flex gap-2">
            <div className="h-8 w-32 rounded-full bg-navy-800" />
            <div className="h-8 w-32 rounded-full bg-navy-800" />
          </div>
        </div>
        <p className="mt-4 text-sm text-navy-400">Loading products…</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-panel h-48 bg-navy-900/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
