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
    <footer className="mt-16 border-t border-navy-100 bg-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="dark" />
          <p className="mt-3 max-w-xs text-sm text-navy-600">{SITE.description}</p>
        </div>

        <nav aria-label="Site" className="text-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
            Explore
          </h2>
          <ul className="space-y-2">
            {PRIMARY_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-navy-700 hover:text-brand-700">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Best for" className="text-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
            Best for your use
          </h2>
          <ul className="space-y-2">
            {BEST_FOR_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-navy-700 hover:text-brand-700">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Trust and legal" className="text-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
            Trust &amp; legal
          </h2>
          <ul className="space-y-2">
            {LEGAL_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-navy-700 hover:text-brand-700">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-navy-100 bg-navy-50">
        <div className="container-page py-6 text-xs leading-6 text-navy-600">
          <p className="mb-2">
            <strong className="font-semibold text-navy-800">
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
          <p className="mt-3 text-navy-500">
            © {year} PowerMatchLab. Market: {SITE.market}.
          </p>
        </div>
      </div>
    </footer>
  );
}
