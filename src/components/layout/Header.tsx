"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PRIMARY_NAV } from "@/lib/site";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { MenuIcon, ScaleIcon, XIcon } from "@/components/ui/icons";

export function Header() {
  const pathname = usePathname();
  const { count, ready } = useCompare();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-900 text-white">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo variant="light" />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-navy-800 text-white"
                        : "text-navy-200 hover:bg-navy-800 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/compare"
            className="relative inline-flex items-center gap-1.5 rounded-md border border-navy-700 px-3 py-2 text-sm font-medium text-navy-100 hover:bg-navy-800"
          >
            <ScaleIcon width={16} height={16} />
            <span className="hidden sm:inline">Compare</span>
            {ready && count > 0 ? (
              <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-xs font-semibold text-white">
                {count}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="inline-grid h-10 w-10 place-items-center rounded-md border border-navy-700 text-navy-100 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t border-navy-800 md:hidden">
          <nav aria-label="Mobile" className="container-page py-3">
            <ul className="flex flex-col gap-1">
              {PRIMARY_NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-3 py-2.5 text-sm font-medium",
                        active
                          ? "bg-navy-800 text-white"
                          : "text-navy-200 hover:bg-navy-800",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
