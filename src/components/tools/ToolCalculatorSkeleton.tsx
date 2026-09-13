/**
 * Layout-matching placeholder shown only while the calculator segment
 * (which reads a shared-link's search params via useSearchParams) is still
 * resolving — same rationale as CompareSkeleton for /compare. Every /tools
 * calculator is statically generated; this placeholder is what a visitor
 * sees for the brief instant before hydration, never a real loading state
 * for data that's actually being fetched.
 */
export function ToolCalculatorSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-10 w-full rounded-md bg-navy-800" />
      <div className="mt-4 h-40 w-full rounded-lg bg-navy-800" />
      <div className="mt-6 h-24 w-full rounded-lg bg-navy-800" />
    </div>
  );
}
