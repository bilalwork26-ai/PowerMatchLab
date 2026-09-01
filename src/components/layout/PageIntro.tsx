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
    <div className="border-b border-navy-100 bg-white">
      <div className="container-page py-8 sm:py-10">
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
