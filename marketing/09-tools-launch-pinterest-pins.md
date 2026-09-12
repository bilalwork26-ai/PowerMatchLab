# Pinterest — 30 Ready-to-Upload Pins for the /tools Calculators (tools_launch_2026)

Status: **prepared, not published** — no Pinterest connector/account access exists in this
session (confirmed via `ListConnectors`, which returned an empty list). Every graphic file
below is a real, finished 1000×1500 PNG (Pinterest's recommended 2:3 vertical ratio),
generated programmatically — not a design description to redo in Canva.

## What's real vs. what still needs a human

- **Real and finished:** the 30 PNG files in `marketing/pins/`, the title/description/alt
  text/board/UTM link for each, and the disclosure line baked into every graphic.
- **Still needs a human with Pinterest access:** creating the boards listed below if they
  don't exist yet, uploading each pin, and pinning it to its board. Nothing has been
  uploaded or scheduled — no URLs are claimed as published.

## How these were made (so they can be regenerated or extended)

- `marketing/scripts/pins-data.mjs` — the 30 pins' content. Every headline, subhead, and
  description fact is drawn directly from the already-published, already-reviewed copy in
  `src/content/tools.ts` (formulas, FAQ answers, "common mistakes" entries) — nothing here
  is a new number invented for this campaign.
- `marketing/scripts/generate-pins.mjs` — renders each pin to a PNG using Playwright/Chromium
  (already available in this environment) against an HTML template that reuses the exact
  navy/cyan palette from `src/lib/og-template.tsx`, so pins look like they came from the
  site. Regenerate all 30 with:
  ```
  node marketing/scripts/generate-pins.mjs
  ```
  This script and its data file are marketing production tooling, not part of the Next.js
  app — they are not imported by anything under `src/`, are excluded from `tsc`'s type
  checking by extension (`.mjs`), and do not affect the build.

## Rules already followed in every pin

- No prices, no invented discounts, no "best"/"cheapest" language.
- No stock photos or Amazon imagery — plain vector-style icons only, drawn in the template.
- Every fact traces back to a sentence already live on the destination calculator page.
- Every pin's on-graphic disclosure line and destination URL are identical in wording/format
  across the batch, varying only by topic and specific claim.
- Every destination URL is UTM-tagged with the `tools_launch_2026` convention (see
  the campaign measurement doc for the full UTM spec).


## Refrigerator & Freezer Runtime (10 pins)

### Pin 1 — fridge-01-formula
- **Graphic file:** `marketing/pins/fridge-01-formula.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** The Real Formula for Sizing Backup Power for a Refrigerator
- **Pinterest description:** Recommended minimum capacity = (daily energy in Wh × days of outage) ÷ usable efficiency × (1 + reserve). Enter your fridge's own running watts and hours, and the free calculator shows which power stations actually meet it.
- **On-pin headline:** The Real Formula Behind Fridge Backup Power Sizing
- **On-pin subhead:** (daily energy × days of outage) ÷ usable efficiency × (1 + reserve) — enter your own numbers
- **Board:** Power Outage Prep
- **Alt text:** Formula diagram for calculating how much power station capacity a refrigerator needs during an outage
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_01
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 2 — fridge-02-duty-cycle
- **Graphic file:** `marketing/pins/fridge-02-duty-cycle.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Why Refrigerator Power Calculations Should Use "Equivalent Hours," Not 24
- **Pinterest description:** A refrigerator's compressor cycles on and off — using 24 hours/day in your math overstates daily energy by 2-3×. The free calculator uses equivalent running hours instead, and lets you enter your own metered figure if you have one.
- **On-pin headline:** Your Fridge Doesn't Run 24 Hours a Day — Your Math Shouldn't Either
- **On-pin subhead:** Compressors cycle on and off; using 24h/day overstates daily energy by 2-3×
- **Board:** Power Outage Prep
- **Alt text:** Explanation graphic showing why refrigerator compressors cycle instead of running continuously for 24 hours
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_02
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 3 — fridge-03-surge
- **Graphic file:** `marketing/pins/fridge-03-surge.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Why Surge Rating Matters More Than Continuous Output for a Refrigerator
- **Pinterest description:** A power station with plenty of continuous output but a low surge rating can still fail to start a refrigerator's compressor. Enter your unit's real surge figure (from the nameplate) into the free calculator for an accurate check.
- **On-pin headline:** Enough Continuous Watts Doesn't Mean the Station Can Start Your Fridge
- **On-pin subhead:** Compressor startup can briefly draw 2-3× the running watts
- **Board:** Power Outage Prep
- **Alt text:** Diagram showing refrigerator compressor startup surge versus continuous running watts
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_03
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 4 — fridge-04-two-units
- **Graphic file:** `marketing/pins/fridge-04-two-units.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Can One Power Station Run Both a Refrigerator and a Freezer?
- **Pinterest description:** It depends on combined continuous output and worst-case surge. Add both units as separate rows in the free calculator so it sums continuous demand and takes the largest single startup surge on top.
- **On-pin headline:** Running a Fridge AND a Freezer on One Power Station?
- **On-pin subhead:** Add both as separate rows — it sums continuous demand and takes the largest single surge
- **Board:** Power Outage Prep
- **Alt text:** Illustration of a refrigerator and a freezer both connected to one portable power station
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_04
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 5 — fridge-05-solar
- **Graphic file:** `marketing/pins/fridge-05-solar.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** How Solar Recharge Changes Refrigerator Power Station Sizing
- **Pinterest description:** Enter a realistic daily Wh solar estimate and the free calculator treats it as reducing the energy your battery must supply each day — not the instantaneous power it has to deliver on demand.
- **On-pin headline:** Solar Panels During an Outage: What They Actually Change
- **On-pin subhead:** Solar reduces the daily energy your battery must supply — not the instant power it must deliver
- **Board:** Solar + Off-Grid Power
- **Alt text:** Diagram of solar panels recharging a power station that is running a refrigerator during a power outage
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_05
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 6 — fridge-06-nameplate
- **Graphic file:** `marketing/pins/fridge-06-nameplate.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Nameplate Wattage vs. Real Running Watts on a Refrigerator
- **Pinterest description:** A manufacturer's nameplate wattage is a legal maximum, usually higher than the real average running draw. The free calculator lets you enter a metered or EnergyGuide figure instead of guessing from the sticker.
- **On-pin headline:** That Wattage Sticker on Your Fridge Is a Legal Maximum, Not Its Real Draw
- **On-pin subhead:** Nameplate wattage overstates average running draw — use a metered figure if you can
- **Board:** Power Outage Prep
- **Alt text:** Close-up of a refrigerator nameplate wattage label next to a plug-in energy meter
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_06
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 7 — fridge-07-faq-watts
- **Graphic file:** `marketing/pins/fridge-07-faq-watts.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** How Many Watts Does a Full-Size Refrigerator Use?
- **Pinterest description:** It varies by size, age and efficiency — commonly 100-200W running for a full-size unit, with startup surge 2-3× higher. Check your own rating label or EnergyGuide sticker, then size backup power with the free calculator.
- **On-pin headline:** How Many Watts Does a Refrigerator Actually Use?
- **On-pin subhead:** Commonly 100-200W running, full-size unit — with 2-3× startup surge
- **Board:** Power Outage Prep
- **Alt text:** Infographic showing typical refrigerator running watts and startup surge range
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_07
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 8 — fridge-08-door-closed
- **Graphic file:** `marketing/pins/fridge-08-door-closed.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Does Keeping the Refrigerator Door Closed Change Power Station Sizing?
- **Pinterest description:** Keeping doors closed reduces how often the compressor runs to hold temperature — exactly what “equivalent hours per day” estimates. The free calculator lets that field reflect your own usage pattern.
- **On-pin headline:** Keeping the Door Closed Changes Your Power Math
- **On-pin subhead:** Fewer door openings = fewer compressor cycles = lower “equivalent hours/day”
- **Board:** Power Outage Prep
- **Alt text:** Illustration of a closed refrigerator door with a compressor cycle indicator
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_08
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 9 — fridge-09-for-whom
- **Graphic file:** `marketing/pins/fridge-09-for-whom.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Backup Power Planning for a Refrigerator or Freezer, Any Outage Length
- **Pinterest description:** Whether you're protecting groceries for a few hours or planning for a multi-day outage with partial solar recharge, the free refrigerator runtime calculator scales to your real scenario — not a generic default.
- **On-pin headline:** From a Few Hours of Grocery Protection to a Multi-Day Outage
- **On-pin subhead:** Size backup power for exactly the scenario you're planning for
- **Board:** Power Outage Prep
- **Alt text:** Illustration of a refrigerator and freezer with a timeline showing outage duration options
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_09
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 10 — fridge-10-cta
- **Graphic file:** `marketing/pins/fridge-10-cta.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Free Refrigerator & Freezer Runtime Calculator
- **Pinterest description:** Enter your refrigerator's running watts, hours per day, and outage length — the free calculator shows the capacity and output you need, and which catalog power stations actually meet it. No signup, no invented prices.
- **On-pin headline:** Free Refrigerator Runtime Calculator — Your Numbers, Not Guesses
- **On-pin subhead:** Enter watts, hours and outage days — see which power stations actually meet it
- **Board:** Power Outage Prep
- **Alt text:** Screenshot-style graphic of the free refrigerator and freezer power station runtime calculator
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/refrigerator-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_fridge_10
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"


## CPAP Battery Runtime (10 pins)

### Pin 1 — cpap-01-formula
- **Graphic file:** `marketing/pins/cpap-01-formula.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** How Many Nights Can a Power Station Run a CPAP Machine?
- **Pinterest description:** Estimated nights = (station capacity × usable efficiency) ÷ (CPAP watts × hours per night). Enter your machine's own consumption and the free calculator shows nights per product — not a generic guess.
- **On-pin headline:** How Many Nights Will a Power Station Really Run Your CPAP?
- **On-pin subhead:** nights ≈ (station capacity × usable efficiency) ÷ (CPAP watts × hours/night)
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Formula diagram for calculating how many nights a power station can run a CPAP machine
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_01
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 2 — cpap-02-no-universal
- **Graphic file:** `marketing/pins/cpap-02-no-universal.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Why There's No Universal CPAP Power Draw Number
- **Pinterest description:** CPAP power draw depends on brand, model, pressure setting, and altitude compensation — published base-machine figures commonly range from roughly 15 to 60W. Check your own rating label, then use the free calculator.
- **On-pin headline:** There's No Single “CPAP Wattage” — Here's Why
- **On-pin subhead:** Base machines commonly range roughly 15-60W before humidifier or tubing draw
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Graphic showing the range of CPAP machine power draw depending on brand and settings
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_02
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 3 — cpap-03-humidifier
- **Graphic file:** `marketing/pins/cpap-03-humidifier.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** How Much Power Does a CPAP Heated Humidifier Add?
- **Pinterest description:** A heated humidifier can add roughly 20-60W depending on heat setting, and a heated tube adds further draw on top. The free calculator has separate toggles for both instead of one guessed combined number.
- **On-pin headline:** Your Heated Humidifier Adds More Power Than You'd Think
- **On-pin subhead:** A heated humidifier can add roughly 20-60W on top of the base CPAP machine
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Illustration of a CPAP machine with heated humidifier and heated tube power draw callouts
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_03
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 4 — cpap-04-ac-vs-dc
- **Graphic file:** `marketing/pins/cpap-04-ac-vs-dc.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** CPAP on AC Inverter Power vs. Direct DC — What Changes
- **Pinterest description:** Running a CPAP through an AC inverter loses some energy to conversion. Many machines also accept a direct 12V/24V DC cable, which skips that step — check your machine's compatibility, then compare in the free calculator.
- **On-pin headline:** Running Your CPAP on DC Power Can Skip a Conversion Loss
- **On-pin subhead:** Direct 12V/24V DC is typically more efficient than AC inverter power — check compatibility first
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Diagram comparing CPAP machine running on AC inverter power versus direct DC power
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_04
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 5 — cpap-05-not-medical-advice
- **Graphic file:** `marketing/pins/cpap-05-not-medical-advice.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Is a CPAP Battery Runtime Calculator Medical Advice? (No.)
- **Pinterest description:** This free tool calculates estimated battery runtime from the numbers you enter — it does not assess therapy adequacy or medical suitability. Talk to your equipment provider or physician about backup power planning.
- **On-pin headline:** This Tool Calculates Runtime — It's Not Medical Advice
- **On-pin subhead:** Talk to your equipment provider or physician about backup power for your specific therapy needs
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Disclosure graphic clarifying that a CPAP power calculator is not medical advice
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_05
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 6 — cpap-06-generic-40w
- **Graphic file:** `marketing/pins/cpap-06-generic-40w.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Why a Generic 40W CPAP Figure Is Usually Wrong
- **Pinterest description:** Using a generic “40W” figure for every CPAP model instead of your actual machine's rating label is one of the most common sizing mistakes. Find your real number, then run it through the free calculator.
- **On-pin headline:** Stop Using “40 Watts” for Every CPAP Model
- **On-pin subhead:** Use your own machine's rating label instead of a generic figure
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Graphic warning against using a generic 40 watt figure for all CPAP machines
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_06
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 7 — cpap-07-humidifier-mistake
- **Graphic file:** `marketing/pins/cpap-07-humidifier-mistake.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** How Much Does Skipping Humidifier Draw Understate CPAP Power Needs?
- **Pinterest description:** Forgetting humidifier or heated-tube draw can understate real CPAP power consumption by 50% or more. The free calculator adds both on top of your base machine wattage automatically.
- **On-pin headline:** Forgetting Humidifier Draw Can Understate Power Needs by 50%+
- **On-pin subhead:** Add humidifier and heated-tube watts on top of the base machine, not instead of it
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Graphic showing how forgetting CPAP humidifier power draw understates total energy needs
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_07
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 8 — cpap-08-find-draw
- **Graphic file:** `marketing/pins/cpap-08-find-draw.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Where to Find Your CPAP Machine's Real Power Consumption
- **Pinterest description:** Check the rating label on the machine or its power supply/brick, or the manufacturer's published spec sheet. A plug-in energy meter gives the most accurate real-world average for the free calculator.
- **On-pin headline:** Where to Find Your CPAP's Actual Power Draw
- **On-pin subhead:** Check the rating label, power brick, or manufacturer spec sheet — or use a plug-in meter
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Illustration pointing to a CPAP power supply label as the source of real wattage
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_08
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 9 — cpap-09-altitude
- **Graphic file:** `marketing/pins/cpap-09-altitude.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Does Altitude Affect CPAP Machine Power Consumption?
- **Pinterest description:** A higher prescribed pressure or active altitude compensation makes the CPAP motor work harder. If your documentation gives a range, use the higher end in the free calculator for a more conservative estimate.
- **On-pin headline:** Altitude and Pressure Settings Can Change CPAP Power Draw
- **On-pin subhead:** Higher prescribed pressure or altitude compensation makes the motor work harder
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Graphic showing altitude and pressure setting effects on CPAP machine power draw
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_09
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 10 — cpap-10-cta
- **Graphic file:** `marketing/pins/cpap-10-cta.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Free CPAP Battery Runtime Calculator
- **Pinterest description:** Enter your CPAP's own wattage, humidifier and tube settings, and hours per night — the free calculator shows Wh needed and how many nights each catalog power station could realistically cover.
- **On-pin headline:** Free CPAP Battery Runtime Calculator — Camping, Travel, Outages
- **On-pin subhead:** Enter your machine's real numbers, see nights per power station
- **Board:** CPAP Travel & Backup Power
- **Alt text:** Screenshot-style graphic of the free CPAP battery runtime calculator tool
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/cpap-battery-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_cpap_10
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"


## Starlink Runtime (10 pins)

### Pin 1 — starlink-01-formula
- **Graphic file:** `marketing/pins/starlink-01-formula.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** How Many Watt-Hours Does Starlink Use Per Day?
- **Pinterest description:** Daily energy (Wh) = average watts × hours of use per day. Enter your own measured Starlink consumption or a labeled example profile, and the free calculator shows the battery capacity you actually need.
- **On-pin headline:** How Many Watt-Hours Does Starlink Really Use Off-Grid?
- **On-pin subhead:** daily energy ≈ average watts × hours of use per day — enter your own measured number
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Formula diagram for calculating daily Starlink energy consumption off-grid
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_01
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 2 — starlink-02-cold-weather
- **Graphic file:** `marketing/pins/starlink-02-cold-weather.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Does Cold Weather Double Starlink's Power Consumption?
- **Pinterest description:** Active snow-melt heating draws substantially more power than normal operation — commonly cited as roughly double the typical average. Use the heating-active profile in the free calculator for winter planning.
- **On-pin headline:** Cold Weather Can Roughly Double Starlink's Power Draw
- **On-pin subhead:** Active snow-melt heating substantially increases average consumption
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Graphic showing Starlink dish snow-melt heating increasing power consumption in winter
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_02
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 3 — starlink-03-continuous-vs-scheduled
- **Graphic file:** `marketing/pins/starlink-03-continuous-vs-scheduled.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Starlink Continuous Operation vs. Scheduled Use: Power Impact
- **Pinterest description:** Running Starlink 24 hours/day uses far more daily energy than scheduled use. If your setup allows powering on only when needed, entering realistic hours/day in the free calculator can substantially cut required capacity.
- **On-pin headline:** Continuous vs. Scheduled Starlink Use Changes Your Power Math a Lot
- **On-pin subhead:** Powering on only for work hours can substantially reduce the capacity you need
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Comparison graphic of Starlink continuous operation versus scheduled hours of use
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_03
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 4 — starlink-04-router
- **Graphic file:** `marketing/pins/starlink-04-router.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** How Much Power Does a Router Add on Top of Starlink?
- **Pinterest description:** It depends on the router — anywhere from a few watts for a low-power travel router to 15-20W or more for a full-featured unit. Enter your router's own rating in the free calculator rather than assuming it's already included.
- **On-pin headline:** Don't Forget the Router When Sizing Starlink Power
- **On-pin subhead:** A router can add a few watts to 15-20W or more on top of the dish
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Illustration of a Starlink dish and router with separate power draw callouts
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_04
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 5 — starlink-05-dc-bypass
- **Graphic file:** `marketing/pins/starlink-05-dc-bypass.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Can You Run Starlink Directly on DC Power?
- **Pinterest description:** Some setups use a DC-to-DC adapter to bypass a power station's AC inverter, avoiding conversion losses. Check compatibility with your Starlink hardware, then use the AC/DC toggle in the free calculator as a starting point.
- **On-pin headline:** A DC-to-DC Adapter Can Skip Inverter Losses for Starlink
- **On-pin subhead:** Bypassing the AC inverter avoids conversion loss — check hardware compatibility first
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Diagram comparing Starlink running on AC inverter power versus a DC-to-DC bypass adapter
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_05
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 6 — starlink-06-not-one-number
- **Graphic file:** `marketing/pins/starlink-06-not-one-number.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Why Starlink Power Consumption Isn't a Single Fixed Number
- **Pinterest description:** Average consumption differs by hardware generation and dish size, and rises substantially during active heating. Enter your own measured average from a plug-in energy meter into the free calculator for the most reliable number.
- **On-pin headline:** Starlink Power Draw Isn't One Number — Here's What Changes It
- **On-pin subhead:** Hardware generation, dish size, ambient temperature and duty cycle all matter
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Graphic explaining the factors that change Starlink power consumption
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_06
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 7 — starlink-07-solar-deficit
- **Graphic file:** `marketing/pins/starlink-07-solar-deficit.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Sizing Battery Capacity for Starlink Off-Grid With Solar
- **Pinterest description:** The free calculator nets your daily solar contribution against Starlink's daily energy need, then sizes capacity for the remaining deficit across your planned days off-grid — not a blended guess.
- **On-pin headline:** How Solar Changes the Battery Capacity Starlink Off-Grid Needs
- **On-pin subhead:** Daily deficit after solar = max(0, daily energy − daily solar Wh)
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Diagram showing solar panels offsetting Starlink's daily energy needs off-grid
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_07
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 8 — starlink-08-for-whom
- **Graphic file:** `marketing/pins/starlink-08-for-whom.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Who Needs a Starlink Battery Runtime Calculator?
- **Pinterest description:** Off-grid travelers, remote workers, and emergency-preparedness planners all need to size battery capacity differently for a Starlink kit. The free calculator adapts to your own days-off-grid and solar input.
- **On-pin headline:** Sizing Battery Power for Starlink: Remote Work, Travel, Preparedness
- **On-pin subhead:** Off-grid travelers, remote workers, and emergency-preparedness planners
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Illustration of Starlink used for remote work, travel, and emergency preparedness
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_08
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 9 — starlink-09-measured-vs-example
- **Graphic file:** `marketing/pins/starlink-09-measured-vs-example.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Should You Use Your Own Measured Starlink Power Draw?
- **Pinterest description:** The example profiles in the free calculator are clearly labeled starting points, not a specification for any particular Starlink hardware revision. Your own plug-in-meter measurement gives the most reliable number.
- **On-pin headline:** Measured Starlink Consumption Beats Any Example Profile
- **On-pin subhead:** Example profiles are clearly labeled starting points — not a spec for your exact hardware
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Graphic comparing a measured Starlink power reading to a generic example profile
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_09
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

### Pin 10 — starlink-10-cta
- **Graphic file:** `marketing/pins/starlink-10-cta.png` (1000×1500 PNG, generated, ready to upload)
- **Pinterest title:** Free Starlink Runtime Calculator
- **Pinterest description:** Enter your own measured Starlink consumption (or a clearly labeled example profile), set days off-grid and any solar input — the free calculator shows capacity needed and which catalog products can deliver it.
- **On-pin headline:** Free Starlink Runtime Calculator for Off-Grid Setups
- **On-pin subhead:** Your own numbers or a labeled example — see the capacity you actually need
- **Board:** Starlink & Off-Grid Connectivity
- **Alt text:** Screenshot-style graphic of the free Starlink runtime calculator tool
- **Destination URL (UTM-tagged):** https://www.powermatchlab.com/tools/starlink-runtime-calculator?utm_source=pinterest&utm_medium=social&utm_campaign=tools_launch_2026&utm_content=pin_starlink_10
- **Disclosure shown on graphic:** Yes — "Reader-supported · may earn a commission from qualifying purchases"

