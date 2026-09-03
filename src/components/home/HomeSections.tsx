import Link from "next/link";
import type { Product } from "@/types/product";
import type { ProductScore } from "@/lib/score";
import { getAllProducts } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { BEST_FOR_NAV } from "@/lib/site";
import {
  BoltIcon,
  CalculatorIcon,
  CheckIcon,
  FridgeIcon,
  HomeIcon,
  PlusIcon,
  RvIcon,
  ScaleIcon,
  ShieldIcon,
  SunIcon,
  TentIcon,
} from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedStat } from "@/components/ui/AnimatedStat";
import { EnergyLines } from "@/components/ui/EnergyLines";
import { HeroDeviceGraphic } from "@/components/home/HeroDeviceGraphic";

const HERO_TRUST = [
  { label: "Verified specifications", Icon: ShieldIcon },
  { label: "Transparent calculations", Icon: CalculatorIcon },
  { label: "No paid placement", Icon: CheckIcon },
];

const HOW_IT_WORKS = [
  {
    n: 1,
    title: "Add your devices",
    body: "Tell us what you want to power and for how long.",
    Icon: PlusIcon,
  },
  {
    n: 2,
    title: "See what fits",
    body: "We calculate the power you need and show matching stations.",
    Icon: BoltIcon,
  },
  {
    n: 3,
    title: "Compare your options",
    body: "Compare specs side by side and choose with confidence.",
    Icon: ScaleIcon,
  },
];

export function Hero() {
  const stationCount = getAllProducts().length;

  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <EnergyLines className="opacity-70" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-radial-glow-brand"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-radial-glow-cyan"
      />

      <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-20">
        <Reveal>
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

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {HERO_TRUST.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-1.5 text-sm text-navy-200">
                <Icon width={16} height={16} className="text-cyan-300" />
                {label}
              </li>
            ))}
          </ul>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <div>
              <dt className="text-lg font-semibold text-white">
                <AnimatedStat value={stationCount} />
              </dt>
              <dd className="text-xs text-navy-300">Power stations tracked</dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-white">
                <AnimatedStat value={100} suffix="%" />
              </dt>
              <dd className="text-xs text-navy-300">Unbiased — no paid placement</dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-white">Manufacturer specs</dt>
              <dd className="text-xs text-navy-300">Clearly labelled as claims</dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-white">Verified links</dt>
              <dd className="text-xs text-navy-300">Direct to Amazon USA</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delayMs={120}>
          <HeroDeviceGraphic />
        </Reveal>
      </div>

      <div className="border-t border-navy-800/80 bg-navy-950/40">
        <div className="container-page grid gap-4 py-8 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ n, title, body, Icon }) => (
            <Reveal key={n} delayMs={n * 80}>
              <div className="flex h-full items-start gap-3 rounded-xl border border-navy-800 bg-navy-800/40 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 text-sm font-bold text-navy-950 shadow-glow-cyan">
                  {n}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <Icon width={15} height={15} className="text-cyan-300" />
                    {title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-navy-300">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
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
      <Reveal>
        <h2 className="text-center text-2xl font-bold">Powerful Tools to Help You Decide</h2>
      </Reveal>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {TOOLS.map(({ href, title, body, cta, Icon }, i) => (
          <Reveal key={href} delayMs={i * 80}>
            <Link href={href} className="card-interactive group flex h-full flex-col p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-100">
                <Icon />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 flex-1 text-sm text-navy-600">{body}</p>
              <span className="mt-4 text-sm font-semibold text-brand-700 group-hover:underline">
                {cta} →
              </span>
            </Link>
          </Reveal>
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
        <Reveal>
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
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(({ product, score }, i) => (
            <Reveal key={product.id} delayMs={(i % 4) * 60}>
              <ProductCard product={product} score={score} />
            </Reveal>
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
      <Reveal>
        <h2 className="text-center text-2xl font-bold">
          Find the Best Power Station for Your Use
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map(({ href, title, body, Icon }, i) => (
          <Reveal key={href} delayMs={i * 70}>
            <Link
              href={href}
              className="group relative block overflow-hidden rounded-xl border border-navy-800 bg-gradient-to-b from-navy-800 to-navy-900 p-5 text-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-glow-cyan"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
                <Icon />
              </span>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-navy-300">{body}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-cyan-300 group-hover:underline">
                View picks →
              </span>
            </Link>
          </Reveal>
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
        {TRUST.map(({ title, body, Icon }, i) => (
          <Reveal key={title} delayMs={i * 60}>
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Icon width={18} height={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-navy-600">{body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FinalCalculatorCta() {
  return (
    <section className="container-page py-14">
      <Reveal>
        <div className="surface-dark relative overflow-hidden px-6 py-8 text-white">
          <EnergyLines className="opacity-40" />
          <div className="relative flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
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
        </div>
      </Reveal>
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
