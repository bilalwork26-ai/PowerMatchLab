import Link from "next/link";
import type { Crumb } from "@/lib/seo";
import { cn } from "@/lib/cn";

export function Breadcrumbs({
  crumbs,
  tone = "light",
}: {
  crumbs: Crumb[];
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm", dark ? "text-navy-300" : "text-navy-500")}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className={dark ? "text-white" : "text-navy-700"}>
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className={dark ? "hover:text-cyan-300" : "hover:text-brand-700"}>
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
