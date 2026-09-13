/**
 * Content + configuration for the /tools calculator hub.
 *
 * Same discipline as content/guides.ts: educational, sourced where relevant,
 * and carrying a "last updated" date. Each tool page pairs indexable prose
 * (short answer, method, formula, worked example, common mistakes, FAQ) with
 * one specialized calculator component — never a bare form with no context.
 *
 * Guides explain a topic in depth; tools calculate a number. Where an
 * existing guide already covers the same ground (refrigerator, CPAP, RV,
 * home backup), each tool links to it rather than repeating its prose, and
 * the guide links back via `relatedToolSlug` in content/guides.ts.
 */

export type ToolCalculatorKind = "load-list" | "cpap" | "starlink";

/** Same shape as content/guides.ts's GuideSource — a plain string, or a real, verifiable {label, url}. Never invented. */
export type ToolSource = string | { label: string; url: string };

export interface ToolSection {
  id: string;
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  slug: string;
  title: string;
  shortTitle: string;
  metaDescription: string;
  calculatorKind: ToolCalculatorKind;
  shortAnswer: string;
  forWhom: string;
  formula: string;
  sections: ToolSection[];
  commonMistakes: string[];
  faq: ToolFaq[];
  sources: ToolSource[];
  relatedGuideSlugs: string[];
  relatedBestForSlug?: string;
  /**
   * Slug of an editorial model comparison (see content/comparisons.ts) to
   * surface as a "Direct comparison" link. Optional — most tools don't need
   * this section.
   */
  relatedComparisonSlug?: string;
  lastUpdated: string;
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: "refrigerator-runtime-calculator",
    title: "Refrigerator & Freezer Runtime Calculator",
    shortTitle: "Refrigerator & Freezer",
    metaDescription:
      "Calculate the battery capacity and continuous output you need to keep a refrigerator or freezer running during a power outage, with your own watts, hours and solar input.",
    calculatorKind: "load-list",
    shortAnswer:
      "Recommended minimum capacity ≈ (daily energy in Wh × days of outage) ÷ usable efficiency × (1 + reserve). Enter your refrigerator's running watts (or daily Wh), how many hours a day it effectively runs, and how many days you need it covered — the calculator below does the rest and shows which catalog products actually meet the requirement.",
    forWhom:
      "Anyone planning backup power for a refrigerator, freezer, or both during a grid outage — from a few hours of grocery protection to a multi-day event with partial solar recharge.",
    formula:
      "Daily energy (Wh) = running watts × equivalent hours/day. Recommended minimum capacity (Wh) = (daily energy × days) ÷ usable efficiency × (1 + reserve fraction). Required continuous output (W) must be at least the largest simultaneous running watts; required surge (W) must cover the startup spike of the compressor(s).",
    sections: [
      {
        id: "why-hours-not-24",
        heading: "Why \"equivalent hours per day\", not 24",
        body: [
          "A refrigerator's compressor cycles on and off to hold temperature — it does not run continuously. \"Equivalent hours per day\" means the number of hours the compressor would need to run at its full running-watts figure to use the same total energy the unit actually uses over 24 hours.",
          "This is why the presets below default to roughly 8 equivalent hours/day for a full-size refrigerator rather than 24 — a number pulled from a typical duty cycle, not a claim about your specific unit. If you know your fridge's actual daily kWh figure (from an EnergyGuide label or a plug-in meter), enter the equivalent Wh/day directly instead of estimating hours.",
        ],
      },
      {
        id: "surge-matters-more-than-usual",
        heading: "Why surge rating matters more for compressors",
        body: [
          "Compressor startup can briefly draw two to three times the running watts. A power station with plenty of continuous output but a low surge rating can still fail to start a refrigerator, especially if a freezer or second fridge is running at the same instant. Enter a real surge figure from the unit's nameplate if you have one — the calculator falls back to a conservative multiplier only when you don't.",
        ],
      },
      {
        id: "solar-during-outage",
        heading: "How solar recharge changes the number",
        body: [
          "If you expect any solar recharge during the outage, enter a realistic daily Wh estimate (see the solar charging guide linked below for how to estimate that). The calculator treats it as reducing the energy the battery must supply each day, not as reducing the instantaneous power the station must deliver.",
        ],
      },
    ],
    commonMistakes: [
      "Using 24 hours/day instead of the compressor's actual duty cycle, which overstates daily energy by 2-3×.",
      "Ignoring startup surge entirely, then finding the station won't start the compressor even though its continuous rating looked sufficient.",
      "Treating a manufacturer's nameplate wattage (a legal maximum) as the average running draw, which is usually lower.",
      "Assuming solar guarantees a fixed daily output regardless of weather — treat any solar figure here as a planning estimate.",
    ],
    faq: [
      {
        question: "How many watts does a refrigerator actually use?",
        answer:
          "It varies widely by size, age and efficiency — commonly 100-200 W running for a full-size unit, with startup surge 2-3× higher. Check your unit's own rating label, EnergyGuide sticker, or measure it with a plug-in energy meter for a real figure rather than relying on the presets.",
      },
      {
        question: "Can one power station run both a fridge and a freezer?",
        answer:
          "It depends on combined continuous output and worst-case surge. Add both as separate rows below (each with its own real watts and surge) so the calculator sums continuous demand and takes the largest single surge on top — then check the recommended products against that combined requirement.",
      },
      {
        question: "Does keeping the door closed change the calculation?",
        answer:
          "Keeping doors closed reduces how often the compressor needs to run to maintain temperature, which is exactly what \"equivalent hours per day\" is trying to estimate — but this calculator can't measure your actual usage pattern, so treat the hours field as your own best estimate or a metered reading.",
      },
    ],
    sources: [
      "PowerMatchLab's own Power Calculator methodology (same formulas, see About & Methodology)",
      { label: "ENERGY STAR — Refrigerators", url: "https://www.energystar.gov/products/refrigerators" },
      {
        label: "U.S. Department of Energy — \"Your Refrigerator Is Only As Efficient As You\"",
        url: "https://www.energy.gov/energysaver/articles/your-refrigerator-only-efficient-you",
      },
    ],
    relatedGuideSlugs: [
      "power-station-for-refrigerator",
      "can-a-power-station-run-a-refrigerator",
      "best-indoor-generator-for-refrigerator",
    ],
    relatedBestForSlug: "best-for-refrigerator-backup",
    relatedComparisonSlug:
      "anker-solix-c1000-gen-2-vs-ecoflow-delta-3-classic-vs-jackery-explorer-1000-v2",
    lastUpdated: "2026-09-11",
  },
  {
    slug: "cpap-battery-calculator",
    title: "CPAP Battery Runtime Calculator",
    shortTitle: "CPAP",
    metaDescription:
      "Estimate how many nights a portable power station can run a CPAP machine, accounting for a heated humidifier, heated tube, and AC or DC power connection.",
    calculatorKind: "cpap",
    shortAnswer:
      "Estimated nights ≈ (station capacity × usable efficiency) ÷ (CPAP watts × hours per night). Enter your machine's own consumption (from its label or power-supply spec), add humidifier/heated-tube draw if used, and the calculator shows Wh needed per night and how many nights each catalog product could realistically cover.",
    forWhom:
      "CPAP users planning backup power for travel, camping, or a home power outage — not a substitute for medical advice about therapy continuity.",
    formula:
      "Total device watts = base CPAP watts + humidifier watts (if active) + heated-tube watts (if active). Wh per night = total watts × hours per night. Recommended minimum capacity (Wh) = (Wh per night × nights) ÷ usable efficiency × (1 + reserve fraction).",
    sections: [
      {
        id: "why-not-a-universal-number",
        heading: "Why there's no single \"CPAP wattage\"",
        body: [
          "CPAP power draw depends on brand, model, pressure setting, altitude compensation, and whether a heated humidifier or heated tube is active — published figures for base machines commonly range from roughly 15 to 60 W, before humidifier or tubing draw is added. There is no single number that applies to every machine.",
          "The most reliable figure is your own device's rating label or the manufacturer's power-supply specification (often printed directly on the power brick). A plug-in energy meter gives an even more precise real-world average, since actual draw varies with pressure and humidity settings.",
        ],
      },
      {
        id: "humidifier-and-tube",
        heading: "Humidifier and heated tube add meaningfully",
        body: [
          "A heated humidifier can add roughly 20-60 W depending on the heat setting, and a heated tube adds further draw on top of that. Both toggles in the calculator let you add this on top of the base machine wattage rather than guessing a single combined number.",
        ],
      },
      {
        id: "ac-vs-dc",
        heading: "AC inverter power vs. direct DC",
        body: [
          "Running a CPAP through a power station's AC inverter outlet loses some energy to conversion, the same way any AC device does. Many CPAP machines also accept a direct 12V/24V DC cable when paired with the right adapter, which skips that conversion step and is typically more efficient — check your machine's compatibility before relying on this.",
          "The calculator lets the AC/DC choice adjust the starting point of the efficiency slider (higher for DC), but the slider itself stays fully editable — this is a starting assumption, not a measured figure for your exact setup.",
        ],
      },
    ],
    commonMistakes: [
      "Using a generic \"40 W\" figure for every CPAP model instead of the actual machine's rating label.",
      "Forgetting to add humidifier or heated-tube draw, which can understate real consumption by 50% or more.",
      "Assuming DC operation automatically works — not every CPAP machine has a supported DC input; check compatibility first.",
      "Treating the reserve headroom as unnecessary for medical equipment — it exists specifically to absorb estimate error.",
    ],
    faq: [
      {
        question: "Is this medical advice?",
        answer:
          "No. This tool calculates estimated battery runtime from the numbers you enter — it does not assess therapy adequacy, altitude compensation, or medical suitability. Talk to your equipment provider or physician about backup power planning for your specific therapy needs.",
      },
      {
        question: "Where do I find my CPAP's actual power draw?",
        answer:
          "Check the rating label on the machine or its power supply/brick, or the manufacturer's published specification sheet for your exact model. A plug-in energy meter between the wall outlet and the power supply gives the most accurate real-world average.",
      },
      {
        question: "Does altitude or air pressure setting change power draw?",
        answer:
          "It can — the motor works harder at a higher prescribed pressure or with altitude compensation active. If your machine's documentation gives a range rather than one figure, use the higher end for a more conservative estimate.",
      },
    ],
    sources: [
      "PowerMatchLab's own Power Calculator methodology (same formulas, see About & Methodology)",
    ],
    relatedGuideSlugs: ["power-station-for-cpap"],
    lastUpdated: "2026-09-11",
  },
  {
    slug: "rv-power-calculator",
    title: "RV & Van Life Power Calculator",
    shortTitle: "RV & Van Life",
    metaDescription:
      "Calculate the power station capacity and output an RV or van setup needs — lights, 12V fridge, water pump, electronics and Starlink — with solar offset and TT-30 compatibility.",
    calculatorKind: "load-list",
    shortAnswer:
      "Add every device you run in the rig with its watts, quantity and hours/day, set how many days you'll be off-grid, and optionally enter a daily solar contribution. The calculator sums continuous and surge demand, nets out solar from the daily energy need, and shows which catalog products meet it — including a hard filter for a native TT-30 outlet if you need one.",
    forWhom:
      "RV owners and van-life travelers planning power for a rig running lights, a 12V fridge, water pump, electronics, and connectivity gear, with or without solar.",
    formula:
      "Daily energy (Wh) = Σ (device watts × quantity × hours/day) for every device. Daily deficit after solar = max(0, daily energy − daily solar Wh). Recommended minimum capacity (Wh) = (daily deficit × days) ÷ usable efficiency × (1 + reserve fraction). Required continuous output = sum of devices marked as running simultaneously; required surge = that sum plus the largest single startup spike.",
    sections: [
      {
        id: "simultaneous-loads",
        heading: "Which loads actually run at the same time",
        body: [
          "Not every device in an RV runs simultaneously — a microwave and a coffee maker rarely run together with everything else. Uncheck \"Coincides?\" for a load you know is never running at the same time as the rest; it still counts fully toward total daily energy, just not toward the instantaneous continuous/surge power requirement.",
        ],
      },
      {
        id: "tt30-explained",
        heading: "TT-30 and why it's a hard requirement, not a preference",
        body: [
          "A native TT-30 (30A, 120V) outlet lets a power station plug directly into an RV's shore-power inlet without an adapter. If your setup depends on that outlet, check \"I need an RV TT-30 outlet\" — the calculator then marks any product without a verified TT-30 outlet as Not Suitable, rather than just deprioritizing it, since an adapter workaround isn't always safe or available.",
        ],
      },
      {
        id: "solar-while-driving-vs-parked",
        heading: "Solar input while driving vs. parked",
        body: [
          "Roof-mounted solar typically produces less while the vehicle is moving (shading, angle, partial obstruction) than when parked and oriented toward the sun. If your trip mixes driving days and stationary days, consider running the calculator once for each scenario with a different daily solar figure rather than a single blended average.",
        ],
      },
    ],
    commonMistakes: [
      "Assuming every device runs 24/7 instead of entering realistic hours/day for each.",
      "Leaving \"Coincides?\" checked for a microwave or coffee maker that never actually overlaps with the rest of the load, which overstates the continuous/surge requirement.",
      "Requiring TT-30 as a preference instead of a hard requirement, missing that a product without it may not be usable for shore-power charging at all.",
      "Treating a single \"good weather\" solar estimate as guaranteed across a whole multi-day trip.",
    ],
    faq: [
      {
        question: "Do I need TT-30 if I only charge from a wall outlet at home?",
        answer:
          "No — TT-30 specifically refers to an RV shore-power style connector. If you only ever charge via a standard AC wall outlet, leave that requirement unchecked; it only matters if your rig's own shore-power inlet expects that connector.",
      },
      {
        question: "Why does my required output look higher than just adding up my devices?",
        answer:
          "The continuous requirement sums every device marked as running simultaneously, and the surge requirement adds the single largest startup spike on top of that. If a device never overlaps with the rest, mark it as not coinciding so it only counts toward daily energy, not the instantaneous requirement.",
      },
      {
        question: "How accurate is the solar contribution I enter?",
        answer:
          "It's only as accurate as the number you provide — see the solar charging guide linked below for how to estimate realistic panel output. Treat any solar figure as a planning estimate that can vary significantly with weather, shading and panel angle.",
      },
    ],
    sources: [
      "PowerMatchLab's own Power Calculator methodology (same formulas, see About & Methodology)",
    ],
    relatedGuideSlugs: ["power-station-for-rv", "power-stations-for-remote-work-and-van-life"],
    relatedBestForSlug: "best-for-rv",
    lastUpdated: "2026-09-11",
  },
  {
    slug: "rv-air-conditioner-runtime-calculator",
    title: "RV Air Conditioner Runtime & Surge Calculator",
    shortTitle: "RV Air Conditioner",
    metaDescription:
      "Check whether a power station can start and run your RV rooftop air conditioner, calculate its daily energy use, and see which catalog products actually meet the surge and capacity requirements.",
    calculatorKind: "load-list",
    shortAnswer:
      "Enter your air conditioner's continuous running watts and, if you know it, its startup/surge peak (from the nameplate, spec sheet, or a soft-start device's documentation) — never a guessed percentage. The calculator sums that against any other RV loads running at the same time, applies your usable-efficiency and reserve settings, and shows exactly which catalog products meet both the surge and capacity requirement, and why the others don't.",
    forWhom:
      "RV owners and travelers who need to know whether a specific power station can actually start and sustain a rooftop or window air conditioner — not just run smaller electronics — with or without a soft-start device installed.",
    formula:
      "Equivalent hours/day = hours you want the AC running × its compressor duty cycle (the percentage of that time it's actually drawing full power, not cycled off) — use the calculator's own duty-cycle helper below the load table to compute this from those two numbers rather than guessing a single hours figure directly. Daily energy (Wh) = AC running watts × that equivalent hours/day figure, plus any other loads marked as running the same day. Required continuous output (W) = sum of every load marked as running at the same time as the AC. Required surge (W) = that continuous sum + the AC's documented startup peak — its nameplate/spec-sheet figure, or its reduced peak after a soft-start device if you have that number. Recommended minimum capacity (Wh) = (daily energy × days) ÷ usable efficiency × (1 + reserve fraction).",
    sections: [
      {
        id: "btu-is-not-watts",
        heading: "BTU tells you cooling power, not electrical draw",
        body: [
          "BTU/hour measures how much heat an air conditioner removes, not how many watts it draws from the wall — the two are related only through the unit's efficiency (EER: cooling BTU/hour ÷ electrical watts), which varies by model. A 13,500 BTU unit at EER 9 and a 13,500 BTU unit at EER 11 draw meaningfully different running watts for the identical cooling output.",
          "This is why entering your AC's actual electrical rating (from its nameplate or spec sheet) always beats estimating from the BTU number alone — the presets below are commonly-published examples for each BTU class, not a fixed conversion.",
        ],
      },
      {
        id: "continuous-surge-energy",
        heading: "Three different numbers: continuous watts, surge watts, and energy",
        body: [
          "Continuous (running) watts is the steady draw once the compressor motor is up to speed. Surge (or starting/peak) watts is the brief, much higher spike the instant the compressor motor starts — often called LRA, locked-rotor amps, on a nameplate. Energy (Wh) is running watts accumulated over actual hours of operation.",
          "A power station needs enough surge rating to start the compressor at all, enough continuous output to keep it running, and enough capacity (Wh) for the total runtime you need — three separate checks, not one. A unit can pass any one of these and still fail the others.",
        ],
      },
      {
        id: "why-not-100-percent",
        heading: "Why the compressor isn't running 100% of the time",
        body: [
          "A conventional single-speed AC compressor works like an on/off switch: full power when the thermostat calls for cooling, off once the set temperature is reached, cycling repeatedly rather than running continuously. \"Equivalent hours/day\" in this calculator means the hours the compressor would need to run at full running watts to use the same total energy it actually uses over a day — not the number of clock-hours the AC is switched on.",
          "Three separate numbers describe this, and the calculator's duty-cycle helper keeps them distinct rather than collapsing them into one guess: the hours you'd like the AC running, the duty cycle (what percentage of those hours the compressor is actually at full power), and the resulting equivalent hours/day — hours wanted × duty cycle — which is the figure that actually drives the daily-energy math above.",
          "Some newer RV AC units use a variable-speed (inverter) compressor instead, which modulates its speed to match the cooling load rather than cycling fully on and off — real-world energy use for those units follows a different pattern than the on/off assumption here, so lean on your own measured or manufacturer-published daily energy figure if you have one.",
        ],
      },
      {
        id: "what-changes-real-runtime",
        heading: "What actually changes how long the compressor runs",
        body: [
          "Outside temperature and humidity, the RV's insulation quality, how sunny or shaded the parking spot is, and the thermostat setting all change how much of each hour the compressor actually runs to hold temperature. A poorly insulated rig in 100°F sun runs its AC far more of each hour than a well-insulated one in mild shade — the same BTU-rated unit can use meaningfully more or less real energy per day depending entirely on these conditions, not the AC itself.",
        ],
      },
      {
        id: "soft-start-explained",
        heading: "What a soft-start device changes — and what it doesn't",
        body: [
          "A soft-start device (installed on the AC itself) ramps the compressor motor's current up gradually instead of one large locked-rotor inrush spike, which lowers the PEAK startup draw a power station or generator needs to supply. Soft-start manufacturers publish their own tested reduction figures for their specific device and compressor combinations — for example, Micro-Air publishes a 65-75% starting-current reduction for its EasyStart product line (see sources below).",
          "PowerMatchLab never applies an automatic percentage reduction for a soft starter, because the real number depends on the specific device and AC model. If you have one installed, enter its documented reduced starting figure directly in the Surge (W) field — leave it blank if you don't have that number rather than guessing.",
        ],
      },
    ],
    commonMistakes: [
      "Assuming the AC's BTU rating alone tells you its starting surge — check the nameplate, spec sheet, or a soft-start vendor's documented figure for your specific unit.",
      "Entering 24 equivalent hours/day instead of a realistic duty cycle for your climate, insulation and thermostat setting, which can overstate daily energy by several times.",
      "Assuming a soft starter reduces peak draw by some fixed, universal percentage rather than using its actual documented figure for your device.",
      "Confirming a station can start the AC (surge) but not checking whether its capacity (Wh) actually covers the hours of runtime needed, or the reverse.",
      "Forgetting other RV loads running at the same time as the AC when checking the continuous/surge requirement — mark them as coinciding, or as not, based on your real usage.",
    ],
    faq: [
      {
        question: "Will a portable power station really start my RV's rooftop air conditioner?",
        answer:
          "Only if the station's verified surge rating clearly covers the AC's documented startup peak — many stations cannot without either a very high surge rating or a soft-start device installed on the AC. Check both figures before assuming it will work; this calculator marks a product as unconfirmed rather than compatible whenever the surge comparison can't actually be made.",
      },
      {
        question: "Does a soft starter guarantee my power station can start the AC?",
        answer:
          "No. It reduces the AC's peak starting draw, but the resulting reduced figure still needs to be at or below the power station's own verified surge rating — enter the soft-start device's documented number here rather than assuming a reduction.",
      },
      {
        question: "Why are these results estimates rather than a guarantee?",
        answer:
          "This tool calculates from the numbers you enter and manufacturer-published specifications — PowerMatchLab does not physically test air conditioners, soft-start devices, or power stations in a lab. Real performance depends on your exact hardware, wiring, installation and climate conditions.",
      },
      {
        question: "When should I consult an electrician or RV technician?",
        answer:
          "Before installing or wiring a soft-start device, before relying on any non-standard electrical setup to power the AC circuit, or any time you're unsure of the AC's actual electrical specifications — incorrect wiring or a mismatched soft starter can damage equipment or void a warranty. This calculator only helps you size and compare products; it isn't a substitute for a qualified installation.",
      },
      {
        question: "Why does the example start with only a couple of hours instead of a full day of AC use?",
        answer:
          "The starting example represents a moderate, typical-use duty cycle (a few hours of desired cooling at roughly a 50% duty cycle in mild conditions), not a worst case — it's meant to show an honest mix of compatible and incompatible products rather than defaulting to a scenario so demanding that nothing qualifies. A separate, clearly labeled \"demanding: near-continuous duty cycle\" example is also available in the load list, where it's normal and expected for even large catalog stations to show as Not Suitable on capacity alone — that's the calculator being honest about a genuinely hard case, not a bug.",
      },
    ],
    sources: [
      "PowerMatchLab's own Power Calculator methodology (same formulas, see About & Methodology)",
      {
        label: "ENERGY STAR — Room Air Conditioners (EER, efficiency and cycling basics)",
        url: "https://www.energystar.gov/products/room_air_conditioners",
      },
      {
        label: "Micro-Air — EasyStart Breeze soft starter (published starting-current reduction)",
        url: "https://www.microair.net/products/easystart-breeze-soft-starter",
      },
      {
        label: "Dometic — Brisk II Evolution 13,500 BTU specification sheet",
        url: "https://www.dometic.com/externalassets/dometic-brisk-ii-evolution-13-5k_64599.pdf",
      },
      {
        label: "Coleman-Mach — Signature Series Mach 8 Plus specifications",
        url: "https://coleman-mach.com/products/air-conditioners/signature-series-mach-8-plus/",
      },
    ],
    relatedGuideSlugs: [
      "power-station-for-rv",
      "can-a-portable-power-station-run-an-rv-air-conditioner",
    ],
    relatedBestForSlug: "best-for-rv",
    relatedComparisonSlug: "ecoflow-delta-pro-3-vs-anker-solix-f3800",
    lastUpdated: "2026-09-13",
  },
  {
    slug: "starlink-runtime-calculator",
    title: "Starlink Runtime Calculator",
    shortTitle: "Starlink & Connectivity",
    metaDescription:
      "Calculate the battery capacity needed to run Starlink off-grid, using your own measured consumption or a labeled example profile, with solar offset and continuous vs. scheduled use.",
    calculatorKind: "starlink",
    shortAnswer:
      "Daily energy (Wh) ≈ average watts × hours of use per day. Enter your own measured consumption if you have it, or pick a clearly labeled example profile, set how many days you need to run without recharge, and the calculator shows the capacity needed and which catalog products can deliver it.",
    forWhom:
      "Off-grid travelers, remote workers, and emergency-preparedness planners who need to size battery capacity for a Starlink kit, with or without solar recharge.",
    formula:
      "Daily energy (Wh) = average watts × hours/day (24 if continuous). Daily deficit after solar = max(0, daily energy − daily solar Wh). Recommended minimum capacity (Wh) = (daily deficit × days) ÷ usable efficiency × (1 + reserve fraction).",
    sections: [
      {
        id: "why-a-range-not-one-number",
        heading: "Why Starlink power draw isn't a single number",
        body: [
          "Average consumption differs by hardware generation and dish size, and rises substantially when the dish actively heats itself to melt snow or ice — commonly reported as roughly doubling average draw during active heating. Ambient temperature, dish angle adjustments, and duty cycle also affect the real average.",
          "The example profiles below are clearly labeled starting points, not a specification for any particular Starlink hardware revision. Entering your own measured average — from a plug-in energy meter on the power supply — gives the most reliable number.",
        ],
      },
      {
        id: "continuous-vs-scheduled",
        heading: "Continuous operation vs. scheduled use",
        body: [
          "Running Starlink continuously (24 hours/day) uses far more daily energy than powering it on only when needed. If your use case allows scheduled operation — powering on for work hours only, for example — entering realistic hours/day rather than defaulting to continuous can substantially reduce the capacity you actually need.",
        ],
      },
    ],
    commonMistakes: [
      "Assuming a single average-watts figure applies regardless of weather, when active snow-melt heating can roughly double consumption.",
      "Defaulting to continuous 24-hour operation when the actual use case is scheduled hours per day.",
      "Ignoring router or additional networking equipment power draw layered on top of the dish itself.",
      "Treating an AC/DC efficiency assumption as a guarantee rather than a starting point to adjust for your actual cabling.",
    ],
    faq: [
      {
        question: "Does cold weather really double Starlink's power use?",
        answer:
          "Active snow-melt heating draws substantially more power than normal operation — commonly cited as roughly double the typical average — because the dish is actively warming itself. Use the heating-active profile below (or your own measured figure in cold conditions) for a more realistic estimate in winter conditions.",
      },
      {
        question: "Can I run Starlink directly on DC instead of through an inverter?",
        answer:
          "Some setups use a DC-to-DC adapter to bypass a power station's AC inverter, which avoids inverter conversion losses — check compatibility with your specific Starlink hardware and cabling before relying on this, and use the AC/DC toggle here only as a starting assumption for the efficiency slider.",
      },
      {
        question: "How much does the router add?",
        answer:
          "It depends on the router — anywhere from a few watts for a low-power travel router to 15-20 W or more for a full-featured unit. Enter your router's own rating label figure in the \"Router / additional equipment\" field rather than assuming Starlink's own kit already includes it.",
      },
    ],
    sources: [
      "PowerMatchLab's own Power Calculator methodology (same formulas, see About & Methodology)",
    ],
    relatedGuideSlugs: ["power-stations-for-remote-work-and-van-life"],
    relatedBestForSlug: "best-for-rv",
    lastUpdated: "2026-09-11",
  },
  {
    slug: "home-backup-calculator",
    title: "Home Backup Power Calculator",
    shortTitle: "Home Backup",
    metaDescription:
      "Build a list of essential home circuits — fridge, freezer, lights, router, CPAP, sump pump — and calculate the power station capacity and output needed to back them up during an outage.",
    calculatorKind: "load-list",
    shortAnswer:
      "List your essential home loads with their watts, quantity and hours/day, mark which ones can run at the same time, set your outage length and any solar recharge, and the calculator shows the capacity and output you need — plus which catalog products meet 240V, TT-30/transfer, or UPS-style requirements you flag as required.",
    forWhom:
      "Homeowners and renters planning battery backup for essential circuits during a grid outage — from a short blackout to a multi-day event with partial solar recharge.",
    formula:
      "Daily energy (Wh) = Σ (device watts × quantity × hours/day) for every load. Daily deficit after solar = max(0, daily energy − daily solar Wh). Recommended minimum capacity (Wh) = (daily deficit × days) ÷ usable efficiency × (1 + reserve fraction). Required continuous output = sum of loads marked as coinciding; required surge = that sum plus the largest single startup spike.",
    sections: [
      {
        id: "which-loads-coincide",
        heading: "Which loads can coincide, and why it matters",
        body: [
          "A refrigerator, router and a few lights might run continuously together, while a sump pump only kicks on occasionally and a space heater might never run at the same time as the microwave. Mark a load as not coinciding when you're confident it never overlaps with the rest — it still counts fully toward total daily energy, just not toward the instantaneous continuous/surge requirement, which can meaningfully lower the output rating you actually need.",
        ],
      },
      {
        id: "electrician-warning",
        heading: "Whole-home or panel-level backup needs an electrician",
        body: [
          "This calculator sizes a standalone power station running extension cords or a few plugged-in devices. If you're considering wiring a power station into your home's electrical panel, a transfer switch, or anything touching 240V household circuits, that work requires a licensed electrician and must meet local electrical code — this tool does not verify wiring safety or code compliance, and none of its output should be treated as electrical installation guidance.",
        ],
      },
      {
        id: "ups-and-transfer",
        heading: "UPS-style fast transfer: what \"unverified\" means here",
        body: [
          "Some power stations advertise a fast automatic transfer time (measured in milliseconds) suitable for sensitive electronics that can't tolerate even a brief power gap. There's no single industry-wide \"fast enough\" threshold this calculator can apply — when you flag this requirement, it simply shows each product's manufacturer-published transfer time (or flags it as not verified) so you can judge it against your own equipment's tolerance.",
        ],
      },
    ],
    commonMistakes: [
      "Marking every load as coinciding by default, which can inflate the required continuous/surge output well beyond what's realistic.",
      "Sizing for capacity (Wh) but overlooking the continuous output (W) needed to actually run the loads at once.",
      "Assuming any power station output is safe to backfeed into household wiring without a transfer switch and an electrician.",
      "Treating an unverified 240V, TT-30, or UPS transfer-time field as a \"probably fine\" — an unknown field is never the same as a confirmed capability.",
    ],
    faq: [
      {
        question: "Can I just plug a power station into a wall outlet to power my house?",
        answer:
          "No — backfeeding power into household wiring without a proper transfer switch is a serious safety hazard, both for you and for utility workers. This calculator is for a standalone unit running extension cords or directly plugged-in devices, or a professionally installed transfer setup — always involve a licensed electrician for anything connecting to household circuits.",
      },
      {
        question: "What does it mean if a product is 'Not Suitable' for my 240V requirement?",
        answer:
          "It means that product does not have verified native 120/240V split-phase output, which you marked as required. It isn't hidden — the reason is shown so you can see exactly why it didn't qualify.",
      },
      {
        question: "How is this different from the general Power Calculator?",
        answer:
          "It uses the exact same underlying formulas, with home-backup-specific presets (fridge, freezer, sump pump, CPAP, router) and home-specific hard requirements (240V, TT-30/transfer, UPS-style switchover) surfaced up front, plus a per-load \"coincides with others\" toggle the general calculator doesn't expose.",
      },
    ],
    sources: [
      "PowerMatchLab's own Power Calculator methodology (same formulas, see About & Methodology)",
    ],
    relatedGuideSlugs: ["power-station-for-home-backup", "power-station-for-power-outage", "power-station-for-sump-pump"],
    relatedBestForSlug: "best-for-home-backup",
    lastUpdated: "2026-09-11",
  },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
