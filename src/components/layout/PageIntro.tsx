import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { Crumb } from "@/lib/seo";

export function PageIntro({
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
    <div className="relative overflow-hidden border-b border-navy-100 bg-gradient-to-b from-navy-50 to-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-radial-glow-brand opacity-60"
      />
      <div className="container-page relative py-8 sm:py-10">
        {crumbs ? (
          <div className="mb-4">
            <Breadcrumbs crumbs={crumbs} />
          </div>
        ) : null}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {lead ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-navy-600">{lead}</p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
