"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV } from "@/lib/site";
import { cn } from "@/lib/cn";
import {
  CalculatorIcon,
  GridIcon,
  HomeIcon,
  InfoIcon,
  ScaleIcon,
} from "@/components/ui/icons";

const ICONS: Record<string, typeof HomeIcon> = {
  "/": HomeIcon,
  "/power-calculator": CalculatorIcon,
  "/compare": ScaleIcon,
  "/products": GridIcon,
  "/guides": InfoIcon,
};

/** Bottom navigation for small screens (see mobile reference). */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-400/10 bg-navy-900/95 shadow-[0_-1px_12px_rgba(0,0,0,0.35)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-content items-stretch justify-between px-2">
        {MOBILE_NAV.map((item) => {
          const Icon = ICONS[item.href] ?? InfoIcon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors duration-200",
                  active ? "text-cyan-300" : "text-navy-400",
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute -top-px h-[2px] w-6 rounded-full bg-cyan-500"
                  />
                ) : null}
                <Icon width={20} height={20} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
