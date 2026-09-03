import type { Metadata } from "next";
import { getAllProducts } from "@/data/products";
import { pageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { PowerCalculator } from "@/components/calculator/PowerCalculator";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Power Calculator",
  description:
    "Work out the capacity and output you actually need. Add your devices, set how long you need them, and get an explainable recommendation from the PowerMatchLab catalog.",
  path: "/power-calculator",
});

const FAQ = [
  {
    question: "How does the Power Calculator estimate the capacity I need?",
    answer:
      "It multiplies each device's running watts by quantity and hours per day to get daily energy, multiplies by your days of autonomy, divides by an assumed usable efficiency (default 85%), then adds reserve headroom (default 20%). All assumptions are adjustable.",
  },
  {
    question: "Does it use my real device wattages?",
    answer:
      "It uses whatever you enter. The example appliances are starting points, not universal figures — you should edit every value to match your own devices.",
  },
  {
    question: "Why is a product marked Not Suitable instead of hidden?",
    answer:
      "If a unit cannot meet your required continuous output or capacity, we label it Not Suitable and explain why, rather than removing it. That keeps the shortlist honest.",
  },
];

export default function PowerCalculatorPage() {
  const catalog = getAllProducts();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Power Calculator", path: "/power-calculator" },
          ]),
          faqJsonLd(FAQ),
        ]}
      />
      <PageHero
        title="Power Calculator"
        lead="Tell us what you need to run and for how long. We calculate the energy and power you need and show which stations can actually deliver it — with the reasons."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Power Calculator", path: "/power-calculator" },
        ]}
      />
      <PowerCalculator catalog={catalog} />

      <section className="bg-navy-950 pb-16 pt-2 text-white">
        <div className="container-page">
          <h2 className="text-lg font-bold text-white">Power Calculator FAQ</h2>
          <div className="mt-4 space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.question}
                className="group rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-4 open:shadow-glow-soft"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-white">
                  {f.question}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-cyan-300 transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 animate-fade-up text-sm text-navy-300">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
