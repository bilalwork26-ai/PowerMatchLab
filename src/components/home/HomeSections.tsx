import Link from "next/link";
import type { Product } from "@/types/product";
import type { ProductScore } from "@/lib/score";
import { ProductCard } from "@/components/product/ProductCard";
import { BEST_FOR_NAV } from "@/lib/site";
import {
  BoltIcon,
  CalculatorIcon,
  FridgeIcon,
  HomeIcon,
  RvIcon,
  ScaleIcon,
  ShieldIcon,
  SunIcon,
  TentIcon,
} from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="bg-navy-900 text-white">
      <div className="container-page grid gap-8 py-14 lg:grid-cols-[1.2fr_1fr] lg:py-20">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Find the Right Power Station for Your Needs.
          </h1>
          <p className="mt-4 max-w-xl text-navy-200">
            Compare portable power stations, calculate what you actually need, and
            choose the best option for camping, RV, refrigerator backup and home
            backup — with no invented prices, ratings or reviews.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/power-calculator" size="lg" variant="primary">
              <CalculatorIcon width={18} height={18} />
              Use Power Calculator
            </ButtonLink>
            <ButtonLink href="/compare" size="lg" variant="secondary">
              <ScaleIcon width={18} height={18} />
              Compare Products
            </ButtonLink>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {[
              ["10", "Power stations tracked"],
              ["100%", "Unbiased — no paid placement"],
              ["Manufacturer specs", "Clearly labelled as claims"],
              ["Verified links", "Direct to Amazon USA"],
            ].map(([big, small]) => (
              <div key={small}>
                <dt className="text-lg font-semibold text-white">{big}</dt>
                <dd className="text-xs text-navy-300">{small}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-2xl border border-navy-700 bg-navy-800/60 p-6">
            <p className="text-sm font-medium text-navy-200">The core journey</p>
            <ol className="mt-3 space-y-3 text-sm">
              {[
                "Calculate your real power needs",
                "See only stations that can actually run your load",
                "Compare the shortlist side by side",
                "Open the product page and check the specs",
                "Follow a verified link to Amazon",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-navy-100">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

const TOOLS = [
  {
    href: "/power-calculator",
    title: "Power Calculator",
    body: "Enter your devices and usage to calculate the energy and power you need — with transparent assumptions you can adjust.",
    cta: "Start calculating",
    Icon: CalculatorIcon,
  },
  {
    href: "/compare",
    title: "Compare Side by Side",
    body: "Line up to four power stations and see the specs, plus a PowerMatch Score where the data justifies one.",
    cta: "Start comparing",
    Icon: ScaleIcon,
  },
  {
    href: "/products",
    title: "Find Best For You",
    body: "Filter the catalog by capacity, output, chemistry, weight, solar, 240V, TT-30 and more — only on data we actually have.",
    cta: "Browse products",
    Icon: BoltIcon,
  },
];

export function ToolsSection() {
  return (
    <section className="container-page py-14">
      <h2 className="text-center text-2xl font-bold">Powerful Tools to Help You Decide</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {TOOLS.map(({ href, title, body, cta, Icon }) => (
          <Link
            key={href}
            href={href}
            className="card group flex flex-col p-5 transition-shadow hover:shadow-lg"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <Icon />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 flex-1 text-sm text-navy-600">{body}</p>
            <span className="mt-4 text-sm font-semibold text-brand-700 group-hover:underline">
              {cta} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TopProducts({
  items,
}: {
  items: { product: Product; score: ProductScore }[];
}) {
  return (
    <section className="border-y border-navy-100 bg-white py-14">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Top Power Stations (Our Current Picks)</h2>
            <p className="mt-1 text-sm text-navy-600">
              The V1 catalog, ordered by PowerMatch Score. Scores compare these
              units with each other, not the whole market.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:underline sm:block"
          >
            View all products →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(({ product, score }) => (
            <ProductCard key={product.id} product={product} score={score} />
          ))}
        </div>
        <div className="mt-6 sm:hidden">
          <Link
            href="/products"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            View all products →
          </Link>
        </div>
      </div>
    </section>
  );
}

const USE_CASES = [
  {
    href: "/best-for-camping",
    title: "Best for Camping",
    body: "Lightweight, portable and quiet units for outdoor adventures.",
    Icon: TentIcon,
  },
  {
    href: "/best-for-rv",
    title: "Best for RV",
    body: "Units with the right outlets, output and expansion for life on the road.",
    Icon: RvIcon,
  },
  {
    href: "/best-for-refrigerator-backup",
    title: "Best for Refrigerator Backup",
    body: "Handle the compressor surge and keep food cold through an outage.",
    Icon: FridgeIcon,
  },
  {
    href: "/best-for-home-backup",
    title: "Best for Home Backup",
    body: "Fast switchover and enough capacity for your essential circuit.",
    Icon: HomeIcon,
  },
];

export function UseCaseCards() {
  return (
    <section className="container-page py-14">
      <h2 className="text-center text-2xl font-bold">
        Find the Best Power Station for Your Use
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map(({ href, title, body, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group relative overflow-hidden rounded-xl border border-navy-800 bg-navy-900 p-5 text-white transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600">
              <Icon />
            </span>
            <h3 className="mt-4 text-base font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-navy-300">{body}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-brand-300 group-hover:underline">
              View picks →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const TRUST = [
  {
    title: "Verified data",
    body: "Every spec is a manufacturer claim tied to an official source and a last-verified date. Unknowns stay “Not verified”.",
    Icon: ShieldIcon,
  },
  {
    title: "Transparent calculations",
    body: "The calculator shows its formulas and lets you change the efficiency and reserve assumptions.",
    Icon: CalculatorIcon,
  },
  {
    title: "Fair comparisons",
    body: "We never invent a score to fill a chart. If the data does not justify a dimension, it is not shown.",
    Icon: ScaleIcon,
  },
  {
    title: "No fake urgency",
    body: "No countdown timers, invented discounts or “only 2 left” warnings. Deals appear only when verified.",
    Icon: SunIcon,
  },
];

export function TrustBand() {
  return (
    <section className="border-y border-navy-100 bg-white py-12">
      <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.map(({ title, body, Icon }) => (
          <div key={title} className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <Icon width={18} height={18} />
            </span>
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-navy-600">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinalCalculatorCta() {
  return (
    <section className="container-page py-14">
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-8 text-center text-white sm:flex-row sm:text-left">
        <div>
          <h2 className="text-xl font-bold">Not sure which power station is right for you?</h2>
          <p className="mt-1 text-sm text-navy-300">
            Use the calculator to get an explainable recommendation in under a minute.
          </p>
        </div>
        <ButtonLink href="/power-calculator" size="lg" variant="primary" className="shrink-0">
          Start Power Calculator
        </ButtonLink>
      </div>
      <p className="mt-6 text-center text-xs text-navy-500">
        Prefer to read first?{" "}
        {BEST_FOR_NAV.map((b, i) => (
          <span key={b.href}>
            <Link href={b.href} className="underline hover:text-brand-700">
              {b.label}
            </Link>
            {i < BEST_FOR_NAV.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
    </section>
  );
}
