import Link from "next/link";
import {
  AFFILIATE_DISCLOSURE_SHORT,
  BEST_FOR_NAV,
  LEGAL_NAV,
  PRIMARY_NAV,
  SITE,
} from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-cyan-400/10 bg-navy-900 text-navy-200">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
      />
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="light" />
          <p className="mt-3 max-w-xs text-sm text-navy-300">{SITE.description}</p>
        </div>

        <nav aria-label="Site" className="text-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-300">
            Explore
          </h2>
          <ul className="space-y-2">
            {PRIMARY_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-navy-200 hover:text-cyan-300">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Best for" className="text-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-300">
            Best for your use
          </h2>
          <ul className="space-y-2">
            {BEST_FOR_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-navy-200 hover:text-cyan-300">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Trust and legal" className="text-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-300">
            Trust &amp; legal
          </h2>
          <ul className="space-y-2">
            {LEGAL_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-navy-200 hover:text-cyan-300">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-navy-800 bg-navy-950">
        <div className="container-page py-6 text-xs leading-6 text-navy-300">
          <p className="mb-2">
            <strong className="font-semibold text-navy-200">
              Affiliate disclosure:
            </strong>{" "}
            {AFFILIATE_DISCLOSURE_SHORT}
          </p>
          <p>
            PowerMatchLab publishes calculations and editorial assessments, not
            laboratory test results. Specifications are manufacturer claims unless
            stated otherwise; unverified values are shown as “Not verified”.
            Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its
            affiliates.
          </p>
          <p className="mt-3 text-navy-300">
            © {year} PowerMatchLab. Market: {SITE.market}.
          </p>
        </div>
      </div>
    </footer>
  );
}
