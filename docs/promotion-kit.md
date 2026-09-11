# PowerMatchLab Promotion Kit

Internal reference material for describing and pitching PowerMatchLab's free tools to third parties. **Nothing in this file has been sent, posted, or published anywhere** — it's copy ready to use if and when outreach is authorized. It contains no fabricated metrics, testimonials, traffic numbers, or claims of existing partnerships; any numbers a specific pitch needs (subscriber counts, etc.) must be filled in from real data at the time, not invented here.

## What PowerMatchLab is (for context in any pitch)

PowerMatchLab is an independent, ad-supported / Amazon-affiliate decision-support site for portable power stations. It publishes calculators, a side-by-side comparison tool, and sizing guides — no paid placements affect rankings, and every spec is manufacturer-sourced with unverified fields explicitly labeled "Not verified." See `/about-methodology` and `/editorial-policy` on the live site for the full methodology.

---

## Tool descriptions

### Power Calculator (`/power-calculator`)

**Short description (1 sentence):**
A free calculator that turns a list of your devices into a recommended power station capacity and output, then shows which real, currently-tracked models can actually deliver it.

**Long description (for a resource-page listing or roundup):**
PowerMatchLab's Power Calculator lets you add the devices you want to power — starting from pre-loaded examples like a refrigerator, CPAP machine, or sump pump, or entering your own — set how many hours a day you'll run them and for how many days, and get back a recommended minimum watt-hour capacity and continuous/surge output target. It then checks that target against PowerMatchLab's tracked catalog and labels each model Best Match, Good Match, Possible Match, or Not Suitable, with the reason shown for each. All assumptions (usable-energy percentage, reserve headroom) are visible and adjustable, and every example appliance's wattage is editable — nothing is a black box.

### Compare tool (`/compare`)

**Short description:**
A free side-by-side spec comparison tool for portable power stations — pick up to four, and share your exact comparison with a link.

**Long description:**
Select up to four power stations and compare capacity, output, surge rating, charging speed, weight and more in one table, with the best verified value in each row highlighted automatically. A comparison can be shared or bookmarked via a plain URL (`/compare?ids=...`) — no login or export step required. Blank cells mean a spec isn't independently verified, never a guessed zero.

### Solar Charging Time Calculator (embedded in the solar-charging guide, `/guides/how-long-to-charge-power-station-with-solar`)

**Short description:**
A calculator that estimates how long a power station takes to recharge from a solar panel, accounting for real-world panel efficiency losses most estimates ignore.

**Long description:**
Enter a station's capacity, a panel's rated watts, an estimated real-world efficiency percentage, and start/target charge levels, and this calculator returns an estimated charging time with the formula shown — plus a reference table at 100 W, 200 W, 400 W and 800 W panel sizes. It explicitly separates "hours of daylight" from "hours of usable peak sun," which is where most back-of-envelope solar estimates go wrong.

### Watt-Hour Calculator (embedded in `/guides/watts-vs-watt-hours`)

**Short description:**
A one-field calculator that converts a device's running watts and hours of use into total watt-hours — the exact number that determines battery drain.

**Long description:**
Watts and watt-hours are the two most commonly confused specs on any power station listing. This tool takes a device's running watts and hours of use and returns the watt-hours it will actually consume, with the formula shown, so the arithmetic never has to be done by hand.

### Appliance Power Consumption Table (`/guides/appliance-power-consumption-table`)

**Short description:**
A single reference table of running watts, startup surge, and example daily hours for common household and outdoor appliances — the same data that powers PowerMatchLab's calculator.

**Long description:**
A quick-lookup table covering refrigerators, freezers, routers, laptops, CPAP machines, sump and well pumps, space heaters, RV equipment and more, with running watts, typical startup surge (for motor-driven appliances), and example daily hours for each — sourced from the same dataset the Power Calculator itself uses, so the two never drift out of sync.

---

## Outreach pitch template (for camping / off-grid energy / emergency-preparedness sites)

Use as a starting draft, not a final message — personalize per recipient and verify every claim before sending. Do not send without explicit authorization.

> Subject: A free power-sizing calculator that might be useful for [site name]'s readers
>
> Hi [name],
>
> I came across [specific post/page on their site] and thought your readers sizing a power station for [camping / an outage / a CPAP machine / etc.] might find PowerMatchLab's Power Calculator useful: [link]. It's free, has no login, and shows its math — you enter your devices, and it recommends a capacity/output target and checks it against a tracked catalog, labeling anything that doesn't clear the requirement rather than hiding it.
>
> There's also a comparison tool with shareable links ([link]) and a solar-charging-time calculator ([link]) that might be relevant if you cover solar setups.
>
> No ask here beyond a look — happy to answer any questions about the methodology if useful. [Link to /about-methodology for transparency.]
>
> Thanks for the work you put into [their site].
>
> [Name]

## Relevant site types for outreach (categories, not a contact list)

- Camping and overlanding gear review/blog sites
- RV and van-life lifestyle blogs and forums
- Off-grid living and homesteading resources
- Emergency-preparedness / "prepper" resource sites
- Home-improvement sites with a backup-power or generator category
- CPAP/sleep-apnea patient community resources (for the CPAP sizing guide specifically — pitch only the electrical-sizing angle, never anything medical)
- Personal-finance or "smart home" blogs with an energy-saving angle

## Social post ideas (drafts — verify and personalize before posting; not posted)

- "Watts vs. watt-hours in one sentence: watts is a rate, watt-hours is a total. [link to guide] has the plain-English breakdown plus a 1-field calculator."
- "Sizing a power station for a refrigerator during an outage? The compressor's startup surge usually matters more than people expect. [link]"
- "Free tool: tell it what you want to power, it tells you the watt-hours and watts you actually need — no email required. [link to calculator]"
- "Solar charging estimates are almost always optimistic because they use the panel's rated watts, not real-world output. Here's the corrected formula + a calculator. [link]"
- "Comparing two power stations? [link to /compare] lets you pick up to 4 and share the exact comparison via URL."

## Calculator intro/pitch copy (for embedding in a partner article, with attribution)

> **Try PowerMatchLab's free Power Calculator** — add the devices you want to power, and it calculates the capacity and output you need, then shows which power stations can actually deliver it. No login, no email required. [Try it →](https://www.powermatchlab.com/power-calculator)

Attribution requirement for any embedded or reproduced calculator copy: a visible link back to `powermatchlab.com` and the name "PowerMatchLab" credited as the source.

---

## What this kit deliberately does not include

- No fabricated subscriber counts, traffic numbers, or "as seen on" claims.
- No pre-written testimonials or reviews.
- No list of actual contacts or sent messages — outreach requires explicit authorization and real research into each recipient before any message goes out.
- No embeddable iframe widget yet — the calculators are not currently packaged for third-party embedding; that would be a separate engineering task if pursued.
