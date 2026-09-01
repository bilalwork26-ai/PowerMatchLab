import type { Metadata } from "next";
import { getAllProducts } from "@/data/products";
import { pageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { PageIntro } from "@/components/layout/PageIntro";
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
      <PageIntro
        title="Power Calculator"
        lead="Tell us what you need to run and for how long. We calculate the energy and power you need and show which stations can actually deliver it — with the reasons."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Power Calculator", path: "/power-calculator" },
        ]}
      />
      <PowerCalculator catalog={catalog} />

      <section className="container-page pb-16">
        <h2 className="text-lg font-bold">Power Calculator FAQ</h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((f) => (
            <div key={f.question} className="card p-4">
              <dt className="font-semibold text-navy-900">{f.question}</dt>
              <dd className="mt-1 text-sm text-navy-600">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
