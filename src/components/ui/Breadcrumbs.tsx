import Link from "next/link";
import type { Crumb } from "@/lib/seo";

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-navy-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-navy-700">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-brand-700">
                  {c.name}
                </Link>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
