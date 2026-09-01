import Link from "next/link";
import { PRIMARY_NAV } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold">This page could not be found</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-navy-600">
        The link may be old or mistyped. Here is where to go next.
      </p>
      <nav aria-label="Suggested pages" className="mt-6">
        <ul className="flex flex-wrap justify-center gap-2">
          {PRIMARY_NAV.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                className="rounded-md border border-navy-200 px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
