/**
 * Print-only summary block — hidden on screen (`hidden`), shown only when
 * printing (`print:block`, Tailwind's built-in print media variant). Pairs
 * with the `print:hidden` classes on the interactive controls elsewhere on
 * the tool page and the sitewide print rules in globals.css, so "Print /
 * Save as PDF" produces a clean report instead of a screenshot of the
 * interactive UI.
 *
 * Every field here restates something already computed or entered
 * elsewhere on the page — this component formats, it never calculates.
 */
export function PrintSummary({
  toolTitle,
  siteUrl,
  formulaText,
  generatedAt,
  inputsSummary,
  assumptionsSummary,
  resultsSummary,
  productCount,
}: {
  toolTitle: string;
  siteUrl: string;
  formulaText: string;
  generatedAt: Date;
  inputsSummary: string[];
  assumptionsSummary: string[];
  resultsSummary: string[];
  productCount: number;
}) {
  return (
    <div className="hidden print:block print:text-black">
      <h2 className="text-lg font-bold">{toolTitle} — PowerMatchLab</h2>
      <p className="text-xs">
        Generated {generatedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} ·{" "}
        {siteUrl}
      </p>

      <h3 className="mt-3 text-sm font-bold">Your inputs</h3>
      <ul className="text-xs">
        {inputsSummary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h3 className="mt-3 text-sm font-bold">PowerMatchLab assumptions</h3>
      <ul className="text-xs">
        {assumptionsSummary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h3 className="mt-3 text-sm font-bold">Formula</h3>
      <p className="text-xs">{formulaText}</p>

      <h3 className="mt-3 text-sm font-bold">Results</h3>
      <ul className="text-xs">
        {resultsSummary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="mt-3 text-xs">
        Compared against all {productCount} products in the PowerMatchLab catalog as of the
        generation date above — see the printed table below for the full comparison.
      </p>

      <p className="mt-3 text-[10px]">
        These are planning estimates from the numbers entered above, computed using
        PowerMatchLab&rsquo;s documented assumptions — not a lab measurement and not a
        guarantee of real-world runtime. Specifications come from manufacturer-published
        data; PowerMatchLab has not physically tested these products unless a specific
        product page states otherwise. Real runtime varies with temperature, appliance
        age and condition, door openings, compressor cycling, and actual solar
        conditions — a 24-hour reading from a plug-in energy meter is more reliable than
        any generic estimate. See {siteUrl}/about-methodology for the full methodology,
        {" "}{siteUrl}/editorial-policy for editorial policy, and {siteUrl}/affiliate-disclosure
        for the affiliate disclosure.
      </p>
    </div>
  );
}
