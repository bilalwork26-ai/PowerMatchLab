import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  DEFAULT_ASSUMPTIONS,
  ASSUMPTION_NOTES,
  RUNTIME_EFFICIENCY,
} from "@/lib/assumptions";
import { SCORE_MODEL, MIN_DIMENSIONS_FOR_OVERALL } from "@/lib/score";

export const metadata: Metadata = pageMetadata({
  title: "About & Methodology",
  description:
    "How PowerMatchLab works: what we calculate, what is a manufacturer claim, how the PowerMatch Score is built, and the limits of our runtime estimates. We do not physically test products.",
  path: "/about-methodology",
});

export default function MethodologyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About / Methodology", path: "/about-methodology" },
        ])}
      />
      <PageHero
        title="About &amp; Methodology"
        lead="PowerMatchLab is an independent decision-support site. We help you work out what power station you need and compare the options — we do not sell products and we do not physically test them."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About / Methodology", path: "/about-methodology" },
        ]}
      />

      <div className="bg-navy-950 py-10">
      <div className="container-page prose-pml max-w-3xl">
        <h2>What PowerMatchLab is</h2>
        <p>
          PowerMatchLab compares portable power stations for the United States
          market and helps visitors size their needs. It is reader-supported:
          as an Amazon Associate I earn from qualifying purchases made through
          our links, at no cost to you. We do not accept payment for placement,
          ratings or reviews.
        </p>

        <h2>Three kinds of statement</h2>
        <p>Every number on the site is one of these, and we label which:</p>
        <ul>
          <li>
            <strong>Manufacturer claim</strong> — a specification published by
            the maker. Tied to an official source and a “last verified” date on
            each product page. We have not independently measured it.
          </li>
          <li>
            <strong>PowerMatchLab calculation</strong> — a figure we compute from
            your inputs or from published specs using the documented assumptions
            below (for example the Power Calculator result and runtime estimates).
          </li>
          <li>
            <strong>Editorial assessment</strong> — our judgement, such as the
            PowerMatch Score or the pros and cons framing. Explainable, but a
            judgement.
          </li>
        </ul>
        <p>
          When a value is unknown we keep it empty internally and show{" "}
          <strong>“Not verified”</strong> where the interface needs something
          visible. We never substitute <code>0</code>, <code>false</code> or
          “N/A” for a genuine unknown.
        </p>

        <h2 id="calculator">Power Calculator</h2>
        <p>The calculator is deterministic. For each device:</p>
        <ul>
          <li>
            <code>continuous watts = running watts × quantity</code>
          </li>
          <li>
            <code>daily energy (Wh) = continuous watts × hours per day</code>
          </li>
        </ul>
        <p>Then across all devices:</p>
        <ul>
          <li>
            <code>total energy demand = sum of daily energy × days of autonomy</code>
          </li>
          <li>
            <code>
              required usable capacity = total energy demand ÷ usable efficiency
            </code>
          </li>
          <li>
            <code>
              recommended minimum capacity = required usable capacity × (1 +
              reserve)
            </code>
          </li>
          <li>
            <code>
              required continuous output = sum of continuous watts (assumes
              simultaneous use)
            </code>
          </li>
          <li>
            <code>
              required surge = total running watts + the single largest startup
              surge above its own running watts
            </code>
          </li>
        </ul>
        <p>
          The example appliances are editable starting points, not universal
          wattages. Invalid entries (negative or non-numeric) are clamped and
          rows with zero power or quantity are ignored in the totals.
        </p>

        <h3>Default assumptions (all adjustable in the calculator)</h3>
        <table>
          <thead>
            <tr>
              <th>Assumption</th>
              <th>Default</th>
              <th>What it means</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Usable efficiency</td>
              <td>{Math.round(DEFAULT_ASSUMPTIONS.systemEfficiency * 100)}%</td>
              <td>{ASSUMPTION_NOTES.systemEfficiency}</td>
            </tr>
            <tr>
              <td>Reserve headroom</td>
              <td>{Math.round(DEFAULT_ASSUMPTIONS.reserveFraction * 100)}%</td>
              <td>{ASSUMPTION_NOTES.reserveFraction}</td>
            </tr>
            <tr>
              <td>Fallback surge multiplier</td>
              <td>{DEFAULT_ASSUMPTIONS.assumedSurgeMultiplier}×</td>
              <td>{ASSUMPTION_NOTES.assumedSurgeMultiplier}</td>
            </tr>
          </tbody>
        </table>

        <h2 id="recommendations">Recommendation engine</h2>
        <p>
          After the calculation, every catalog product is classified against your
          requirement:
        </p>
        <ul>
          <li>
            <strong>Best Match</strong> — meets capacity with reserve, clears the
            continuous load with margin, covers the estimated surge, satisfies
            your stated requirements, and scores reasonably.
          </li>
          <li>
            <strong>Good Match</strong> — meets the required capacity and output
            with some margin.
          </li>
          <li>
            <strong>Possible Match</strong> — meets the bare minimum, or has
            caveats such as an unverified surge rating.
          </li>
          <li>
            <strong>Not Suitable</strong> — fails your required continuous output
            or capacity, or a hard requirement (240V, TT-30). Shown with the
            reason, not hidden.
          </li>
        </ul>

        <h2 id="scoring">PowerMatch Score</h2>
        <p>
          The score is an editorial assessment, normalised against the other
          products currently in the catalog — it answers “how does this compare
          with the others we list”, not “how good is this in absolute terms”. Each
          dimension is scored only when the underlying data exists for that
          product. If fewer than {MIN_DIMENSIONS_FOR_OVERALL} dimensions can be
          scored, no overall number is published.
        </p>
        <table>
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Basis</th>
            </tr>
          </thead>
          <tbody>
            {SCORE_MODEL.map((d) => (
              <tr key={d.key}>
                <td>{d.label}</td>
                <td>{d.basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Noise Level</strong> and <strong>Value for Money</strong> are
          deliberately not scored: the catalog carries no noise measurements and
          no verified prices, so scoring them would mean inventing data. Radar
          charts are only drawn when every plotted series has at least three real
          dimensions.
        </p>

        <h2 id="runtime">Runtime estimates</h2>
        <p>
          Product pages show an estimated runtime table using:
        </p>
        <ul>
          <li>
            <code>
              estimated runtime (h) = capacity_wh × {RUNTIME_EFFICIENCY} ÷ device
              watts
            </code>
          </li>
        </ul>
        <p>
          This is a calculation with an assumed {Math.round(RUNTIME_EFFICIENCY * 100)}%
          usable efficiency, not a measurement. Real runtime depends on the
          device, its duty cycle, temperature and the unit’s age. We label these
          “estimated”, never “guaranteed”.
        </p>

        <h2>Amazon links</h2>
        <p>
          Each product stores both a direct Amazon product URL and an Amazon
          Associates affiliate URL. “Check Price on Amazon” uses the affiliate
          URL when one is stored for that product, and falls back to the direct
          product URL otherwise — never a fabricated tracking ID or an invented
          link. See the{" "}
          <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
        </p>

        <h2>Corrections</h2>
        <p>
          If a specification here is wrong or out of date, that is a bug. The
          canonical dataset is <code>products.json</code>; corrections there flow
          through the whole site.
        </p>
      </div>
      </div>
    </>
  );
}
