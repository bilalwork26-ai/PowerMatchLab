import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import type { ProductScore } from "@/lib/score";
import { getAllProducts } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { BEST_FOR_NAV } from "@/lib/site";
import {
  BoltIcon,
  CalculatorIcon,
  CheckIcon,
  PlusIcon,
  ScaleIcon,
  ShieldIcon,
  SunIcon,
} from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedStat } from "@/components/ui/AnimatedStat";
import { EnergyLines } from "@/components/ui/EnergyLines";
import { HeroVisual } from "@/components/home/HeroVisual";

/**
 * The whole home page is one continuous dark-navy canvas (Header and
 * Footer are already dark navy at the layout level) — every section below
 * uses navy/glass surfaces rather than switching to a light background,
 * matching the approved reference design. Every other route is unaffected.
 */

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

      <div className="container-page relative grid gap-10 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24">
        <Reveal>
          <h1 className="text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-[3.4rem]">
            Find the Right Power Station.{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-brand-300 bg-clip-text text-transparent">
              Fast.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-navy-200">
            Tell us what you need to power. We calculate, compare, and show the
            right options — with no invented prices, ratings or reviews.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/power-calculator" size="lg" variant="primary">
              <CalculatorIcon width={18} height={18} />
              Use Power Calculator
            </ButtonLink>
            <ButtonLink href="/compare" size="lg" variant="secondary">
              <ScaleIcon width={18} height={18} />
              Compare Products
            </ButtonLink>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
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
          <HeroVisual />
        </Reveal>
      </div>

      <div className="relative border-t border-navy-800/80">
        <div className="container-page grid gap-4 py-10 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ n, title, body, Icon }, i) => (
            <Reveal key={n} delayMs={n * 80} className="relative">
              {i < HOW_IT_WORKS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="energy-particles absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-cyan-400/60 sm:block"
                />
              ) : null}
              <div className="glass-panel flex h-full items-start gap-3 p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-glow-cyan">
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
    <section className="bg-navy-950 py-16 text-white">
      <div className="container-page">
        <Reveal>
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Powerful Tools to Help You Decide
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TOOLS.map(({ href, title, body, cta, Icon }, i) => (
            <Reveal key={href} delayMs={i * 80}>
              <Link
                href={href}
                className="glass-panel group flex h-full flex-col p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-glow-cyan"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 text-navy-950 shadow-glow-soft">
                  <Icon />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 flex-1 text-sm text-navy-300">{body}</p>
                <span className="mt-4 text-sm font-semibold text-cyan-300 group-hover:underline">
                  {cta} →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TopProducts({
  items,
}: {
  items: { product: Product; score: ProductScore }[];
}) {
  const featured = items.slice(0, 4);
  return (
    <section className="bg-navy-900 py-16 text-white">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Popular Power Stations</h2>
              <p className="mt-2 max-w-xl text-sm text-navy-300">
                A quick look at our current top picks by PowerMatch Score. See
                the full working catalog — all {items.length} products — with
                filters on the Products page.
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 text-sm font-semibold text-cyan-300 hover:underline"
            >
              View all products →
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map(({ product, score }, i) => (
            <Reveal key={product.id} delayMs={i * 70}>
              <ProductCard product={product} score={score} tone="dark" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const USE_CASES = [
  {
    href: "/best-for-camping",
    title: "Camping & Outdoors",
    body: "Lightweight, portable and quiet units for outdoor adventures.",
    image: "/marketing/use-case-camping.png",
    alt: "A tent glowing warmly at dusk beside a mountain lake, with camp chairs and a lantern set up outside — illustrating a typical camping setup.",
    cta: "View picks →",
  },
  {
    href: "/best-for-rv",
    title: "Van Life & RV",
    body: "Units with the right outlets, output and expansion for life on the road.",
    image: "/marketing/use-case-van-rv.png",
    alt: "A camper van parked beside a mountain lake at sunset with camp chairs and a fire pit set up nearby — illustrating a typical van life or RV setup.",
    cta: "View picks →",
  },
  {
    href: "/best-for-home-backup",
    title: "Home Backup",
    body: "Fast switchover and enough capacity for your essential circuit.",
    image: "/marketing/use-case-home-backup.png",
    alt: "A warmly lit modern home kitchen and living room in the evening — illustrating typical home-backup use.",
    cta: "View picks →",
  },
  {
    href: "/products",
    title: "Work & Remote Sites",
    body: "Power tools, laptops and equipment away from a wall outlet.",
    image: "/marketing/use-case-remote-work.png",
    alt: "A worker in safety gear servicing equipment at a remote mountain site, with a portable generator nearby — illustrating off-grid work use.",
    cta: "Browse products →",
  },
  {
    href: "/products",
    title: "Boating & Off-Grid",
    body: "Reliable power for electronics and equipment away from shore.",
    image: "/marketing/use-case-boating-off-grid.png",
    alt: "A boat anchored in a calm bay at sunset — illustrating boating and off-grid use.",
    cta: "Browse products →",
  },
];

export function UseCaseCards() {
  return (
    <section className="bg-navy-950 py-16 text-white">
      <div className="container-page">
        <Reveal>
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Find the Best Power Station for Your Use
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-5">
          {USE_CASES.map(({ href, title, body, image, alt, cta }, i) => (
            <Reveal key={href} delayMs={i * 70}>
              <Link
                href={href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-navy-800 shadow-glow-soft transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-glow-cyan"
              >
                <Image
                  src={image}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-navy-950/5"
                />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-base font-semibold text-white drop-shadow">{title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-navy-200">{body}</p>
                  <span className="mt-2 inline-block text-xs font-semibold text-cyan-300 group-hover:underline">
                    {cta}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
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
    <section className="border-y border-navy-800 bg-navy-900 py-14 text-white">
      <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.map(({ title, body, Icon }, i) => (
          <Reveal key={title} delayMs={i * 60}>
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-800 text-cyan-300">
                <Icon width={18} height={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-navy-300">{body}</p>
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
    <section className="bg-navy-950 py-16">
      <div className="container-page">
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
        <p className="mt-6 text-center text-xs text-navy-300">
          Prefer to read first?{" "}
          {BEST_FOR_NAV.map((b, i) => (
            <span key={b.href}>
              <Link href={b.href} className="underline hover:text-cyan-300">
                {b.label}
              </Link>
              {i < BEST_FOR_NAV.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
