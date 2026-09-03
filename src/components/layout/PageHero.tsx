import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EnergyLines } from "@/components/ui/EnergyLines";
import type { Crumb } from "@/lib/seo";

/**
 * Dark navy page-opener band, same props as PageIntro (drop-in
 * replacement) — used on the tool/listing pages (Products, Compare,
 * Power Calculator, Guides, Deals) so every page opens on the same dark
 * "tech" surface as Home, instead of the lighter PageIntro. The dense
 * content below (tables, filters, forms) stays on a light surface for
 * readability; only this opening band is dark.
 */
export function PageHero({
  title,
  lead,
  crumbs,
  children,
}: {
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-navy-900 text-white">
      <EnergyLines className="opacity-40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-radial-glow-cyan opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-radial-glow-brand opacity-60"
      />
      <div className="container-page relative py-10 sm:py-14">
        {crumbs ? (
          <div className="mb-4">
            <Breadcrumbs crumbs={crumbs} tone="dark" />
          </div>
        ) : null}
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        {lead ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-navy-200">{lead}</p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
