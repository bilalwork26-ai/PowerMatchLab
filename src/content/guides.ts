/**
 * Editorial guide content.
 *
 * Hand-written educational material. Guides teach general concepts and then hand
 * the reader to the calculator / compare tools. They never assert product
 * specifics beyond what `products.json` verifies, and they carry sources +
 * a "last updated" date.
 */

export interface GuideSection {
  id: string;
  heading: string;
  /** Paragraphs; each string is one <p>. */
  body: string[];
  bullets?: string[];
}

export interface GuideFaq {
  question: string;
  answer: string;
}

/**
 * A source citation. A plain string keeps the older, unlinked form used by
 * earlier guides; an object with `url` renders as a clickable link to the
 * official/primary source, for guides that cite one.
 */
export type GuideSource = string | { label: string; url: string };

/** The four visible groups the Guides index is organized into. */
export type GuideGroup = "basics" | "runtime" | "use-cases" | "charging-ownership";

export const GUIDE_GROUP_LABELS: Record<GuideGroup, string> = {
  basics: "Power Station Basics",
  runtime: "Appliance Runtime Guides",
  "use-cases": "Use Cases",
  "charging-ownership": "Charging, Solar and Ownership",
};

export interface Guide {
  slug: string;
  title: string;
  metaDescription: string;
  /** Which of the four visible index groups this guide belongs to. */
  group: GuideGroup;
  intro: string[];
  /** Short, skimmable takeaways shown before the FAQ. Optional for older guides. */
  keyTakeaways?: string[];
  /** Ordered sections; the table of contents is derived from these. */
  sections: GuideSection[];
  /** Product ids to surface as "related" (must exist in products.json). */
  relatedProductIds: string[];
  /** Other guide slugs to cross-link (must exist in GUIDES). Optional. */
  relatedGuideSlugs?: string[];
  faq: GuideFaq[];
  sources: GuideSource[];
  lastUpdated: string; // ISO date
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-size-a-portable-power-station",
    group: "basics",
    title: "How to Size a Portable Power Station (How Many Watt-Hours Do I Need?)",
    metaDescription:
      "How many watt-hours you need: a plain-English method for choosing power station capacity and output, with the formula, a worked example, and continuous/surge checks.",
    intro: [
      "Short answer: recommended minimum capacity (Wh) ≈ (your daily energy use in Wh × days of autonomy) ÷ 0.85 usable-energy factor × 1.2 reserve factor. There is no single \"right\" watt-hour number that applies to everyone — it depends entirely on what you plan to run and for how long.",
      "Sizing a power station really comes down to two independent questions: can it deliver enough power at once (watts), and can it store enough energy for how long you need it (watt-hours).",
      "This guide walks through both, using the same method as the PowerMatchLab Power Calculator so you can sanity-check its output.",
    ],
    keyTakeaways: [
      "Recommended capacity ≈ (daily energy Wh × days of autonomy) ÷ 0.85 usable-energy × 1.2 reserve headroom.",
      "List every device's real running watts and hours/day first — from a rating label, manual, or plug-in energy meter, never a guess.",
      "Watt-hours (capacity) and watts (output) are separate questions: capacity says how long, output says whether it can start the device at all.",
      "Add the largest single startup surge on top of everything else running, and check it against the station's surge rating.",
      "The Power Calculator runs this exact formula against your own device list and shows which catalog products actually clear it.",
    ],
    sections: [
      {
        id: "watts-vs-watt-hours",
        heading: "Watts vs. watt-hours",
        body: [
          "Watts (W) measure instantaneous demand — how much a device pulls while it runs. Watt-hours (Wh) measure energy over time — watts multiplied by hours.",
          "A power station has a rated continuous output in watts and a battery capacity in watt-hours. You need the output to be at least as large as everything you run simultaneously, and the capacity to be large enough to cover total energy use before you can recharge.",
        ],
      },
      {
        id: "list-devices",
        heading: "Step 1: List every device and its running watts",
        body: [
          "Write down each device you want to power, its running watts, how many of them, and how many hours per day each runs. Nameplate labels, the manufacturer's spec sheet, or a plug-in power meter are the best sources.",
          "Motor-driven devices (fridges, pumps, power tools) also have a startup surge that is much higher than their running watts, often two to three times, for a fraction of a second.",
        ],
      },
      {
        id: "daily-energy",
        heading: "Step 2: Estimate daily energy",
        body: [
          "For each device: running watts × quantity × hours per day = watt-hours per day. Add them up for a daily total.",
          "Refrigerators are the classic trap: a fridge might draw 150 W while the compressor runs, but the compressor is only on part of the time, so real daily energy is often 1,000-1,600 Wh, not 150 W × 24 h.",
        ],
      },
      {
        id: "reserve",
        heading: "Step 3: Convert energy demand into required capacity",
        body: [
          "Batteries do not deliver 100% of their nameplate energy to your devices. Inverter and conversion losses mean roughly 80-90% is usable in practice; PowerMatchLab plans with 85%.",
          "It is also unwise to run a battery flat every cycle. Adding around 20% reserve headroom protects cycle life and covers estimate error.",
          "So: recommended minimum capacity ≈ (daily energy × days) ÷ 0.85 × 1.2.",
        ],
      },
      {
        id: "output-surge",
        heading: "Step 4: Check continuous and surge output",
        body: [
          "Add the running watts of everything that could be on at the same time — that is your required continuous output.",
          "Then take the single largest startup surge and add it on top of the rest running. If the power station's surge (peak) rating is below that number, large motors may trip it even if daily energy is fine.",
        ],
      },
      {
        id: "special-cases",
        heading: "Special cases: 240V, RV, and expansion",
        body: [
          "Some well pumps, ranges and EV chargers need 120/240V split-phase output. Only a few large stations provide it natively.",
          "RV owners often want a TT-30 (30A) outlet so they can plug the rig's shore cord straight in.",
          "If your needs might grow, an expandable platform lets you add battery capacity later instead of buying a second unit.",
        ],
      },
    ],
    relatedProductIds: [
      "jackery-explorer-1000-v2",
      "ecoflow-river-2-pro",
      "segway-cube-1000",
    ],
    relatedGuideSlugs: [
      "what-is-a-portable-power-station",
      "watts-vs-watt-hours",
      "how-to-choose-the-right-portable-power-station",
    ],
    faq: [
      {
        question: "Is a bigger power station always better?",
        answer:
          "No. Oversizing adds weight, cost and charging time you may not need. The goal is enough capacity to cover your energy demand with sensible reserve, and enough output for your simultaneous load.",
      },
      {
        question: "How many days of backup should I plan for?",
        answer:
          "It depends on whether you can recharge. If you have solar or can reach grid power daily, one day of autonomy may be enough. For outages with no recharge option, plan for the longest realistic gap.",
      },
      {
        question: "Do I need to match surge watts exactly?",
        answer:
          "You need the station's surge rating to be at least your estimated peak. Some headroom is good; matching to the watt is not necessary.",
      },
    ],
    sources: [
      "U.S. Department of Energy — Appliance and electronic energy use guidance",
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-01",
  },
  {
    slug: "can-a-power-station-run-a-refrigerator",
    group: "runtime",
    title: "Can a Power Station Run a Refrigerator, and For How Long?",
    metaDescription:
      "Most 1kWh-class power stations can run a household refrigerator for many hours. How to check surge watts, daily energy, and calculate realistic runtime by capacity.",
    intro: [
      "Short answer: yes, most 1kWh-class and larger power stations can run a household refrigerator, commonly for somewhere around 12-24+ hours per full charge depending on capacity and the fridge's real draw — with two caveats: the station's surge rating must clear the compressor's startup spike, and the exact runtime depends on your specific fridge.",
      "This guide covers both the feasibility check and the runtime math, so you can answer \"will it work\" and \"for how long\" together.",
    ],
    keyTakeaways: [
      "The startup surge (often 2–3× running watts) is the first hurdle — check it against the station's surge/peak rating.",
      "A household fridge typically uses about 1,000–1,600 Wh/day because the compressor cycles rather than running continuously.",
      "Estimated runtime (hours) = usable capacity (≈85% of rated Wh) ÷ the fridge's average running watts.",
      "A 1,000Wh-class station commonly runs a ~150 W fridge for roughly 5-6 hours of continuous compressor operation, but cycling stretches wall-clock coverage further — see the worked table below.",
      "Solar input can extend or, in good conditions, indefinitely sustain fridge-only operation.",
    ],
    sections: [
      {
        id: "surge",
        heading: "The startup surge is the first hurdle",
        body: [
          "A fridge compressor can briefly pull two to three times its running watts when it kicks on. If a device draws 150 W running, its surge might be 400-800 W for a moment.",
          "Any power station whose surge (peak) rating comfortably exceeds that spike should start it without tripping.",
        ],
      },
      {
        id: "daily-energy",
        heading: "Daily energy, not running watts",
        body: [
          "Because the compressor cycles, a household fridge typically uses roughly 1,000-1,600 Wh per day. A warm room, a full fridge, or frequent door openings push it higher.",
          "Divide the station's usable energy (about 85% of nameplate) by that daily figure to estimate days of fridge-only runtime.",
        ],
      },
      {
        id: "runtime",
        heading: "Estimating runtime",
        body: [
          "PowerMatchLab's product pages show an estimated runtime table using estimated_runtime_hours = capacity_wh × 0.85 ÷ device_watts. Treat it as a planning estimate, not a guarantee — your fridge's real draw varies.",
          "Applied to a ~150 W fridge (a common published average) across a few capacity classes now in the PowerMatchLab catalog, from compact to whole-home-backup units:",
        ],
        bullets: [
          "~300Wh-class (e.g. a compact unit): 300 × 0.85 ÷ 150 ≈ 1.7 hours",
          "~1,000Wh-class: 1,000 × 0.85 ÷ 150 ≈ 5.7 hours",
          "~2,000Wh-class: 2,000 × 0.85 ÷ 150 ≈ 11.3 hours",
          "~4,100Wh-class (the largest currently listed): 4,100 × 0.85 ÷ 150 ≈ 23.2 hours",
        ],
      },
      {
        id: "keep-going",
        heading: "Keeping the fridge going for longer",
        body: [
          "Pairing the station with solar input can extend or indefinitely sustain fridge-only operation in good conditions.",
          "Expandable platforms let you bolt on extra battery capacity for multi-day outages.",
        ],
      },
    ],
    relatedProductIds: [
      "jackery-explorer-2000-v2",
      "bluetti-ac200l",
    ],
    relatedGuideSlugs: [
      "power-station-for-refrigerator",
      "how-long-will-a-1000wh-power-station-last",
      "power-station-for-power-outage",
    ],
    faq: [
      {
        question: "Will a 300Wh power station run a fridge?",
        answer:
          "Only very briefly. A compact 288-300Wh unit may start a small fridge but will typically last only a couple of hours, and some small units cannot handle the surge at all.",
      },
      {
        question: "How do I measure my fridge's real energy use?",
        answer:
          "Plug it into an inexpensive plug-in energy meter for 24 hours. That gives you a real Wh/day figure to use in the calculator.",
      },
    ],
    sources: [
      "ENERGY STAR — Refrigerator energy use references",
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-01",
  },
  {
    slug: "lifepo4-vs-nmc-battery-chemistry",
    group: "basics",
    title: "LiFePO4 vs. NMC: Battery Chemistry for Power Stations",
    metaDescription:
      "Why most current portable power stations use LiFePO4 (LFP): longer cycle life, better thermal stability, slightly lower energy density. What it means for buyers.",
    intro: [
      "Every power station in the current PowerMatchLab catalog uses LiFePO4 (lithium iron phosphate, or LFP). Here is why the industry has shifted this way, and what the trade-offs mean for you.",
    ],
    sections: [
      {
        id: "cycle-life",
        heading: "Cycle life",
        body: [
          "LFP cells typically tolerate several thousand charge/discharge cycles before dropping to 80% capacity — often 3,000 to 6,000+ depending on the cell and how it is managed. Older NMC (nickel manganese cobalt) packs usually rate for fewer cycles.",
          "For someone charging a station a few times a week, an LFP pack can realistically last well over a decade.",
        ],
      },
      {
        id: "safety",
        heading: "Thermal stability",
        body: [
          "LFP chemistry is more thermally stable and less prone to thermal runaway than NMC. That is a meaningful advantage for a battery you keep indoors or in a vehicle.",
        ],
      },
      {
        id: "density",
        heading: "Energy density and weight",
        body: [
          "NMC packs more energy into the same weight and volume, so an NMC station can be lighter for the same capacity. Modern LFP stations have narrowed this gap considerably.",
        ],
      },
      {
        id: "takeaway",
        heading: "Practical takeaway",
        body: [
          "For stationary backup and RV use, LFP's longevity and stability usually outweigh the small weight penalty. If absolute minimum weight for a given capacity is your priority, NMC still has an edge.",
        ],
      },
    ],
    relatedProductIds: [
      "bluetti-elite-30-v2",
      "anker-solix-f3000",
    ],
    relatedGuideSlugs: [
      "lifepo4-vs-lithium-ion",
      "how-long-does-a-portable-power-station-last",
      "how-to-choose-the-right-portable-power-station",
    ],
    faq: [
      {
        question: "Does cold weather affect LiFePO4?",
        answer:
          "Charging LFP below freezing can damage the cells, so many stations block or limit charging in the cold. Discharging in the cold is less of a problem but capacity drops temporarily.",
      },
      {
        question: "Is LiFePO4 worth paying more for?",
        answer:
          "If you plan to keep the unit for many years or cycle it often, the longer usable life generally justifies it. For occasional light use the difference matters less.",
      },
    ],
    sources: [
      "Battery chemistry overviews from cell manufacturers and DOE energy storage resources",
      "Cycle-life figures as published by manufacturers in products.json",
    ],
    lastUpdated: "2026-09-01",
  },
  {
    slug: "solar-input-and-charging-times-explained",
    group: "charging-ownership",
    title: "Solar Input and AC Charging Specs, Explained",
    metaDescription:
      "How to read a power station's solar input and AC charging specs, why real solar rarely hits the rated number, and how to plan realistic recharge times, with a worked AC example.",
    intro: [
      "Charging specs are easy to misread. This guide covers what AC charging watts, solar input watts, and quoted charging times actually tell you — with a worked example for each. For solar-specific worked examples across a few panel sizes, see PowerMatchLab's dedicated solar charging-time guide, linked below.",
    ],
    keyTakeaways: [
      "AC charging watts and solar input watts are two separate specs — a station's fastest possible recharge uses AC, not solar.",
      "Charging time (hours) ≈ capacity (Wh) ÷ charging input (W) — but the last 10-20% tapers, so real full-charge time runs a bit longer than the raw division.",
      "Real-world solar routinely delivers only 60-80% of a panel's rated watts because of angle, temperature, haze, and wiring losses.",
      "Some stations accept simultaneous AC + solar input for faster combined charging — check the spec sheet, since not all support it.",
      "PowerMatchLab shows charging specs exactly as published by the manufacturer; an unknown value is shown as \"Not verified,\" never guessed.",
    ],
    sections: [
      {
        id: "ac-charging",
        heading: "AC (wall) charging",
        body: [
          "AC charging watts is the fastest a station refills from a normal outlet. Charging time (hours) ≈ capacity (Wh) ÷ AC charging watts, though the last 10-20% of any charge tapers to protect the battery, so quoted 'full charge' times run a little longer than the raw division suggests.",
          "Worked example using real catalog specs: the EcoFlow DELTA 3 Classic (1,024 Wh) has a documented 1,400 W AC charging input. 1,024 ÷ 1,400 ≈ 0.73 hours (about 44 minutes) for the raw calculation — consistent with EcoFlow's own published \"~1 hour\" full-charge figure once tapering is factored in.",
          "Fast AC charging is convenient but repeatedly charging at maximum rate can add heat; some units let you choose a slower, cooler charging mode.",
        ],
      },
      {
        id: "solar-input",
        heading: "Solar input",
        body: [
          "Solar input watts is the maximum the charge controller will accept, along with a voltage and current window your panels must stay within.",
          "Real-world solar routinely delivers 60-80% of a panel's rating because of angle, temperature, haze, wiring losses and time of day. Size your array so its rating comfortably exceeds your daily energy need.",
        ],
      },
      {
        id: "planning",
        heading: "Planning a realistic recharge",
        body: [
          "For off-grid use, the useful question is whether a day's solar harvest replaces a day's energy use. If your panels realistically make 1,500 Wh on an average day and you use 1,200 Wh, you have margin.",
          "The PowerMatchLab charging figures come straight from manufacturer specs; where a value is unknown we show 'Not verified' rather than guessing.",
        ],
      },
    ],
    relatedProductIds: [
      "ecoflow-delta-3-classic",
      "anker-solix-f3800",
    ],
    relatedGuideSlugs: [
      "how-long-to-charge-power-station-with-solar",
      "how-many-solar-panels-do-i-need",
      "solar-generator-vs-portable-power-station",
    ],
    faq: [
      {
        question: "Can I charge from solar and AC at the same time?",
        answer:
          "Many stations support simultaneous AC + solar input for faster charging, but not all. Check the spec sheet for combined input limits.",
      },
      {
        question: "Why is my solar input lower than the panel rating?",
        answer:
          "Panels are rated under ideal lab conditions. Real output depends on sun angle, temperature, shading and cabling. 60-80% of the rating on a good day is typical.",
      },
    ],
    sources: [
      "National Renewable Energy Laboratory — photovoltaic performance basics",
      "Manufacturer charging specifications referenced in products.json",
    ],
    lastUpdated: "2026-09-01",
  },
  {
    slug: "power-station-for-refrigerator",
    group: "runtime",
    title: "What Size Power Station Do I Need for a Refrigerator?",
    metaDescription:
      "A step-by-step method for sizing a power station to run a refrigerator: startup surge, daily watt-hours, the 85% usable-energy rule, and a worked example.",
    intro: [
      "A refrigerator is one of the most common reasons people buy a portable power station, and it is also one of the easiest appliances to undersize for if you only look at the number on the door sticker.",
      "This guide walks through the same watts-vs-watt-hours method used throughout PowerMatchLab, applied specifically to a fridge or freezer, so you can size a station with confidence instead of guessing.",
    ],
    keyTakeaways: [
      "A full-size fridge commonly uses about 1,000–1,600 Wh/day — check with a plug-in energy meter for your real figure.",
      "The station's surge rating, not just its continuous rating, must clear the compressor's startup spike (often 2–3× running watts).",
      "Recommended capacity ≈ (daily energy × days) ÷ 0.85 usable-energy × 1.2 reserve.",
      "Multi-day outages multiply energy needs fast — solar input or an expandable platform usually beats one oversized fixed battery.",
      "Pure sine wave AC (standard on PowerMatchLab-listed stations) runs a compressor more smoothly than modified-sine-wave power.",
    ],
    sections: [
      {
        id: "watts-vs-watt-hours-fridge",
        heading: "Watts tell you if it will start; watt-hours tell you how long it will run",
        body: [
          "Watts (W) measure how much power your fridge pulls at a given instant. Watt-hours (Wh) measure energy used over time — watts multiplied by hours. A power station has two separate specs that map to these: a continuous output rating in watts, and a battery capacity in watt-hours.",
          "Sizing for a fridge means clearing both bars: the station's output must handle the compressor's peak demand, and its capacity must hold enough energy for however long you need the fridge running before you can recharge.",
        ],
      },
      {
        id: "find-real-draw",
        heading: "Step 1: Find your fridge's real power draw",
        body: [
          "Do not rely on a guess. Check the rating label — usually inside the fridge on a side wall, or on the back or bottom — for its running watts, or its amps and voltage (watts ≈ amps × volts). The owner's manual usually repeats the same figures.",
          "The label shows a rated maximum, not what the compressor actually pulls while cycling on and off. For a real number, plug the fridge into an inexpensive plug-in energy meter for 24 hours; it will report actual watt-hours used that day, which is the number that matters for sizing.",
        ],
      },
      {
        id: "surge-fridge",
        heading: "Step 2: Account for the startup surge",
        body: [
          "A compressor briefly pulls far more than its running watts the instant it starts — commonly two to three times as much, for well under a second. A fridge that runs at 150 W might surge to 300-450 W or more on startup.",
          "Check your power station's surge or peak output rating, not only its continuous rating. If the surge rating does not comfortably clear your fridge's startup spike, the station can shut off or fail to start the compressor at all — even though its continuous wattage looked like plenty on paper.",
        ],
      },
      {
        id: "daily-energy-fridge",
        heading: "Step 3: Estimate daily energy use",
        body: [
          "Because the compressor cycles rather than running continuously, a full-size household refrigerator commonly uses somewhere in the range of 1,000-1,600 Wh per day, based on typical figures published by ENERGY STAR and the U.S. Department of Energy. A warmer room, an older or less efficient unit, a full-size side-by-side, frequent door openings, or a warm kitchen can push that higher; an efficient, well-sealed unit in a cool space can run lower.",
          "Treat that range as a starting point only — the 24-hour energy-meter reading from Step 1 is a far more accurate number for your specific fridge, in your specific kitchen, at your specific ambient temperature.",
        ],
      },
      {
        id: "capacity-formula-fridge",
        heading: "Step 4: Convert daily energy into a recommended capacity",
        body: [
          "A power station never delivers 100% of its rated capacity to your fridge — inverter and conversion losses take a share. PowerMatchLab plans around 85% usable energy, the same conservative planning figure used in the Power Calculator.",
          "It's also worth keeping roughly 20% reserve headroom above the bare minimum, so the battery isn't run flat every cycle and there's margin for estimate error. Put together: recommended minimum capacity (Wh) ≈ (daily energy Wh × days of autonomy) ÷ 0.85 × 1.2.",
          "Worked example: your energy meter shows the fridge uses 1,200 Wh in 24 hours, and you want to cover one full day without recharging. 1,200 ÷ 0.85 × 1.2 ≈ 1,694 Wh. A station rated meaningfully above that — leaving room to also run a few lights or charge a phone — gives comfortable margin.",
          "For multi-day outages, multiply the daily figure by the number of days first. Two days at 1,200 Wh/day is 2,400 Wh of demand before the efficiency and reserve adjustments — capacity requirements grow quickly, which is where solar input becomes valuable.",
        ],
      },
      {
        id: "continuous-output-fridge",
        heading: "Step 5: Confirm continuous output covers everything running at once",
        body: [
          "Add the running watts of the fridge to anything else you plan to run at the same time — a few lights, a router, a phone charger. That total is your required continuous output, separate from the capacity question above.",
          "All PowerMatchLab-listed stations output pure sine wave AC, the type generally recommended for compressor motors; it runs the compressor more smoothly and quietly than a modified-sine-wave inverter.",
        ],
      },
      {
        id: "mini-fridge-freezer",
        heading: "Mini fridges, chest freezers, and other variants",
        body: [
          "A dorm-size mini fridge or a beverage cooler typically draws less power and less daily energy than a full-size kitchen refrigerator, so a smaller, lighter station can cover it — but confirm with the same label check and, ideally, a real energy-meter reading rather than assuming it's automatically small.",
          "A standalone chest freezer can use more or less energy than a fridge depending on size, insulation, and how full it is (a fuller freezer holds cold better and cycles less); size it the same way, using its own measured or labeled figures rather than the fridge's.",
        ],
      },
      {
        id: "extending-runtime-fridge",
        heading: "Extending runtime for longer outages",
        body: [
          "Solar input lets a station recharge during the day while still running the fridge, which can extend — or in good sun, sustain indefinitely — fridge-only operation. Real-world solar output is usually well below a panel's rated watts; PowerMatchLab's solar guide covers why.",
          "An expandable platform lets you add battery modules later instead of buying a second, separate unit if your outage-duration needs grow.",
        ],
      },
    ],
    relatedProductIds: [
      "jackery-explorer-2000-v2",
      "ecoflow-delta-3-classic",
      "anker-solix-c2000-gen-2",
    ],
    faq: [
      {
        question: "Will a small, ~300Wh power station run a refrigerator?",
        answer:
          "Only briefly. A compact station in the 288-300Wh class may be able to start a small fridge, but typically sustains it for only a couple of hours at most, and on some very compact units the surge draw alone can be a problem. For anything beyond a short bridge, a 1kWh-class or larger station is the realistic starting point.",
      },
      {
        question: "Does a power station need a special mode to run a fridge?",
        answer:
          "No special mode is generally required — the station just needs to comfortably clear the fridge's surge and continuous watts, and hold enough capacity for your target runtime. Some stations offer a UPS/pass-through mode, useful if you want the fridge on wall power normally and only on battery during an actual outage.",
      },
      {
        question: "How accurate is the 1,000-1,600 Wh/day range?",
        answer:
          "It's a reasonable planning range for a typical full-size refrigerator, not a guarantee for your unit. Age, size, ambient temperature and usage habits all move the real number meaningfully — a 24-hour plug-in energy meter reading is the most reliable way to replace the range with your own figure.",
      },
    ],
    sources: [
      { label: "ENERGY STAR — Refrigerators", url: "https://www.energystar.gov/products/refrigerators" },
      {
        label: "U.S. Department of Energy — \"Your Refrigerator Is Only As Efficient As You\"",
        url: "https://www.energy.gov/energysaver/articles/your-refrigerator-only-efficient-you",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "power-station-for-cpap",
    group: "runtime",
    title: "How Long Can a Power Station Run a CPAP Machine?",
    metaDescription:
      "How long a power station runs a CPAP machine, by capacity class: the formula, why wattage varies by model and humidifier setting, and how to check your device's real draw.",
    intro: [
      "This is general planning information about sizing and estimating runtime for a portable power station running CPAP equipment — it is not medical advice. For anything related to your therapy itself, follow the guidance of your CPAP manufacturer or durable medical equipment (DME) provider.",
      "Short answer: at a commonly-cited ~40 W CPAP draw (blower plus a modest humidifier setting), a compact ~268-300Wh station typically covers well under one full 8-hour night, a ~1,000Wh-class station covers roughly two to three nights, and a ~2,000Wh-class or larger station can cover five or more nights — but the real number depends entirely on your machine's actual watts, which varies a lot by model and humidifier setting.",
      "CPAP machines draw far less power than a refrigerator, but exactly how much varies a lot by model and by whether a heated humidifier and heated tubing are in use — so the first step is finding your own device's real number rather than assuming one.",
    ],
    keyTakeaways: [
      "Estimated runtime (hours) = usable capacity (≈85% of rated Wh) ÷ your CPAP's real watts — always check the rating label, never assume a number.",
      "A heated humidifier and heated hose can add a substantial load on top of the blower alone — check your device's label with the humidifier at your usual setting.",
      "Startup surge is rarely an issue for CPAP (unlike a fridge) since blower motors are small, but confirm with your device's own spec sheet.",
      "At ~40 W, a compact ~268-300Wh station covers well under a full night; a ~1,000Wh-class station covers roughly 2-3 nights — see the worked table below.",
      "This is a planning estimate, not medical guidance — never rely on an untested estimate for a medical necessity; keep a backup plan for extended outages.",
    ],
    sections: [
      {
        id: "why-cpap-varies",
        heading: "Why CPAP power draw varies so much",
        body: [
          "A CPAP's blower motor alone typically draws a relatively small, steady wattage. A heated humidifier and heated hose, when fitted and switched on, add a separate and often larger load, and how high you set the humidity/heat level changes that further.",
          "That means two people with the \"same\" CPAP model can have meaningfully different real-world power draw simply based on their humidifier settings — there is no single number that applies to every setup.",
        ],
      },
      {
        id: "find-cpap-draw",
        heading: "Step 1: Find your machine's real power draw",
        body: [
          "Check the rating label on the underside or back of the CPAP unit, or on its external power supply (\"brick\"), for watts or VA (volt-amps, roughly comparable to watts for this purpose). The user manual usually lists the same figures, sometimes with separate numbers for the blower alone versus blower plus humidifier.",
          "As one published example, ResMed's own knowledge base lists a typical power draw of about 6.3 W and a peak of about 27 W for its compact AirMini travel CPAP — see the source link below. That figure is specific to that one model and does not represent full-featured CPAPs with a heated humidifier, which draw more. Always use your own device's label rather than another model's number.",
          "If your machine has a separate DC (car-style) power cord, its listed DC wattage is often close to what a power station's AC output would deliver for the same settings, but check both the AC adapter's rating and any DC cord rating if you have one, since manufacturers sometimes list them differently.",
        ],
      },
      {
        id: "surge-cpap",
        heading: "Surge is usually a non-issue, but check anyway",
        body: [
          "Unlike a compressor-driven appliance such as a refrigerator, most CPAP blower motors are small and do not have a large startup surge. Most power stations handle a CPAP's continuous watts with plenty of room to spare on the surge side.",
          "Still, check your specific model's spec sheet if it lists a surge or peak figure, and don't assume — \"usually fine\" is not the same as verified for your exact machine.",
        ],
      },
      {
        id: "sizing-per-night",
        heading: "Step 2: Size capacity for the number of nights you need",
        body: [
          "The math is the same method used throughout PowerMatchLab: nightly energy (Wh) = device watts × hours of use. For CPAP, \"hours of use\" is simply how long you sleep with it running.",
          "Worked example: a machine that draws 40 W with the humidifier on, used for 8 hours, uses 320 Wh that night. Applying the standard 85% usable-energy assumption and 20% reserve headroom used across PowerMatchLab: 320 ÷ 0.85 × 1.2 ≈ 452 Wh minimum recommended capacity for one night, before anything else you plan to run from the same station.",
          "For multiple nights without recharging — camping, travel, or a power outage — multiply the nightly figure by the number of nights first, the same way the refrigerator and general sizing guides do.",
          "Turning that around into estimated runtime (usable capacity ÷ device watts) at the same 40 W draw, across capacity classes now in the PowerMatchLab catalog:",
        ],
        bullets: [
          "~268Wh-class (e.g. a compact unit): 268 × 0.85 ÷ 40 ≈ 5.7 hours — well under one full 8-hour night",
          "~1,000Wh-class: 1,000 × 0.85 ÷ 40 ≈ 21.3 hours — roughly 2-3 nights",
          "~2,000Wh-class: 2,000 × 0.85 ÷ 40 ≈ 42.5 hours — roughly 5 nights",
          "~4,100Wh-class (the largest currently listed): 4,100 × 0.85 ÷ 40 ≈ 87.1 hours — roughly 11 nights",
        ],
      },
      {
        id: "pure-sine-cpap",
        heading: "AC power type matters for some CPAP setups",
        body: [
          "All PowerMatchLab-listed stations output pure sine wave AC. Many CPAP manufacturers recommend or require pure sine wave power, particularly for machines with a heated humidifier, since a stepped or \"modified\" sine wave can cause heating elements or electronics in some devices to behave unpredictably or trigger a fault.",
          "If you plan to run your CPAP from any power source while traveling, confirm compatibility in your device's manual rather than assuming — this matters more for older or non-CPAP-specific inverters than for the stations reviewed here, but it's worth the two-minute check.",
        ],
      },
      {
        id: "backup-planning-cpap",
        heading: "Planning for outages if you depend on CPAP nightly",
        body: [
          "If you use CPAP therapy every night, a compact station sized for a few nights of runtime is a reasonable baseline for most outages, with the option to recharge from a car or solar panel to extend coverage further.",
          "Keep the math conservative: size for your humidifier-on, worst-case wattage rather than the blower-only minimum, so an unexpectedly long outage doesn't catch you short partway through the night.",
        ],
      },
    ],
    relatedProductIds: [
      "vtoman-flashspeed-1000",
    ],
    relatedGuideSlugs: [
      "what-can-a-1000-watt-power-station-run",
      "how-long-will-a-1000wh-power-station-last",
      "power-station-for-power-outage",
    ],
    faq: [
      {
        question: "How long will a power station run my CPAP?",
        answer:
          "Divide the station's usable capacity (roughly 85% of its rated Wh) by your machine's real watts to get hours of runtime, then compare that to your typical hours of use per night. The Power Calculator does this math once you enter your device's real numbers.",
      },
      {
        question: "Does the heated humidifier really change things that much?",
        answer:
          "It can. A humidifier and heated hose add a separate load on top of the blower, and how high you set the heat changes it further — check your own device's label with the humidifier at your usual setting, not just the blower-only figure.",
      },
      {
        question: "Can I run my CPAP from a power station's DC output instead of AC?",
        answer:
          "Some CPAP machines accept DC input directly via a separate cord, which skips the inverter stage and can be marginally more efficient. Check whether your model supports this and what cord it requires; if not, the AC outlet is the standard path.",
      },
      {
        question: "Is this guide medical advice?",
        answer:
          "No. It only covers electrical sizing for a power station. For anything related to your prescribed therapy, settings, or what to do during an equipment interruption, follow the guidance of your CPAP manufacturer or DME provider.",
      },
    ],
    sources: [
      {
        label: "ResMed — How much power does the AirMini machine draw?",
        url: "https://ap.resmed.com/knowledge/how-much-power-does-the-airmini-machine-draw",
      },
      "Individual CPAP manufacturer manuals and rating labels (device-specific — verify your own model)",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "power-station-for-camping",
    group: "use-cases",
    title: "What Size Power Station Do I Need for Camping?",
    metaDescription:
      "Sizing a power station for camping: gear to plan for, daily energy vs. peak watts, trip length and rechargeability, and why battery power avoids generator carbon monoxide risk.",
    intro: [
      "Camping loads are usually smaller and more varied than a home-backup setup — phones, lights, a fan, maybe a 12V cooler or a drone battery — but trip length and how (or whether) you can recharge along the way change the sizing math more than the gear list does.",
      "This guide applies the same watts-vs-watt-hours method used across PowerMatchLab to a camping trip, with a worked example you can adapt to your own gear.",
    ],
    keyTakeaways: [
      "List every device you'll actually run, its real watts, and hours/day — camping loads are usually small but add up over a trip.",
      "Trip length and whether you can recharge daily (vehicle, hookup, solar) matter more to sizing than the gear list itself.",
      "A compressor-driven 12V cooler needs its startup surge checked against the station's surge rating, same as any motor.",
      "A battery station produces no exhaust, unlike a fuel generator — the CPSC has documented carbon-monoxide deaths from generators used near tents.",
      "Weight is a real trade-off: check each product's listed weight if the trip is backpacked rather than vehicle-carried.",
    ],
    sections: [
      {
        id: "camping-gear-list",
        heading: "Step 1: List your gear and its real watts",
        body: [
          "Start with every device you actually plan to power: phone and headlamp charging, a camp fan or string lights, a 12V or AC cooler/fridge, camera or drone battery charging, maybe a CPAP machine (see the dedicated CPAP guide) or a laptop for remote work.",
          "Check each device's rating label, charger brick, or manual for its running watts — do not estimate. Small USB devices are usually a few watts each; a 12V compressor cooler or an AC mini-fridge can be tens to over a hundred watts running, with its own startup surge if it's compressor-driven.",
        ],
      },
      {
        id: "camping-daily-energy",
        heading: "Step 2: Estimate daily energy per device",
        body: [
          "For each device: watts × quantity × hours used per day = watt-hours per day. Add them up for your daily total. A phone charge might be 10-15 Wh total; an evening of string lights at 5 W for four hours is 20 Wh; a 12V cooler cycling like a small fridge can be the largest single line item on the list.",
          "Be honest about hours of use — camping trips often run devices longer than a quick mental estimate suggests, especially lighting after dark and a cooler running continuously.",
        ],
      },
      {
        id: "camping-capacity-formula",
        heading: "Step 3: Convert to a recommended capacity",
        body: [
          "Using the same assumptions as the rest of PowerMatchLab — about 85% usable energy after conversion losses, plus roughly 20% reserve headroom: recommended minimum capacity (Wh) ≈ (daily energy Wh × days without recharge) ÷ 0.85 × 1.2.",
          "Worked example: phone charging (30 Wh), a lantern and string lights (40 Wh), and a 12V cooler (400 Wh) add up to 470 Wh/day. For a two-night trip with no recharge option: 470 × 2 ÷ 0.85 × 1.2 ≈ 1,327 Wh minimum recommended capacity. Adjust the device list and hours to match your own trip.",
          "If you can recharge daily — from a vehicle, a campground hookup, or solar — you generally only need to cover one day's gap at a time rather than the whole trip's total energy.",
        ],
      },
      {
        id: "camping-continuous-surge",
        heading: "Step 4: Check continuous and surge output",
        body: [
          "Add up the running watts of anything that could be on at once — most camping setups have a modest continuous requirement compared to home backup. Then add the largest single startup surge (a compressor-driven cooler is the most likely source) on top of everything else running, and check that figure against the station's surge/peak rating.",
          "All PowerMatchLab-listed stations output pure sine wave AC, which runs sensitive electronics and small compressor motors more predictably than a modified-sine-wave source.",
        ],
      },
      {
        id: "trip-length-recharge",
        heading: "Trip length and how you'll recharge",
        body: [
          "A weekend car-camping trip with daily vehicle access is a very different sizing problem from a week off-grid with no recharge option — the second scenario needs either much larger capacity or a reliable way to top up, typically solar.",
          "Real-world solar output is usually well below a panel's rated watts because of angle, temperature, haze and time of day — commonly in the 60-80% range on a good day, per general photovoltaic performance guidance. Size any solar input so its realistic output, not its rated number, covers your daily energy need. PowerMatchLab's dedicated solar guide covers this in more depth.",
        ],
      },
      {
        id: "why-battery-not-generator",
        heading: "Why campers often choose a battery station over a fuel generator",
        body: [
          "A battery-based power station has no exhaust and produces no carbon monoxide, unlike a fuel-burning generator. The U.S. Consumer Product Safety Commission has documented deaths from carbon monoxide poisoning tied to fuel-burning camping equipment used in or near enclosed spaces such as tents, and recommends never operating such equipment inside a tent, vehicle, or other enclosed area.",
          "A power station is also silent, which matters at most campgrounds' generator-hour rules and for anyone who would rather not run a small engine next to their tent overnight.",
        ],
      },
      {
        id: "portability-tradeoff",
        heading: "Portability vs. capacity",
        body: [
          "Bigger capacity generally means more weight — a real trade-off for backpacking versus car camping or overlanding, where the vehicle carries the weight instead of a person. Check the weight listed on each product's page and the Compare tool before deciding how much capacity is actually practical to bring.",
        ],
      },
    ],
    relatedProductIds: [
      "ecoflow-river-2-pro",
      "goal-zero-yeti-700",
    ],
    relatedGuideSlugs: [
      "power-stations-for-remote-work-and-van-life",
      "power-station-for-rv",
      "how-many-solar-panels-do-i-need",
    ],
    faq: [
      {
        question: "Do I need solar panels for camping, or is a bigger battery enough?",
        answer:
          "Either can work. A larger battery alone is simpler and needs no setup, but adds weight and eventually runs out with no recharge option. Solar adds complexity and depends on weather, but can extend a trip indefinitely in good conditions. Many campers carry a mid-size station and add a panel only for trips longer than a couple of days.",
      },
      {
        question: "Can I run a 12V cooler or fridge from a power station while camping?",
        answer:
          "Yes, most 12V coolers can run from a power station's DC or AC output — check the cooler's rated watts and, if compressor-driven, its startup surge, then size the station the same way as any other appliance.",
      },
      {
        question: "How many days can I go without recharging?",
        answer:
          "Divide the station's usable capacity (roughly 85% of rated Wh) by your daily energy total. For longer trips, either raise capacity, add solar, or plan a recharge stop — a vehicle outlet, a campground hookup, or a town run.",
      },
      {
        question: "Does cold weather at the campsite affect the battery?",
        answer:
          "It can. Battery performance and charging behavior vary by temperature and by chemistry; check your specific model's operating temperature range in its manual before a cold-weather trip, and avoid charging a cold battery below its rated minimum.",
      },
    ],
    sources: [
      {
        label: "U.S. Consumer Product Safety Commission — Carbon Monoxide Fact Sheet",
        url: "https://www.cpsc.gov/safety-education/safety-guides/carbon-monoxide/carbon-monoxide-fact-sheet",
      },
      {
        label: "U.S. Department of Energy / NREL — Understanding Solar Photovoltaic System Performance",
        url: "https://www.energy.gov/sites/default/files/2022-01/understanding-solar-photovoltaic-system-performance.pdf",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "power-station-for-home-backup",
    group: "use-cases",
    title: "What Size Power Station Do I Need for Home Backup?",
    metaDescription:
      "How to size a power station for whole-home or essential-circuit backup: which loads to prioritize, UPS switchover, 120/240V, and a worked capacity example.",
    intro: [
      "\"Home backup\" covers a wide range, from keeping the fridge, internet and a few lights on during a short outage to running most of a house for days. This guide helps you figure out which one you actually need before you size anything.",
      "The math is the same watts-vs-watt-hours method used throughout PowerMatchLab, applied to a whole household's essential circuits instead of a single appliance.",
    ],
    keyTakeaways: [
      "Name your priority circuits first (fridge, internet, lights, medical equipment) — a portable station realistically covers essentials, not a whole house.",
      "Essentials-only lists commonly land around 2,000–4,000 Wh/day, but your own added-up list is the number that matters.",
      "Recommended capacity ≈ (daily energy × days of autonomy) ÷ 0.85 × 1.2 — the same formula used across PowerMatchLab.",
      "A fast UPS switchover (commonly 10–20 ms) matters if you want automatic cutover for sensitive electronics.",
      "Wiring a station into your breaker panel via a transfer switch is an electrical installation — use a licensed electrician.",
    ],
    sections: [
      {
        id: "define-your-backup-scope",
        heading: "Step 1: Decide what \"backup\" means for your household",
        body: [
          "Start by naming the circuits or devices you actually need through an outage: refrigerator, freezer, internet router and modem, a few lights, phone charging, medical equipment, a sump pump, maybe a window AC or a well pump. Write the list down before looking at any product.",
          "A portable power station is generally an essentials device, not a whole-house generator replacement — sized realistically, it comfortably covers a defined list of priority loads rather than every circuit in the home.",
        ],
      },
      {
        id: "list-loads-home-backup",
        heading: "Step 2: List each load's running watts",
        body: [
          "For every item on your list, find its running watts from its rating label or manual, or measure it with a plug-in energy meter. Don't estimate — a router might be 10-15 W while a window AC can be several hundred to over a thousand.",
          "Note anything motor-driven (fridge, freezer, sump pump, well pump, some AC units) separately — these have a startup surge well above their running watts, covered in Step 4.",
        ],
      },
      {
        id: "daily-energy-home-backup",
        heading: "Step 3: Estimate total daily energy",
        body: [
          "Multiply each load's watts by how many hours per day you expect to run it, then add every load together for a daily watt-hour total. A fridge alone commonly uses roughly 1,000-1,600 Wh/day; add your other essentials on top.",
          "As a broad planning reference, a household running a compact essentials list — fridge, internet, phones, a few lights — often lands somewhere around 2,000-4,000 Wh per day, but your own list may be higher or lower; there is no substitute for adding up your own numbers from Step 2.",
        ],
      },
      {
        id: "capacity-formula-home-backup",
        heading: "Step 4: Convert to a recommended capacity",
        body: [
          "Using the same assumptions as the rest of PowerMatchLab — about 85% usable energy after conversion losses, plus roughly 20% reserve headroom: recommended minimum capacity (Wh) ≈ (daily energy Wh × days of autonomy) ÷ 0.85 × 1.2.",
          "Worked example: your essentials list adds up to 2,500 Wh/day, and you want to plan for one full day without recharging. 2,500 ÷ 0.85 × 1.2 ≈ 3,529 Wh minimum recommended capacity. A two-day plan without recharge roughly doubles the daily-energy figure before the same adjustment.",
          "Multi-day, no-recharge scenarios get large fast — this is where an expandable platform (add battery modules instead of buying a second unit) or a recharge plan (generator, solar, or grid access) usually makes more practical sense than one enormous fixed battery.",
        ],
      },
      {
        id: "continuous-surge-home-backup",
        heading: "Step 5: Confirm continuous output and surge headroom",
        body: [
          "Add the running watts of everything that could be on at once — that's your required continuous output. Then add your single largest startup surge (typically the fridge or a pump) on top of everything else running, and check that total against the station's surge/peak rating.",
          "Undersizing output is a common failure mode even when capacity looks fine on paper: a station with plenty of watt-hours can still trip or refuse to start a compressor if its continuous or surge watt rating is too low for what you're asking it to run at once.",
        ],
      },
      {
        id: "switchover-240v",
        heading: "UPS switchover time and 120/240V loads",
        body: [
          "If you want the station to take over automatically when the grid drops — keeping a desktop, networking gear, or certain medical devices running through the cutover — look for a fast switchover time, commonly in the 10-20 millisecond range on units that support it.",
          "Well pumps, electric ranges, dryers and some HVAC equipment need 120/240V split-phase power. Only a subset of large power stations provide this natively; most output 120V only. Confirm this before assuming a station can cover a 240V appliance.",
        ],
      },
      {
        id: "vs-generator",
        heading: "Power station vs. a standby or portable generator",
        body: [
          "A battery power station is silent, produces no exhaust, and needs no fuel — it can sit indoors and starts instantly. Its trade-off is finite capacity: once the battery is empty, you need to recharge it (grid, solar, or a generator) rather than just adding more fuel.",
          "A fuel generator can run indefinitely as long as fuel lasts, at the cost of noise, exhaust (never run one indoors or in an attached garage), and maintenance. Many households use a power station for quiet, everyday-length outages and treat a generator, if they have one, as backup for genuinely extended events.",
        ],
      },
      {
        id: "professional-install-note",
        heading: "Connecting to your home's electrical panel",
        body: [
          "Some larger power stations support a transfer switch or a dedicated inlet that can back up selected circuits directly from the breaker panel. This is an electrical installation, not a plug-and-play setup, and should be done by a licensed electrician.",
        ],
      },
    ],
    relatedProductIds: [
      "ecoflow-delta-pro-3",
      "anker-solix-f3000",
    ],
    relatedGuideSlugs: [
      "power-station-for-power-outage",
      "power-station-for-refrigerator",
      "how-to-choose-the-right-portable-power-station",
    ],
    faq: [
      {
        question: "Can a power station really back up my whole house?",
        answer:
          "For most households, no — a portable power station realistically covers a defined list of essential circuits (fridge, internet, some lights, phone charging, maybe a pump), not an entire home's simultaneous load. Whole-house coverage generally needs a much larger, professionally installed system.",
      },
      {
        question: "How much capacity do I need for a 24-hour outage?",
        answer:
          "Add up the daily energy of the specific loads you want to keep on (Step 3), then apply the 85% usable-energy and 20% reserve adjustments from Step 4. Essentials-only lists commonly land in the low thousands of watt-hours per day, but your own list is the number that matters.",
      },
      {
        question: "Do I need 240V?",
        answer:
          "Only if you have a specific 240V load you want to back up directly, like a well pump, electric range, or dryer. Most households running fridge/internet/lights/phones-class essentials only need 120V.",
      },
      {
        question: "Should I buy one large station or two smaller ones?",
        answer:
          "One larger unit is simpler and generally more energy-efficient. Two smaller units add redundancy and flexibility — useful if you want to back up two separate areas — but cost more per Wh and take more space.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of Energy — Estimating Appliance and Home Electronic Energy Use",
        url: "https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "power-station-for-rv",
    group: "use-cases",
    title: "What Size Power Station Do I Need for an RV?",
    metaDescription:
      "Sizing a power station for an RV: TT-30 shore-power compatibility, air conditioner surge, boondocking days, weight, and a worked capacity example.",
    intro: [
      "RV power needs range from topping off house batteries and running small electronics to starting a rooftop air conditioner. What you actually need depends heavily on which of those you're solving for.",
      "This guide applies PowerMatchLab's standard watts-vs-watt-hours method to RV-specific loads and constraints — shore-cord compatibility, big surge loads, and boondocking days without hookups.",
    ],
    keyTakeaways: [
      "A rooftop AC's startup surge is the hardest RV load to cover — check it against the station's surge rating before assuming it will work.",
      "A native TT-30 outlet lets you plug the RV's factory shore cord straight in; without one you're limited to household-outlet loads.",
      "Boondocking capacity ≈ (daily energy × days without recharge) ÷ 0.85 × 1.2 — multi-day figures get large fast.",
      "Some stations accept alternator or solar charging on the road — check the documented DC input spec before relying on it.",
      "An expandable platform usually beats one very large fixed battery if boondocking needs might grow.",
    ],
    sections: [
      {
        id: "rv-loads",
        heading: "Step 1: Separate small electronics from big appliances",
        body: [
          "Phones, laptops, lighting, a fan, and a TV are all modest, steady loads — usually single-digit to low double-digit watts for USB devices, tens to low hundreds of watts for AC electronics. A microwave, an electric kettle, or especially a rooftop air conditioner are a different category entirely, often several hundred to well over a thousand watts.",
          "Check each device's rating label or manual for its real running watts rather than guessing; RV appliance labels usually list both amps and watts.",
        ],
      },
      {
        id: "rv-ac-surge",
        heading: "The rooftop air conditioner is the hard case",
        body: [
          "A typical RV rooftop AC's compressor has a large startup surge, often several times its running watts, for a moment. Many portable power stations cannot start a rooftop AC directly without either a soft-start device on the AC itself or a station with very high surge headroom.",
          "If running the AC from a power station matters to you, check the specific unit's surge/peak output rating against your AC's documented starting characteristics (in its manual or on a soft-start kit's spec sheet) before assuming it will work — this is the single most common RV power-sizing disappointment.",
        ],
      },
      {
        id: "tt30",
        heading: "TT-30 shore-power compatibility",
        body: [
          "A native TT-30 (30A, 120V) outlet lets you plug your RV's standard shore cord straight into the power station, powering the rig's existing distribution panel and everything wired to it. Without a TT-30 outlet, you're limited to whatever household outlets the station provides, and higher-draw circuits inside the RV may not be reachable at all.",
          "Confirm both the outlet type and the amp rating — a household 15/20A outlet is not the same as a 30A shore-power circuit, even if voltage matches.",
        ],
      },
      {
        id: "boondocking-energy",
        heading: "Step 2: Estimate daily energy for boondocking",
        body: [
          "List every device you'll run away from hookups, its watts, and hours per day, then add them up the same way as any other PowerMatchLab sizing guide: watts × hours = watt-hours per device, summed for a daily total.",
          "Refrigeration (if it's not propane), lighting, water pump, fans, and device charging are the recurring daily loads for most boondocking setups; occasional loads like a microwave or hair dryer add a smaller amount depending on how often you actually use them.",
        ],
      },
      {
        id: "rv-capacity-formula",
        heading: "Step 3: Convert to a recommended capacity",
        body: [
          "The same adjustments apply as elsewhere on PowerMatchLab: about 85% usable energy after conversion losses, plus roughly 20% reserve headroom. Recommended minimum capacity (Wh) ≈ (daily energy Wh × days without recharge) ÷ 0.85 × 1.2.",
          "Worked example: your boondocking load list adds up to 900 Wh/day, and you're planning for three days without a recharge option. 900 × 3 ÷ 0.85 × 1.2 ≈ 3,812 Wh minimum recommended capacity — well into large-platform territory, which is where an expandable system or a daily recharge plan (driving, solar, or a campground hookup) usually makes more sense than one very large fixed battery.",
        ],
      },
      {
        id: "rv-recharge",
        heading: "Recharging on the road",
        body: [
          "Some power stations accept a 12V/24V DC input that can be fed from the vehicle's alternator with the right cable and current limits, letting you top up while driving between camp spots. Check the unit's documented DC input spec before relying on this.",
          "Solar panels can also recharge a station while parked, but real-world output is usually well below the panel's rated watts — commonly 60-80% on a good day — so size any panel setup so its realistic output, not its rated number, covers your daily need. PowerMatchLab's solar guide covers this in more depth.",
        ],
      },
      {
        id: "rv-weight",
        heading: "Weight, mounting, and expansion",
        body: [
          "A station that lives in the RV affects payload and needs a secure mounting spot, but portability matters less than for backpack-carried camping gear — check the weight listed on each product's page if payload is tight.",
          "For trips or setups where energy needs might grow, an expandable platform lets you add battery modules later instead of buying a second, separate unit.",
        ],
      },
    ],
    relatedProductIds: [
      "jackery-explorer-2000-plus",
      "anker-solix-c2000-gen-2",
      "pecron-e3600lfp",
    ],
    relatedGuideSlugs: [
      "solar-input-and-charging-times-explained",
      "watts-vs-watt-hours",
      "power-stations-for-remote-work-and-van-life",
    ],
    faq: [
      {
        question: "Will a power station run my RV's rooftop air conditioner?",
        answer:
          "Only if its surge/peak rating clearly covers the AC's documented startup surge — many cannot without a soft-start device fitted to the AC. Check both the AC's specs and the station's surge rating before assuming it will work; this is the most common RV sizing mismatch.",
      },
      {
        question: "Do I need a TT-30 outlet, or will a regular household outlet work?",
        answer:
          "If you want to plug your RV's factory shore cord straight in, you need a native TT-30 outlet. A household 120V outlet works for individual devices plugged in directly, but not for powering the rig's built-in distribution panel through its normal shore cord.",
      },
      {
        question: "Can a power station replace my RV's house battery and converter?",
        answer:
          "Not directly — a power station is a self-contained AC/DC source, not a wired-in replacement for the RV's existing 12V system, converter, and charger. Integrating one with the rig's electrical system generally needs additional wiring.",
      },
      {
        question: "How many boondocking days can I plan for?",
        answer:
          "Divide the station's usable capacity (roughly 85% of rated Wh) by your daily energy total from Step 2. For longer stretches, either raise capacity, add solar, or plan a recharge drive.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of Energy — Estimating Appliance and Home Electronic Energy Use",
        url: "https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use",
      },
      {
        label: "U.S. Department of Energy / NREL — Understanding Solar Photovoltaic System Performance",
        url: "https://www.energy.gov/sites/default/files/2022-01/understanding-solar-photovoltaic-system-performance.pdf",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "power-station-for-power-outage",
    group: "use-cases",
    title: "What Size Power Station Do I Need for a Power Outage?",
    metaDescription:
      "Preparing for a power outage with a portable power station: what to prioritize, how to size capacity for a few hours vs. multiple days, and generator safety.",
    intro: [
      "An outage guide is different from a single-appliance guide because the real question is priority: with limited capacity, what do you power first, and for how long? This guide walks through that decision alongside the same sizing method used across PowerMatchLab.",
      "If you already know you specifically need to cover a refrigerator, a CPAP machine, or your whole home's essential circuits, PowerMatchLab has a dedicated guide for each — this one is the general planning starting point.",
    ],
    keyTakeaways: [
      "Prioritize before sizing: refrigerator, phone/communication, lighting, and any medical equipment are the common short list.",
      "A short outage (hours) is mostly about the fridge and phones; a multi-day outage multiplies daily energy by the number of days.",
      "Recommended capacity ≈ (daily energy × days of outage) ÷ 0.85 × 1.2, and must clear the fridge's surge on top of everything else.",
      "Never run a fuel generator indoors, in a garage, or near windows/doors — the CPSC has documented carbon-monoxide deaths from this.",
      "A battery station has no exhaust risk, which is why many households keep one specifically for indoor-adjacent essentials.",
    ],
    sections: [
      {
        id: "prioritize-loads",
        heading: "Step 1: Prioritize what actually needs power",
        body: [
          "Ready.gov, the U.S. government's official emergency-preparedness site, recommends taking an inventory of what in your home depends on electricity before an outage happens, including talking to your medical provider about a plan for any electrically powered medical devices and any medication that requires refrigeration.",
          "A short list usually covers: refrigerator/freezer, phone and communication devices, lighting, internet/router if you need connectivity, and any medical equipment. Everything else — entertainment devices, non-essential appliances — is optional and can be added if capacity allows.",
        ],
      },
      {
        id: "short-vs-long-outage",
        heading: "Step 2: Decide whether you're planning for hours or days",
        body: [
          "A short outage (a few hours) is mostly about keeping the fridge from warming up and keeping phones charged — a compact station can comfortably cover this.",
          "A multi-day outage changes the math substantially: daily energy needs multiply by the number of days, which is why longer outages usually call for either a larger/expandable station, a recharge plan (solar or generator), or both. Size for the realistic worst case you're planning around, not just a typical short outage.",
        ],
      },
      {
        id: "outage-daily-energy",
        heading: "Step 3: Add up daily energy for your priority list",
        body: [
          "For each device on your priority list: watts × hours used per day = watt-hours per day, then add them together. A refrigerator alone is commonly 1,000-1,600 Wh/day; phone charging and a few LED lights add relatively little on top.",
          "Check devices' rating labels or manuals for real watts rather than guessing — this is the same rule as every other PowerMatchLab sizing guide, and it matters more, not less, in a real outage.",
        ],
      },
      {
        id: "outage-capacity-formula",
        heading: "Step 4: Convert to a recommended capacity",
        body: [
          "Using PowerMatchLab's standard assumptions — about 85% usable energy after conversion losses, plus roughly 20% reserve headroom: recommended minimum capacity (Wh) ≈ (daily energy Wh × days of outage) ÷ 0.85 × 1.2.",
          "Worked example: your priority list (fridge, phones, some lights) totals 1,400 Wh/day, and you're planning for a 2-day outage. 1,400 × 2 ÷ 0.85 × 1.2 ≈ 3,953 Wh minimum recommended capacity.",
        ],
      },
      {
        id: "outage-surge",
        heading: "Don't forget the surge, especially for the fridge",
        body: [
          "A refrigerator or freezer compressor surges to two to three times its running watts for a moment on startup. Whatever station you plan around needs a surge/peak rating that comfortably clears that spike, on top of enough continuous output for everything else running at the same time.",
        ],
      },
      {
        id: "generator-safety-outage",
        heading: "If you're also considering a fuel generator",
        body: [
          "A fuel-burning generator can run as long as fuel lasts, but produces carbon monoxide and must never run indoors, in a garage (even with the door open), or near windows or doors — the U.S. Consumer Product Safety Commission has documented carbon monoxide deaths tied to generators used too close to living spaces.",
          "A battery power station avoids this risk entirely since it has no exhaust, which is one reason many households keep one specifically for the indoor-adjacent essentials (fridge, medical devices, communication) while reserving a generator, if they have one, for larger or longer-duration loads outdoors.",
        ],
      },
      {
        id: "recharging-during-outage",
        heading: "Recharging mid-outage",
        body: [
          "Solar input can extend a station's coverage during a multi-day outage, though real-world output is usually well below a panel's rated watts. A car's outlet or DC input, where supported, is another option if you're mobile during the outage. Plan your recharge option before you need it, not during.",
        ],
      },
    ],
    relatedProductIds: [
      "jackery-explorer-1000-v2",
      "anker-solix-s2000",
    ],
    relatedGuideSlugs: [
      "power-station-for-refrigerator",
      "power-station-for-cpap",
      "power-station-for-home-backup",
    ],
    faq: [
      {
        question: "How long will a power station last during an outage?",
        answer:
          "Divide its usable capacity (roughly 85% of rated Wh) by your priority list's daily energy total from Step 3. PowerMatchLab's Power Calculator and its dedicated runtime guide can help work this out for your exact devices.",
      },
      {
        question: "What should I power first if capacity is limited?",
        answer:
          "Refrigeration, communication (phone charging, and internet if you need connectivity), lighting, and any medical equipment are the common priority list — see Ready.gov's guidance for a fuller household inventory approach.",
      },
      {
        question: "Is it safe to run a generator in my garage during an outage?",
        answer:
          "No. The U.S. Consumer Product Safety Commission specifically warns against running fuel-burning generators indoors, in an attached garage even with the door open, or near windows and doors, because of carbon monoxide risk.",
      },
      {
        question: "Can I combine a power station with a generator?",
        answer:
          "Yes — some households use the power station for quiet, always-on essentials and only start a generator (outdoors, away from the house) for larger loads or when the battery runs low. Check compatibility before wiring the two together electrically.",
      },
    ],
    sources: [
      { label: "Ready.gov (FEMA) — Power Outages", url: "https://www.ready.gov/power-outages" },
      {
        label: "U.S. Consumer Product Safety Commission — Carbon Monoxide Fact Sheet",
        url: "https://www.cpsc.gov/safety-education/safety-guides/carbon-monoxide/carbon-monoxide-fact-sheet",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "how-long-will-a-1000wh-power-station-last",
    group: "basics",
    title: "How to Calculate Power Station Runtime (1000Wh Worked Example)",
    metaDescription:
      "How to calculate portable power station runtime: the formula, the 85% usable-energy assumption, and a worked table for a 1000Wh-class station across common devices.",
    intro: [
      "Short answer: estimated runtime (hours) = usable energy (Wh) ÷ device watts, where usable energy ≈ nameplate capacity × 0.85 to account for inverter and conversion losses. \"How long will it last\" always depends on what you're running — there is no single answer that applies to every device.",
      "This guide shows the exact calculation and applies it to a 1000Wh-class station across several common device categories so you can see how it scales to your own capacity and devices.",
      "Every figure below is a calculation from the same formula PowerMatchLab uses on its product pages, not a measured test result — treat it as a planning estimate and check your own device's real wattage for an accurate number.",
    ],
    keyTakeaways: [
      "Estimated runtime (hours) = usable energy (Wh) ÷ device watts; usable energy ≈ nameplate capacity × 0.85.",
      "A 1000Wh-class station has about 850 Wh usable — enough for roughly 5.7 hours on a 150 W fridge or 21 hours on a 40 W CPAP.",
      "The formula scales linearly: double the capacity, double the runtime, for the same device.",
      "Cycling loads (fridge compressors, thermostats) use less real daily energy than watts × 24 hours suggests.",
      "Runtime capacity and continuous output are separate checks — a long runtime estimate is irrelevant if the output watts can't start the device.",
    ],
    sections: [
      {
        id: "the-formula-1000wh",
        heading: "The formula: usable energy ÷ device watts",
        body: [
          "Estimated runtime (hours) = usable energy (Wh) ÷ device watts. Usable energy is not the full nameplate capacity — inverter and conversion losses mean roughly 85% is actually usable, the same conservative planning figure used throughout PowerMatchLab.",
          "For a 1000Wh-class station: usable energy ≈ 1,000 × 0.85 = 850 Wh. Divide that by whatever you're running to get estimated hours.",
        ],
      },
      {
        id: "worked-table-1000wh",
        heading: "Worked examples for common device categories",
        body: [
          "Using 850 Wh of usable energy and typical, approximate wattages for common device categories:",
          "These device wattages are broad, commonly cited category approximations, not a measurement of any specific product — your actual appliance may draw meaningfully more or less. Always check its rating label or manual, or measure it with a plug-in energy meter, before relying on a runtime estimate.",
        ],
        bullets: [
          "Full-size refrigerator (~150 W average): 850 ÷ 150 ≈ 5.7 hours",
          "CPAP machine (~40 W): 850 ÷ 40 ≈ 21.3 hours",
          "Laptop (~60 W): 850 ÷ 60 ≈ 14.2 hours",
          "LED TV (~100 W): 850 ÷ 100 ≈ 8.5 hours",
          "Space heater (~1,500 W): 850 ÷ 1,500 ≈ 0.6 hours",
        ],
      },
      {
        id: "why-varies",
        heading: "Why your real number will differ",
        body: [
          "Cycling loads (a fridge compressor, a space heater's thermostat) don't draw their rated watts continuously, so their real daily energy use is usually lower than watts × 24 hours would suggest — PowerMatchLab's refrigerator guide covers this in more depth.",
          "Ambient temperature, battery age, and how many other devices share the same station at once all shift the real-world number away from the calculated one. Treat every figure here as a starting point for planning, not a guarantee.",
        ],
      },
      {
        id: "scaling-other-capacities",
        heading: "Scaling to other capacity classes",
        body: [
          "The same formula scales linearly: usable energy ÷ device watts. A 2,000Wh station usable at roughly 1,700 Wh runs any of the devices above for roughly twice as long; a 300Wh station usable at roughly 255 Wh runs them for roughly a third as long.",
          "PowerMatchLab's Power Calculator does this math automatically for your exact device list and target capacity, across the actual products in the catalog.",
        ],
      },
      {
        id: "continuous-vs-runtime",
        heading: "Runtime capacity isn't the same as continuous output",
        body: [
          "A long estimated runtime only matters if the station's continuous output watts can handle the device in the first place — a 1000Wh-class station with a modest output rating may not be able to start a large motor-driven appliance at all, regardless of how many hours the capacity math suggests.",
          "Check both numbers separately: continuous/surge output (can it start and run the device) and capacity-based runtime (how long it lasts once running). PowerMatchLab's watts-vs-watt-hours guide covers the distinction in detail.",
        ],
      },
    ],
    relatedProductIds: [
      "jackery-explorer-1000-v2",
      "ecoflow-delta-3-classic",
      "anker-solix-c1000-gen-2",
    ],
    relatedGuideSlugs: ["watts-vs-watt-hours", "can-a-power-station-run-a-refrigerator"],
    faq: [
      {
        question: "Is 850 Wh always the usable energy for a 1000Wh station?",
        answer:
          "85% is a conservative planning assumption used across PowerMatchLab, not a universal constant — real usable energy varies by unit, battery age, and load. Treat 850 Wh as a reasonable planning estimate for a 1,000Wh-class unit, not an exact guarantee.",
      },
      {
        question: "Why does my estimated runtime look different from what I've seen elsewhere?",
        answer:
          "Different sources assume different device wattages and different usable-energy percentages. Always check which device watts and efficiency assumption a given estimate is using — and ideally substitute your own device's real, measured wattage.",
      },
      {
        question: "Does a 1000Wh station mean 1000 watts of output?",
        answer:
          "No — capacity (Wh, energy) and continuous output (W, power) are separate specs. A station's watt-hour rating tells you how long it can run something; its watt rating tells you what it can run at all.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of Energy — Estimating Appliance and Home Electronic Energy Use",
        url: "https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "lifepo4-vs-lithium-ion",
    group: "basics",
    title: "LiFePO4 vs Lithium-Ion Power Stations",
    metaDescription:
      "LiFePO4 is a type of lithium-ion battery, not a separate technology. Here's what the terminology actually means and how it affects a power station buying decision.",
    intro: [
      "\"LiFePO4 vs. lithium-ion\" is one of the most common ways people search this topic, but it's a slightly confusing question on its own terms: LiFePO4 (lithium iron phosphate) is itself a type of lithium-ion battery. This guide untangles the terminology first, then covers what actually differs between the chemistries you'll see in power stations.",
      "For a deeper technical comparison of LiFePO4 against the other lithium-ion chemistry most commonly used in older or lighter power stations, see PowerMatchLab's dedicated LiFePO4 vs. NMC guide, linked below.",
    ],
    keyTakeaways: [
      "LiFePO4 (LFP) is a type of lithium-ion battery, not a rival technology to it — the real comparison is LFP vs. other lithium-ion chemistries like NMC.",
      "LFP typically survives several thousand more charge cycles than NMC before dropping to 80% capacity.",
      "LFP is generally more thermally stable than NMC, a meaningful factor for a battery kept indoors or in a vehicle.",
      "NMC still has an edge on raw energy density (lighter for the same capacity), though modern LFP has narrowed the gap.",
      "Check the battery chemistry field on any product page directly rather than assuming from brand or price.",
    ],
    sections: [
      {
        id: "terminology",
        heading: "Clearing up the terminology",
        body: [
          "\"Lithium-ion\" is a broad family name for any rechargeable battery that moves lithium ions between electrodes — it describes the mechanism, not one specific chemical recipe. LiFePO4 (lithium iron phosphate, often shortened to LFP) is one member of that family; NMC (nickel manganese cobalt) and NCA (nickel cobalt aluminum) are others.",
          "So the real-world question people usually mean by \"LiFePO4 vs. lithium-ion\" is actually LiFePO4 vs. the other common lithium-ion chemistries — mainly NMC — which is a genuinely useful comparison, just phrased slightly imprecisely.",
        ],
      },
      {
        id: "why-it-matters-lifepo4",
        heading: "Why the chemistry inside matters to a buyer",
        body: [
          "Every power station in the current PowerMatchLab catalog uses LiFePO4, which reflects an industry-wide shift over the past several years. The chemistry affects three things buyers actually notice: how many charge cycles the battery realistically survives, how it behaves thermally, and how much it weighs for a given capacity.",
        ],
      },
      {
        id: "cycle-life-lifepo4",
        heading: "Cycle life",
        body: [
          "LiFePO4 cells typically tolerate several thousand charge/discharge cycles before dropping to 80% of original capacity — often cited in the 3,000 to 6,000+ range depending on the cell and how it's managed. Older NMC packs are usually rated for meaningfully fewer cycles.",
          "For someone charging a station a few times a week, that difference can mean the practical difference between replacing a battery in a few years versus using the same one for well over a decade.",
        ],
      },
      {
        id: "thermal-lifepo4",
        heading: "Thermal stability",
        body: [
          "LiFePO4 is generally regarded as more thermally stable and less prone to thermal runaway than NMC or NCA chemistries, which is a meaningful consideration for a battery you keep indoors, in a vehicle, or near where you sleep.",
        ],
      },
      {
        id: "weight-lifepo4",
        heading: "Energy density and weight",
        body: [
          "NMC and NCA pack more energy into the same weight and volume than LiFePO4, so a non-LFP station can be lighter for a given capacity. Modern LiFePO4 packs have narrowed this gap considerably compared to earlier generations, but a weight difference generally still exists.",
        ],
      },
      {
        id: "practical-takeaway-lifepo4",
        heading: "Practical takeaway",
        body: [
          "For stationary home backup and most RV or camping use, LiFePO4's longevity and thermal stability usually outweigh a small weight penalty, which is a large part of why it now dominates the market. If absolute minimum weight per watt-hour is your top priority over everything else, a non-LFP chemistry may still have an edge — check the battery chemistry field on any product page before assuming.",
        ],
      },
    ],
    relatedProductIds: [
      "bluetti-ac180",
      "anker-solix-f3800",
    ],
    relatedGuideSlugs: [
      "lifepo4-vs-nmc-battery-chemistry",
      "how-long-does-a-portable-power-station-last",
      "how-to-choose-the-right-portable-power-station",
    ],
    faq: [
      {
        question: "Is LiFePO4 better than lithium-ion?",
        answer:
          "LiFePO4 is a lithium-ion chemistry, not a competing technology — the useful comparison is LiFePO4 against other lithium-ion chemistries like NMC. On cycle life and thermal stability, LiFePO4 generally has an edge; on raw energy density and weight, other lithium-ion chemistries can have an edge.",
      },
      {
        question: "Does cold weather affect LiFePO4 differently than other lithium-ion batteries?",
        answer:
          "Charging any lithium-ion battery, including LiFePO4, below freezing risks cell damage, so many stations block or limit charging in cold conditions regardless of chemistry. Discharging in the cold is less of a concern but capacity typically drops temporarily.",
      },
      {
        question: "How do I know which chemistry my power station uses?",
        answer:
          "Check the product's specification sheet or its listing on PowerMatchLab — the battery chemistry field states LiFePO4, NMC, or another chemistry directly rather than leaving it to assumption.",
      },
    ],
    sources: [
      { label: "U.S. Department of Energy — DOE Explains...Batteries", url: "https://www.energy.gov/science/doe-explainsbatteries" },
      "Battery chemistry overviews from cell manufacturers and DOE energy storage resources",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "watts-vs-watt-hours",
    group: "basics",
    title: "Watts vs Watt-Hours: What Power Station Buyers Need to Know",
    metaDescription:
      "The difference between watts (W) and watt-hours (Wh) explained plainly, with common device wattage ranges and why confusing the two leads to the wrong power station.",
    intro: [
      "Watts and watt-hours are the two numbers on every power station spec sheet, and mixing them up is one of the most common reasons people buy the wrong size. This guide is the plain-English explanation PowerMatchLab's other guides link back to.",
      "Short version: watts is a rate, watt-hours is a total. Everything else follows from that distinction.",
    ],
    keyTakeaways: [
      "Watts (W) is a rate of power right now; watt-hours (Wh) is a total amount of energy over time — they answer different questions.",
      "A device's watts tells you whether a station can start and run it at all (check continuous and surge output).",
      "A device's watt-hours (watts × hours of use) tells you how long the station's capacity will sustain it.",
      "Watt-hours = watts × hours; hours of runtime ≈ usable battery Wh ÷ device watts (PowerMatchLab plans around 85% usable).",
      "Buying on only one of the two numbers is the classic mistake — check both before choosing a station.",
    ],
    sections: [
      {
        id: "watts-defined",
        heading: "Watts (W): a rate of power, not an amount",
        body: [
          "A watt measures how much power something draws or delivers at a given instant — it's a rate, the same way miles per hour is a rate of speed. A 100 W device pulls 100 watts whether it runs for one minute or ten hours; the watt figure itself doesn't change with time.",
          "On a power station, the watts figure appears as a continuous output rating (how much it can deliver steadily) and a surge or peak rating (how much it can deliver briefly, for motor startups).",
        ],
      },
      {
        id: "watt-hours-defined",
        heading: "Watt-hours (Wh): an amount of energy over time",
        body: [
          "A watt-hour is energy — watts multiplied by the hours they're sustained. A 100 W device running for 3 hours uses 300 Wh, regardless of how that power was delivered moment to moment.",
          "A power station's battery capacity is rated in watt-hours (or often kilowatt-hours, kWh — 1,000 Wh). That number tells you how much total energy is stored, which determines how long it can run something once that something is actually running.",
        ],
      },
      {
        id: "why-confusing-them-matters",
        heading: "Why mixing them up leads to the wrong purchase",
        body: [
          "A device's watts tells you whether a station can start and run it at all — check that against the station's continuous and surge output. A device's watt-hours (watts × hours of use) tells you how long the station's capacity will sustain it — check that against the battery's usable Wh.",
          "Buying based on only one of the two numbers is the classic mistake: a station with plenty of watt-hours but too low a watt rating can fail to start a device entirely, while a station with a high watt rating but modest watt-hours can start anything but run out quickly.",
        ],
      },
      {
        id: "converting-watts-to-watt-hours",
        heading: "Converting between the two",
        body: [
          "Watt-hours = watts × hours of use. If you only know amps and volts (common on rating labels), watts ≈ amps × volts, and you can convert from there.",
          "Working the other direction: hours of runtime ≈ usable battery Wh ÷ device watts. PowerMatchLab uses roughly 85% of nameplate capacity as usable energy in its own runtime and sizing calculations, to account for inverter and conversion losses.",
        ],
      },
      {
        id: "typical-device-wattages",
        heading: "Typical wattage ranges for common devices",
        body: [
          "These are broad, commonly cited category ranges, not a measurement of any specific product — always check your own device's rating label or manual for its real figure.",
        ],
        bullets: [
          "Phone or small USB device charging: roughly 5-20 W",
          "Laptop: roughly 30-100 W",
          "LED TV: roughly 30-150 W depending on size",
          "Box fan or CPAP machine without a heated humidifier: roughly 30-60 W",
          "Full-size refrigerator (average, cycling): roughly 100-200 W average, with a startup surge several times higher",
          "Microwave or coffee maker: roughly 600-1,200 W",
          "Space heater or hair dryer: roughly 750-1,800 W",
        ],
      },
      {
        id: "continuous-vs-surge-watts",
        heading: "Continuous watts vs. surge watts",
        body: [
          "Continuous watts is what a device draws while running steadily. Surge (or peak/startup) watts is a brief spike, common in anything with an electric motor — a compressor, a pump, a power tool — often two to three times the running watts for a fraction of a second.",
          "A power station's surge rating needs to clear a device's startup spike, not just its running watts, or the device may fail to start even though the continuous rating looked sufficient.",
        ],
      },
    ],
    relatedProductIds: [
      "anker-solix-c300",
      "ecoflow-delta-2-max",
    ],
    relatedGuideSlugs: [
      "how-to-size-a-portable-power-station",
      "how-long-will-a-1000wh-power-station-last",
      "what-can-a-1000-watt-power-station-run",
    ],
    faq: [
      {
        question: "If a power station is rated 1000Wh, does that mean it outputs 1000 watts?",
        answer:
          "No — those are two different specs. Wh (or kWh) is total stored energy; W is the rate of power it can deliver. A station's continuous output watts is a completely separate number, usually listed right next to the capacity on its spec sheet.",
      },
      {
        question: "How many watt-hours does charging a phone use?",
        answer:
          "A full phone charge is typically a small fraction of most power stations' capacity — commonly in the 10-20 Wh range, though it varies by phone and charger. Check your charger's rated watts and your phone's typical charge time for a more precise figure.",
      },
      {
        question: "Why do two power stations with the same watt-hour rating feel different in practice?",
        answer:
          "Usable energy (after inverter/conversion losses), continuous and surge output ratings, and how efficiently the inverter handles your specific load can all differ between units with the same nameplate Wh — capacity alone doesn't tell the whole story.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of Energy — Estimating Appliance and Home Electronic Energy Use",
        url: "https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "how-long-to-charge-power-station-with-solar",
    group: "charging-ownership",
    title: "How Long Does It Take to Charge a Power Station with Solar Panels?",
    metaDescription:
      "How to calculate solar charging time for a power station: the formula, why real panel output runs well below its rated watts, and a worked example table.",
    intro: [
      "Solar charging time comes down to one calculation — energy needed divided by realistic panel output — but the \"realistic\" part is where most estimates go wrong. This guide walks through the formula and applies it to a few worked examples.",
      "For the deeper explanation of what a station's solar input spec actually means and how AC and solar charging compare, see PowerMatchLab's solar input and charging guide, linked below.",
    ],
    sections: [
      {
        id: "solar-charge-formula",
        heading: "The formula",
        body: [
          "Charging time (hours) ≈ energy needed (Wh) ÷ realistic solar input (W). \"Energy needed\" is however much of the battery's capacity you're actually replacing — a full charge from empty uses close to the full rated Wh, a partial top-up uses less.",
          "\"Realistic solar input\" is the operative word — it is not simply the panel's rated wattage. Real-world output is reduced by sun angle, panel temperature, haze or cloud cover, cable losses, and time of day, and is commonly in the 60-80% range of the rated number on a good day.",
        ],
      },
      {
        id: "worked-examples-solar",
        heading: "Worked examples",
        body: [
          "A 200 W-rated solar panel realistically delivering 65% of its rating produces about 130 W in good midday sun. Charging a 1,000Wh station from empty: 1,000 ÷ 130 ≈ 7.7 hours of good sun — which in practice usually spans more than one calendar day, since few locations get 7-8 hours of consistently strong sun.",
          "The same 200 W panel charging a 2,000Wh station from empty: 2,000 ÷ 130 ≈ 15.4 hours of good sun, realistically two to three days depending on conditions and how much of each day is strong, direct sun.",
          "A larger 400 W-rated setup at the same 65% realistic derate produces about 260 W: 1,000 ÷ 260 ≈ 3.8 hours of good sun for the same 1,000Wh station — roughly half the time, since panel wattage and charging time scale inversely.",
        ],
      },
      {
        id: "why-full-sun-hours-matter",
        heading: "\"Hours of sun\" isn't the same as \"hours of daylight\"",
        body: [
          "A day has roughly 12-14 hours of daylight in much of the U.S. depending on season and latitude, but only a portion of that is strong, direct sun capable of near-peak panel output — early morning, late afternoon, haze, and cloud cover all reduce output well below peak.",
          "Solar-charging estimates are usually expressed in \"full-sun hours\" or \"peak-sun hours\" for this reason — a rough count of how many hours of peak-equivalent sun a location gets, which is often meaningfully less than its total daylight hours.",
        ],
      },
      {
        id: "factors-that-change-solar-charging",
        heading: "What changes your real number",
        body: [
          "Panel angle and orientation relative to the sun, ambient and panel temperature (panels lose some efficiency when hot), shading (even partial shading on part of a panel string can cut output disproportionately), and the station's charge controller and maximum solar input spec all affect the real number.",
          "Check the station's maximum solar input watts specifically — pairing it with a panel array rated well above that ceiling doesn't help, since the station simply won't accept more than its rated input regardless of what the panels could theoretically produce.",
        ],
      },
      {
        id: "ac-vs-solar-speed",
        heading: "Solar vs. AC (wall) charging speed",
        body: [
          "AC charging from a wall outlet is almost always faster and far more predictable than solar, since it isn't subject to weather or time of day. Many people use solar for extending runtime during multi-day off-grid use and AC for the fastest full recharge when a wall outlet is available.",
          "Some stations support charging from AC and solar simultaneously for a faster combined recharge — check the specific unit's combined-input limit rather than assuming the two simply add together without a cap.",
        ],
      },
    ],
    relatedProductIds: [
      "jackery-explorer-2000-v2",
    ],
    relatedGuideSlugs: [
      "solar-input-and-charging-times-explained",
      "how-many-solar-panels-do-i-need",
      "solar-generator-vs-portable-power-station",
    ],
    faq: [
      {
        question: "How many watts of solar panel do I need to fully recharge my station in a day?",
        answer:
          "As a rough starting point, divide your station's capacity by the number of realistic full-sun hours your location gets, then divide again by your expected real-world derate (commonly 60-80%) to size the panel's rated watts. A local solar-hours estimate for your area will be more accurate than a national average.",
      },
      {
        question: "Why is my panel producing far less than its rated watts?",
        answer:
          "Rated watts are measured under standardized lab conditions rarely matched outdoors. Angle, temperature, haze, partial shading, cabling, and time of day all reduce real output — 60-80% of rated on a good day is a typical, not a pessimistic, expectation.",
      },
      {
        question: "Can I charge from solar and AC at the same time?",
        answer:
          "Many stations support simultaneous AC + solar input for a faster combined charge, but not all, and combined input is often capped below the simple sum of both maximums. Check the specific unit's spec sheet.",
      },
      {
        question: "Does cloudy weather stop solar charging completely?",
        answer:
          "No, but it reduces output substantially — panels still produce some power under cloud cover, just well below their clear-sky output. Plan for meaningfully longer charging time on overcast days rather than assuming zero output.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of Energy / NREL — Understanding Solar Photovoltaic System Performance",
        url: "https://www.energy.gov/sites/default/files/2022-01/understanding-solar-photovoltaic-system-performance.pdf",
      },
      "Manufacturer charging specifications referenced in products.json",
    ],
    lastUpdated: "2026-09-03",
  },
  {
    slug: "what-is-a-portable-power-station",
    group: "basics",
    title: "What Is a Portable Power Station and How Does It Work?",
    metaDescription:
      "A plain-English explanation of what a portable power station is, its main parts (battery, inverter, BMS, ports), and how it differs from a fuel generator.",
    intro: [
      "Short answer: a portable power station is a battery pack, an inverter, and a battery management system built into one portable case — it stores electricity, then converts and delivers it through AC outlets, USB ports, and DC output, without needing fuel or an internet connection.",
      "This guide covers the basic parts, how they work together, and what a power station is not, before pointing you to PowerMatchLab's sizing and buying guides for the next step.",
    ],
    keyTakeaways: [
      "A power station is three things in one case: a rechargeable battery, an inverter (DC to AC conversion), and a battery management system (BMS) that protects the cells.",
      "It stores energy — it does not generate electricity from fuel, so it has no exhaust and needs recharging (AC, solar, or a vehicle) once its capacity is used.",
      "Two specs define what it can do: watts (continuous/surge output — what it can power) and watt-hours (capacity — how long it can power it).",
      "Nearly all current models, including every product in the PowerMatchLab catalog, use LiFePO4 batteries for long cycle life and thermal stability.",
      "Once you understand the parts, the next step is sizing one for your actual devices — see the dedicated sizing guide, linked below.",
    ],
    sections: [
      {
        id: "what-it-is",
        heading: "What a portable power station actually is",
        body: [
          "At its core, a portable power station is a large rechargeable battery pack built into a case with a built-in inverter and a set of output ports — AC (wall-outlet-style) sockets, USB-A and USB-C ports, and often a 12V DC output. You charge it in advance from a wall outlet, a solar panel, or sometimes a car's outlet, then it powers your devices later, wherever you are.",
          "Unlike a battery bank or power bank, which typically outputs only low-voltage DC through USB, a power station outputs real AC power through standard outlets, which is what lets it run laptops, small appliances, and other mains-powered devices.",
        ],
      },
      {
        id: "main-parts",
        heading: "The main parts, and what each one does",
        body: [
          "The battery cells store the actual energy, rated in watt-hours (Wh) — the total amount of energy the unit can hold. Almost every current model, including everything in the PowerMatchLab catalog, uses LiFePO4 (lithium iron phosphate) cells; PowerMatchLab's dedicated chemistry guides cover why.",
          "The inverter converts the battery's stored DC (direct current) power into AC (alternating current) power for the wall-outlet-style sockets, since most household and travel devices expect AC. The inverter's maximum output is the station's continuous watts rating, with a separate, usually higher, surge/peak rating for the brief spike that motor-driven devices draw on startup.",
          "The battery management system (BMS) is a safety and health layer — it monitors cell voltage, temperature, and current, protects against overcharge, over-discharge, and short circuits, and is a major reason modern LiFePO4-based stations have a strong safety record when used as intended.",
        ],
      },
      {
        id: "what-it-is-not",
        heading: "What a power station is not",
        body: [
          "A power station is not a fuel generator. It stores electricity rather than generating it from gasoline, propane, or diesel, so it produces no exhaust and can safely sit indoors — but its capacity is finite; once the battery is empty, you must recharge it rather than simply add more fuel.",
          "It is also not the same as a small USB power bank, even though both are portable batteries — a power station's AC output, larger capacity, and higher power ratings put it in a different category, sized for appliances and electronics rather than just phones.",
        ],
      },
      {
        id: "two-specs-that-matter",
        heading: "The two specs that define what it can do",
        body: [
          "Watts (continuous and surge/peak output) determine what the station can power — can it start and run your specific devices at once. Watt-hours (capacity) determine how long it can power them before needing a recharge. PowerMatchLab's watts-vs-watt-hours guide covers this distinction in detail, since confusing the two is the single most common sizing mistake.",
          "Charging specs (AC watts, solar input watts) determine how quickly it refills — covered in PowerMatchLab's dedicated charging guide.",
        ],
      },
      {
        id: "typical-uses",
        heading: "What people typically use one for",
        body: [
          "Common uses include camping and van life, RV power, remote work away from a fixed outlet, home backup during outages, and running a CPAP machine or a refrigerator during a power cut. PowerMatchLab has a dedicated guide for each of these use cases.",
        ],
      },
    ],
    relatedProductIds: ["jackery-explorer-1000-v2"],
    relatedGuideSlugs: [
      "how-to-size-a-portable-power-station",
      "watts-vs-watt-hours",
      "how-to-choose-the-right-portable-power-station",
    ],
    faq: [
      {
        question: "Is a portable power station the same as a generator?",
        answer:
          "No. A generator burns fuel to produce electricity on demand and can run as long as fuel lasts, but produces exhaust and must never run indoors. A power station stores pre-charged electricity, has no exhaust, and can sit indoors, but has a finite capacity that requires recharging once used.",
      },
      {
        question: "How long does a power station keep its charge when not in use?",
        answer:
          "This varies by model and is a manufacturer-published spec (often described as self-discharge rate or standby time) — check the specific product's documentation rather than assuming a figure, since PowerMatchLab does not publish an unverified estimate.",
      },
      {
        question: "Can I use a power station indoors?",
        answer:
          "Yes — unlike a fuel generator, a battery-based power station produces no exhaust, which is a large part of why many people choose one specifically for indoor-adjacent use during an outage.",
      },
    ],
    sources: [
      { label: "U.S. Department of Energy — DOE Explains...Batteries", url: "https://www.energy.gov/science/doe-explainsbatteries" },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-04",
  },
  {
    slug: "what-can-a-1000-watt-power-station-run",
    group: "runtime",
    title: "What Can a 1,000-Watt Power Station Run?",
    metaDescription:
      "What a power station rated for 1,000 continuous watts can run: which common devices fit individually and in combination, and which typically exceed it.",
    intro: [
      "Short answer: a 1,000 W continuous-output power station comfortably runs most small electronics and light appliances — laptops, TVs, routers, lighting, phone charging, a CPAP machine, a coffee maker, or a small refrigerator — either one at a time or several combined, as long as their total running watts stays at or below 1,000 W. Higher-draw appliances like a full-power microwave or a space heater typically exceed it.",
      "This guide lists common devices against their typical running watts so you can check your own combination, using the same watts-vs-watt-hours method as the rest of PowerMatchLab.",
    ],
    keyTakeaways: [
      "1,000 W is a continuous output ceiling — add up the running watts of everything you'd use at once and keep the total at or below it.",
      "Startup surge is a separate check: a compressor-driven device (fridge, some coolers) briefly draws more than its running watts, and needs the station's surge rating, not its continuous rating, to clear it.",
      "Common devices that individually fit comfortably under 1,000 W: laptop (~60 W), TV (~100 W), Wi-Fi router (~18 W), LED lighting (~40 W), phone charging (~12 W), CPAP (~40 W), a coffee maker (~900 W alone).",
      "Common devices that typically exceed a 1,000 W continuous rating alone: a full-power microwave (~1,200 W) and most space heaters (~1,500 W).",
      "Watts (can it run at all) and watt-hours (how long it runs) are separate questions — see PowerMatchLab's watts-vs-watt-hours guide for the full distinction.",
    ],
    sections: [
      {
        id: "what-1000w-continuous-means",
        heading: "What \"1,000 W continuous\" actually limits",
        body: [
          "A station's continuous output rating is the maximum it can sustain steadily. Everything running at the same time needs to add up to at or below that number — it is not a per-device limit, it's a combined-load limit.",
          "A separate surge (or peak) rating governs the brief spike that motor-driven appliances draw on startup, commonly two to three times their running watts. Check both specs, not just the continuous number, before assuming a device will start.",
        ],
      },
      {
        id: "devices-that-fit",
        heading: "Devices that typically fit comfortably, alone or combined",
        body: [
          "Using commonly cited category wattages (check your own device's rating label for its real figure):",
        ],
        bullets: [
          "Laptop: ~60 W",
          "LED TV: ~100 W",
          "Wi-Fi router: ~18 W",
          "LED lighting: ~40 W",
          "Phone charging: ~12 W",
          "CPAP machine (blower, modest humidifier setting): ~40 W",
          "Coffee maker: ~900 W (alone — leaves little headroom for anything else)",
          "Combined example: laptop + TV + router + LED lighting + phone charging ≈ 60 + 100 + 18 + 40 + 12 = 230 W total, well under 1,000 W with headroom to spare",
        ],
      },
      {
        id: "devices-that-exceed",
        heading: "Devices that typically exceed 1,000 W alone",
        body: [
          "A full-power microwave commonly draws around 1,200 W running — above a 1,000 W continuous rating on its own, regardless of what else is or isn't also running. Most space heaters run around 1,500 W on their higher setting, also above the ceiling.",
          "These aren't necessarily off-limits with a larger-output station — PowerMatchLab's dedicated microwave guide covers the specific check in more depth — but a 1,000 W-class unit is generally not the right fit for either.",
        ],
      },
      {
        id: "fridge-1000w-case",
        heading: "The refrigerator case: a good fit on paper, but check the surge",
        body: [
          "A household refrigerator's running watts (commonly around 150 W average) fits easily within a 1,000 W continuous budget. The catch is the compressor's startup surge, often 2-3× running watts — check the station's surge/peak rating specifically, since a 1,000 W continuous rating says nothing about surge headroom on its own. PowerMatchLab's dedicated refrigerator guide covers this calculation in full.",
        ],
      },
    ],
    relatedProductIds: ["vtoman-flashspeed-1000", "ecoflow-river-2-pro"],
    relatedGuideSlugs: [
      "watts-vs-watt-hours",
      "how-to-size-a-portable-power-station",
      "can-a-power-station-run-a-microwave",
    ],
    faq: [
      {
        question: "Can a 1,000W power station run a refrigerator?",
        answer:
          "Its running watts (commonly ~150 W) fit easily, but check the station's surge/peak rating against the fridge's startup spike separately — that is usually the limiting factor, not the continuous rating. See PowerMatchLab's refrigerator guide for the full method.",
      },
      {
        question: "Can I run a microwave on a 1,000W power station?",
        answer:
          "Often not alone — a full-power microwave commonly draws around 1,200 W running, above a 1,000 W continuous ceiling. Check your specific microwave's rating label; some smaller or lower-power models may fit.",
      },
      {
        question: "Does 1,000W mean I can run any single device rated under 1,000W?",
        answer:
          "Generally yes for running watts, but also check the device's startup surge if it has a motor or compressor — a device with modest running watts can still have a surge that exceeds the station's separate surge rating.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of Energy — Estimating Appliance and Home Electronic Energy Use",
        url: "https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-04",
  },
  {
    slug: "can-a-power-station-run-a-microwave",
    group: "runtime",
    title: "Can a Portable Power Station Run a Microwave?",
    metaDescription:
      "Whether a power station can run a microwave: the output check to do first, a worked per-use energy example, and how many uses to expect from different capacities.",
    intro: [
      "Short answer: yes, if the station's continuous output rating clears the microwave's running watts (commonly around 1,200 W for a typical countertop model) with its surge rating covering the brief startup spike — capacity then determines how many uses you get per charge, not whether it works at all.",
      "This guide covers the output check first, since it's the more common blocker, then the energy math for how many microwave uses a given capacity supports.",
    ],
    keyTakeaways: [
      "Check output first: the microwave's running watts (commonly ~1,200 W) must be at or below the station's continuous output rating, or it won't start regardless of capacity.",
      "A microwave's own rating label lists running/input watts, not its \"cooking power\" (e.g. \"1000W\" microwaves often draw more like 1,200-1,700 W running) — check the label, not the marketing number.",
      "Energy per use ≈ running watts × minutes used ÷ 60. A 1,200 W microwave run for 5 minutes uses about 100 Wh.",
      "Estimated uses per charge ≈ usable capacity (≈85% of rated Wh) ÷ energy per use — see the worked table below.",
      "This is a calculation, not a guaranteed test result — your microwave's real wattage and typical run time will differ from the example figures.",
    ],
    sections: [
      {
        id: "check-output-first",
        heading: "Step 1: Check the station's output against the microwave's running watts",
        body: [
          "A microwave's rating label (usually inside the door frame or on the back) lists its running or input watts — this is typically higher than its advertised \"cooking power,\" since the magnetron isn't 100% efficient. A microwave marketed as \"1000W cooking power\" commonly draws somewhere around 1,200-1,700 W running, depending on the model.",
          "The station's continuous output rating needs to clear that running-watts figure, and its surge/peak rating needs to clear the brief startup spike, before capacity is even a relevant question. If the continuous output is too low, the microwave simply won't start, no matter how much energy is stored.",
        ],
      },
      {
        id: "energy-per-use",
        heading: "Step 2: Energy per use, and how many uses per charge",
        body: [
          "Once output is confirmed to be sufficient, the relevant capacity question is how many uses you get per charge, not a continuous-runtime figure — nobody runs a microwave for hours at a stretch.",
          "Energy per use (Wh) ≈ running watts × minutes used ÷ 60. Worked example: a 1,200 W microwave run for 5 minutes uses 1,200 × 5 ÷ 60 = 100 Wh for that one use.",
          "Estimated uses per charge ≈ usable capacity (≈85% of rated Wh) ÷ energy per use. Applied across a few capacity classes now in the PowerMatchLab catalog, at the same 1,200 W / 5-minute assumption:",
        ],
        bullets: [
          "~1,000Wh-class: 1,000 × 0.85 ÷ 100 ≈ 8.5 uses per charge",
          "~2,000Wh-class: 2,000 × 0.85 ÷ 100 ≈ 17 uses per charge",
          "~3,000Wh-class: 3,000 × 0.85 ÷ 100 ≈ 25.5 uses per charge",
        ],
      },
      {
        id: "which-stations-qualify",
        heading: "Which stations can even start a microwave",
        body: [
          "Many compact and some mid-size stations have a continuous output rating below common microwave running watts, which rules them out regardless of capacity. Check the specific product's continuous output rating on its PowerMatchLab product page or in the Compare tool against your microwave's own label before assuming it will work.",
        ],
      },
    ],
    relatedProductIds: ["ecoflow-delta-2-max", "segway-cube-1000", "anker-solix-c2000-gen-2"],
    relatedGuideSlugs: [
      "what-can-a-1000-watt-power-station-run",
      "how-to-size-a-portable-power-station",
      "watts-vs-watt-hours",
    ],
    faq: [
      {
        question: "Why does my microwave draw more watts than its \"cooking power\" label?",
        answer:
          "The wattage marketed on a microwave (e.g. \"1000W\") describes its cooking output, not its electrical draw. The magnetron isn't perfectly efficient, so actual running watts pulled from the outlet are typically higher — check the rating label (usually inside the door frame or on the back) for the real input watts.",
      },
      {
        question: "Will a microwave's startup surge trip a power station?",
        answer:
          "Microwaves have a modest surge compared to compressor-driven appliances, but every model differs — check the station's surge/peak rating against the microwave's documented startup characteristics if the manufacturer publishes one, rather than assuming it's a non-issue.",
      },
      {
        question: "How many times can I microwave something on one charge?",
        answer:
          "Divide usable capacity (roughly 85% of rated Wh) by the energy used per session (running watts × minutes ÷ 60). See the worked table above for a few capacity classes at a common 1,200 W / 5-minute assumption, then substitute your own microwave's real numbers.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of Energy — Estimating Appliance and Home Electronic Energy Use",
        url: "https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-04",
  },
  {
    slug: "power-stations-for-remote-work-and-van-life",
    group: "use-cases",
    title: "Power Stations for Remote Work and Van Life",
    metaDescription:
      "Sizing a power station for remote work or van life: daily energy for a laptop-and-connectivity workday, van-specific loads, solar for continuous off-grid living, and weight.",
    intro: [
      "Working remotely from a van, a cabin, or anywhere off a fixed outlet has a different load profile from a weekend camping trip: it's daily, predictable, and centered on a laptop and connectivity rather than occasional appliance use — but living in a vehicle full-time also adds loads a weekend trip doesn't have, like a 12V or AC fridge running continuously.",
      "This guide applies PowerMatchLab's standard watts-vs-watt-hours method to both the remote-work day and the van-life baseline, with a worked example for each.",
    ],
    keyTakeaways: [
      "A typical remote-work day (laptop, monitor, router, phone) is a modest, predictable daily energy load — usually well under what a single fridge uses in a day.",
      "Full-time van life adds a continuous baseline load (a 12V or AC fridge running around the clock) on top of the workday electronics — size for both together, not just the laptop.",
      "Daily recharge (driving, solar, or a hookup) changes the sizing math substantially versus needing to store several days of energy up front.",
      "An expandable platform suits van life better than most other use cases, since it's a long-term, evolving setup rather than a single trip.",
      "Weight and mounting matter for a vehicle build in a way they don't for home backup — check the product's listed weight before committing to a spot in the build.",
    ],
    sections: [
      {
        id: "remote-work-load",
        heading: "Step 1: Size the remote-work day itself",
        body: [
          "A typical remote-work setup is laptop, an external monitor if you use one, a Wi-Fi router or hotspot, and phone charging — check each device's real watts from its rating label or charger brick rather than guessing.",
          "Worked example: laptop (60 W) for 6 hours, a small monitor (30 W) for 6 hours, a Wi-Fi router (18 W) for 10 hours, and phone charging (12 W) for 2 hours totals (60×6) + (30×6) + (18×10) + (12×2) = 360 + 180 + 180 + 24 = 744 Wh for the workday.",
        ],
      },
      {
        id: "van-life-baseline",
        heading: "Step 2: Add the van-life baseline load",
        body: [
          "Full-time van or off-grid living typically adds a continuous baseline on top of the workday: a 12V compressor fridge running around the clock, interior lighting, and sometimes a fan or small water pump. A 12V fridge commonly draws somewhere in the tens of watts running but cycles like any compressor appliance, so its real daily energy is a fraction of watts × 24 hours — the same cycling logic covered in PowerMatchLab's refrigerator guide.",
          "Add the baseline's daily Wh to the workday total from Step 1 for your combined daily energy figure.",
        ],
      },
      {
        id: "remote-capacity-formula",
        heading: "Step 3: Convert combined daily energy into a recommended capacity",
        body: [
          "Using PowerMatchLab's standard assumptions — about 85% usable energy after conversion losses, plus roughly 20% reserve headroom: recommended minimum capacity (Wh) ≈ (daily energy Wh × days without recharge) ÷ 0.85 × 1.2.",
          "If you can recharge daily (driving, a campground hookup, or reliable solar), you generally only need to cover one day's gap at a time rather than storing several days of total energy up front.",
        ],
      },
      {
        id: "continuous-recharge-vanlife",
        heading: "Solar and driving as a continuous recharge source",
        body: [
          "Unlike a single camping trip, van life and long-term remote work usually depend on a continuous recharge source rather than one big battery — daily solar input, alternator charging while driving, or both. PowerMatchLab's solar sizing guide covers estimating how many panel watts realistically cover a given daily energy need.",
          "An expandable platform, where supported, lets the setup grow with your needs over time instead of committing to one fixed capacity up front — a meaningful advantage for a long-term build over a one-off trip purchase.",
        ],
      },
      {
        id: "weight-mounting-vanlife",
        heading: "Weight and mounting in a vehicle build",
        body: [
          "A station that's semi-permanently mounted in a van build cares less about grab-and-go portability and more about a secure mounting location, ventilation, and total build weight — check the product's listed weight and dimensions before planning where it goes.",
        ],
      },
    ],
    relatedProductIds: ["anker-solix-c1000-gen-2", "jackery-explorer-2000-plus", "bluetti-ac200l"],
    relatedGuideSlugs: [
      "power-station-for-camping",
      "power-station-for-rv",
      "solar-generator-vs-portable-power-station",
    ],
    faq: [
      {
        question: "How much power does a remote work day really use?",
        answer:
          "For laptop, monitor, router, and phone charging, commonly a few hundred to around 750 Wh for a full workday — see the worked example above and substitute your own devices' real watts and hours of use.",
      },
      {
        question: "Do I need solar for van life, or is a big battery enough?",
        answer:
          "For short trips, a large battery alone can work. For full-time living, a continuous recharge source — solar, driving, or both — is generally more practical than trying to store enough capacity to go indefinitely without recharging.",
      },
      {
        question: "Can a power station run a van's 12V fridge and my laptop at the same time?",
        answer:
          "Check the combined continuous watts of both against the station's continuous output rating, and size capacity for their combined daily energy use — the same watts-vs-watt-hours method used throughout PowerMatchLab.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of Energy — Estimating Appliance and Home Electronic Energy Use",
        url: "https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use",
      },
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-04",
  },
  {
    slug: "solar-generator-vs-portable-power-station",
    group: "charging-ownership",
    title: "Solar Generator vs. Portable Power Station: What's the Difference?",
    metaDescription:
      "\"Solar generator\" and \"portable power station\" usually describe the same underlying product. What actually differs is whether solar panels are bundled or sold separately.",
    intro: [
      "Short answer: in most current marketing, a \"solar generator\" and a \"portable power station\" are the same underlying product — a battery, inverter, and BMS in one case. \"Solar generator\" is typically a marketing term for that same device, sometimes bundled with solar panels, rather than a genuinely different technology.",
      "This guide untangles the terminology so you can evaluate either listing on its actual specs rather than the label used.",
    ],
    keyTakeaways: [
      "\"Solar generator\" does not mean a different core technology — it is generally the same battery-plus-inverter device marketed with a focus on solar charging.",
      "Some \"solar generator\" listings bundle solar panels in the box; others use the term for the same standalone unit sold elsewhere as a \"power station.\"",
      "Every station, regardless of what it's called, can typically also charge via a normal AC wall outlet — solar is one charging input, not the only one.",
      "Evaluate the actual specs (capacity, output, solar input watts, chemistry) rather than the marketing label, since the label alone doesn't tell you performance.",
      "If a listing bundles a panel, check whether the panel's specs and price suit your needs, or whether buying the base unit and a separately chosen panel makes more sense.",
    ],
    sections: [
      {
        id: "same-core-tech",
        heading: "Why the two terms usually describe the same thing",
        body: [
          "A \"solar generator\" almost always contains the same core components as a \"portable power station\": a rechargeable battery (nearly universally LiFePO4 in current products), an inverter to produce AC output, and a battery management system. It doesn't generate electricity from sunlight directly the way a solar panel does — it stores electricity, some of which may come from an attached solar panel, the rest from an AC wall outlet or other source.",
          "The \"generator\" part of the name is arguably a misnomer carried over from fuel generators, which is the product category solar-charged battery stations were often marketed to replace.",
        ],
      },
      {
        id: "what-actually-differs",
        heading: "What can actually differ between listings",
        body: [
          "The main real difference is bundling: some \"solar generator\" listings include one or more solar panels in the box or as a package deal, while a \"power station\" listing more often sells just the base unit, with panels available separately.",
          "Marketing emphasis can also differ — a \"solar generator\" listing may highlight solar input specs more prominently, but the underlying unit frequently has the identical AC charging, output, and capacity specs as an otherwise-identical \"power station\" listing from the same or a different brand.",
        ],
      },
      {
        id: "evaluate-on-specs",
        heading: "Evaluate on specs, not the label",
        body: [
          "Whichever term a listing uses, check the same core specs covered throughout PowerMatchLab: capacity (Wh), continuous and surge output (W), battery chemistry, and — specifically relevant here — solar input watts and AC charging watts.",
          "If solar charging matters to you, the solar input watts spec and PowerMatchLab's solar sizing guide are what actually determine whether a given panel setup will charge it adequately — not whether the product is labeled \"solar generator\" or \"power station.\"",
        ],
      },
      {
        id: "bundle-vs-separate",
        heading: "Bundled panel vs. buying separately",
        body: [
          "A bundled panel can be convenient and sometimes better value, but check that its rated watts and physical size actually suit your use case — a small bundled panel may charge far more slowly than the station's maximum solar input spec allows.",
          "Buying the base unit and a separately chosen panel (or none, if you plan to rely on AC charging) gives more control over sizing but requires doing that sizing yourself — PowerMatchLab's solar panel sizing guide covers the calculation.",
        ],
      },
    ],
    relatedProductIds: [],
    relatedGuideSlugs: [
      "solar-input-and-charging-times-explained",
      "how-many-solar-panels-do-i-need",
      "how-to-choose-the-right-portable-power-station",
    ],
    faq: [
      {
        question: "Is a solar generator worse than a portable power station?",
        answer:
          "Not inherently — in most cases they're the same underlying device. Compare the actual specs (capacity, output, solar input, chemistry) rather than assuming one label implies better or worse hardware.",
      },
      {
        question: "Do I have to use solar panels with a \"solar generator\"?",
        answer:
          "No. Nearly all of these units also accept normal AC wall charging, and many accept car/DC charging too. Solar is one input option among several, not a requirement.",
      },
      {
        question: "If a listing includes a panel, is it always a better deal?",
        answer:
          "Not automatically — check the bundled panel's rated watts and whether it suits your setup. A small or low-quality bundled panel may be worth less than buying the base unit and choosing your own panel separately.",
      },
    ],
    sources: [
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-04",
  },
  {
    slug: "how-many-solar-panels-do-i-need",
    group: "charging-ownership",
    title: "How Many Solar Panels Do I Need for a Power Station?",
    metaDescription:
      "How to size a solar panel setup for a power station: the formula, the realistic 60-80% derate, a worked example, and the station's own solar input ceiling to check.",
    intro: [
      "Short answer: required panel rated watts ≈ your daily energy need (Wh) ÷ (realistic derate × realistic full-sun hours for your location) — and the result must not exceed the station's own maximum solar input watts, which is a hard ceiling regardless of how much panel you connect.",
      "This guide walks through that formula with a worked example, using the same realistic-solar-output approach as PowerMatchLab's other charging guides.",
    ],
    keyTakeaways: [
      "Required panel watts ≈ daily energy need (Wh) ÷ (realistic derate × full-sun hours) — solve for panel size, not just charging time.",
      "Real-world solar delivers roughly 60-80% of a panel's rated watts because of angle, temperature, haze, and wiring losses — use that range, not the rated number, in your math.",
      "\"Full-sun hours\" (a location's peak-equivalent sun) is usually meaningfully less than total daylight hours — check a solar-resource estimate for your area rather than assuming a full day counts.",
      "The station's own maximum solar input watts is a hard ceiling — a larger panel array than that spec doesn't help, since the station simply won't accept more.",
      "Only the original 10 PowerMatchLab catalog products currently have a verified solar input spec; for the rest it is shown as \"Not verified\" rather than assumed.",
    ],
    sections: [
      {
        id: "solar-panel-formula",
        heading: "The formula",
        body: [
          "Required panel rated watts ≈ daily energy need (Wh) ÷ (realistic derate × full-sun hours). Rearranged from the same charging-time formula used in PowerMatchLab's solar charging-time guide, solving for panel size instead of time.",
          "\"Realistic derate\" accounts for the gap between a panel's lab-rated watts and what it delivers outdoors — commonly 60-80% on a good day, per general photovoltaic performance guidance. \"Full-sun hours\" is your location's estimated hours of peak-equivalent sun per day, which is less than total daylight hours.",
        ],
      },
      {
        id: "solar-panel-worked-example",
        heading: "Worked example",
        body: [
          "Say your daily energy need is 1,200 Wh, your location gets roughly 5 full-sun hours on an average day, and you plan for a 70% realistic derate. Required panel watts ≈ 1,200 ÷ (0.70 × 5) = 1,200 ÷ 3.5 ≈ 343 W of rated panel capacity to realistically cover that daily need.",
          "If your location gets fewer full-sun hours (winter, higher latitude, frequent haze), you need proportionally more rated panel watts for the same daily energy target — a local solar-resource estimate is more accurate than a rough national average.",
        ],
      },
      {
        id: "check-station-ceiling",
        heading: "Check the station's own solar input ceiling",
        body: [
          "Every station has a maximum solar input watts spec — pairing it with a panel array rated well above that ceiling doesn't help, since the charge controller simply won't accept more than its rated input regardless of what the panels could theoretically produce in perfect sun.",
          "Among the current PowerMatchLab catalog, only the original 10 V1 products have a manufacturer-verified solar input spec on file; for the other products, this field is shown as \"Not verified\" until confirmed, rather than assumed from a similar model.",
        ],
      },
      {
        id: "panel-configuration-notes",
        heading: "A few practical configuration notes",
        body: [
          "Multiple smaller panels wired together can reach the same total watts as one large panel, and are often easier to angle toward the sun individually or fold for transport — check the station's supported input voltage/current window before combining panels, since exceeding it can prevent charging or trigger a safety cutoff.",
          "Panel angle and orientation toward the sun meaningfully affect real output — a flat or poorly-angled panel underperforms even a smaller, well-angled one.",
        ],
      },
    ],
    relatedProductIds: ["ecoflow-delta-3-classic", "anker-solix-c1000-gen-2", "anker-solix-f3800"],
    relatedGuideSlugs: [
      "solar-input-and-charging-times-explained",
      "how-long-to-charge-power-station-with-solar",
      "solar-generator-vs-portable-power-station",
    ],
    faq: [
      {
        question: "Can I just buy the biggest solar panel I can find?",
        answer:
          "Not usefully beyond the station's maximum solar input watts spec — that's a hard ceiling on how much the unit will actually accept, regardless of panel size. Size the panel to your daily energy need and the station's input ceiling, not to the largest available panel.",
      },
      {
        question: "How do I find my location's full-sun hours?",
        answer:
          "Search for a solar-resource or \"peak sun hours\" estimate for your specific area — these vary by latitude, season, and typical local weather, and are more accurate than a rough national average.",
      },
      {
        question: "Is the 60-80% derate always accurate?",
        answer:
          "It's a commonly cited real-world range for good conditions, not a guarantee — overcast weather, poor panel angle, heat, or partial shading can push real output lower. Treat it as a planning range, not an exact figure.",
      },
    ],
    sources: [
      {
        label: "U.S. Department of Energy / NREL — Understanding Solar Photovoltaic System Performance",
        url: "https://www.energy.gov/sites/default/files/2022-01/understanding-solar-photovoltaic-system-performance.pdf",
      },
      "Manufacturer charging specifications referenced in products.json",
    ],
    lastUpdated: "2026-09-04",
  },
  {
    slug: "how-long-does-a-portable-power-station-last",
    group: "charging-ownership",
    title: "How Long Does a Portable Power Station Last? (Lifespan and Cycle Life)",
    metaDescription:
      "How long a power station lasts before its battery meaningfully degrades: what cycle life means, real published cycle-life figures, and what shortens or extends it.",
    intro: [
      "Short answer: \"how long does it last\" has two different meanings — runtime per charge (covered in PowerMatchLab's other runtime guides) and overall lifespan, meaning how many charge cycles or years before the battery meaningfully degrades. This guide covers the second meaning: current LiFePO4-based stations are commonly rated for several thousand charge cycles, which can translate to well over a decade for typical home use.",
      "The real-world number depends on the specific cell, how the manufacturer manages it, and how the owner uses and stores it — this guide covers the published figures and the factors that move the number in either direction.",
    ],
    keyTakeaways: [
      "\"Cycle life\" means how many full charge/discharge cycles a battery survives before dropping to a stated capacity threshold (commonly 80%), not a hard failure point — capacity degrades gradually, it doesn't stop working at that threshold.",
      "Published LiFePO4 cycle-life figures in the PowerMatchLab catalog range from roughly 3,000 to 10,000+ cycles depending on the model and the capacity threshold cited — always check the specific product's own figure rather than assuming one number for all LiFePO4 units.",
      "Charging a few times a week, a several-thousand-cycle rating can realistically translate to well over a decade of useful life.",
      "Heat, deep discharges, and charging in freezing temperatures are the main factors that shorten real-world lifespan versus the rated figure.",
      "Warranty length is a useful secondary signal of how long a manufacturer expects the unit to perform, though it is a business commitment, not a technical measurement.",
    ],
    sections: [
      {
        id: "what-cycle-life-means",
        heading: "What \"cycle life\" actually measures",
        body: [
          "A charge cycle is generally one full discharge-and-recharge cycle (though partial cycles are typically counted proportionally by manufacturers). Cycle life is the number of such cycles a battery survives before its capacity drops to a stated threshold, commonly 80% of its original rated capacity.",
          "Reaching that threshold does not mean the battery stops working — it means it holds somewhat less energy than when new, and capacity continues to decline gradually afterward. A station rated for \"4,000 cycles to 80%\" is still usable well beyond that point, just at reduced capacity.",
        ],
      },
      {
        id: "real-published-figures",
        heading: "Real published figures from the current catalog",
        body: [
          "Cycle-life figures are exactly as published by each manufacturer, and only listed when a product's specification includes one — PowerMatchLab never estimates or infers a figure. A few examples currently on file:",
        ],
        bullets: [
          "BLUETTI Elite 30 V2: 3,000+ cycles (manufacturer-stated)",
          "Jackery Explorer 1000 V2: 4,000 cycles to 70%+ capacity (manufacturer-stated)",
          "Anker SOLIX S2000: 6,000 cycles to 80%; 10,000 cycles to 60% (manufacturer-stated)",
        ],
      },
      {
        id: "cycles-to-years",
        heading: "Converting cycles into a realistic number of years",
        body: [
          "Roughly: years of useful life ≈ cycle-life rating ÷ cycles per year. Charging fully once a week is about 52 cycles a year; a 4,000-cycle rating at that pace suggests roughly 77 years of cycles — in practice, calendar aging (chemical aging that happens regardless of use) and real-world factors mean actual lifespan is shorter than that raw division, but it illustrates why light, infrequent use rarely wears out a modern LFP battery on cycle count alone.",
          "Someone charging daily uses cycles roughly 7× faster than someone charging weekly — frequency of use matters more to lifespan than most other single factor.",
        ],
      },
      {
        id: "what-shortens-lifespan",
        heading: "What shortens real-world lifespan",
        body: [
          "Heat is the most consistently cited factor — storing or regularly charging a battery in a hot environment accelerates chemical aging beyond the cycle-count rating alone.",
          "Frequent full discharges to 0% stress cells more than partial cycles; many manufacturers recommend avoiding running the battery all the way to empty when it's avoidable.",
          "Charging a cold battery (commonly below freezing) can damage LiFePO4 cells, which is why many stations block or limit charging in cold conditions — check your specific model's manual for its stated temperature range.",
        ],
      },
      {
        id: "warranty-as-signal",
        heading: "Warranty as a secondary signal",
        body: [
          "A manufacturer's warranty length is a useful secondary indicator of confidence in the product's longevity, though it's a business and legal commitment rather than a direct technical measurement — check the specific product's warranty terms on its page or the manufacturer's own site.",
        ],
      },
    ],
    relatedProductIds: ["bluetti-elite-30-v2", "jackery-explorer-1000-v2", "anker-solix-s2000"],
    relatedGuideSlugs: [
      "lifepo4-vs-lithium-ion",
      "lifepo4-vs-nmc-battery-chemistry",
      "how-to-choose-the-right-portable-power-station",
    ],
    faq: [
      {
        question: "Does a power station stop working after its rated cycle count?",
        answer:
          "No — the cycle-life rating marks when capacity typically drops to a stated threshold (often 80%), not a failure point. The unit keeps working afterward, generally holding somewhat less charge than when new, with capacity continuing to decline gradually.",
      },
      {
        question: "Does every LiFePO4 station have the same cycle life?",
        answer:
          "No — published figures vary by manufacturer and model, commonly from roughly 3,000 to 10,000+ cycles to a stated threshold. Always check the specific product's own published figure rather than assuming a single number applies to all LiFePO4 units.",
      },
      {
        question: "Should I store my power station fully charged or empty?",
        answer:
          "This is manufacturer- and model-specific guidance — check your unit's manual for its recommended storage charge level, since following the actual manufacturer guidance for your model is more reliable than a generic rule.",
      },
    ],
    sources: [
      { label: "U.S. Department of Energy — DOE Explains...Batteries", url: "https://www.energy.gov/science/doe-explainsbatteries" },
      "Cycle-life figures as published by manufacturers in products.json",
    ],
    lastUpdated: "2026-09-04",
  },
  {
    slug: "how-to-choose-the-right-portable-power-station",
    group: "basics",
    title: "How to Choose the Right Portable Power Station",
    metaDescription:
      "A buying checklist for choosing a portable power station: capacity, output, chemistry, charging options, weight, and the special features that matter for specific use cases.",
    intro: [
      "Short answer: choosing the right power station comes down to six checks — capacity (Wh) for how long you need it, continuous and surge output (W) for what you need to run, battery chemistry, charging options, weight/portability, and any special features (240V, TT-30, UPS switchover, expandability) your specific use case needs.",
      "This guide is the buying-decision hub PowerMatchLab's other guides link back to — each pillar links to the dedicated guide that covers it in depth.",
    ],
    keyTakeaways: [
      "Start from your actual devices and use case, not a target price or brand — capacity and output requirements follow from what you'll run and for how long.",
      "Capacity (Wh) and output (W) are two separate checks; a station can pass one and fail the other.",
      "Nearly every current model uses LiFePO4 chemistry, so chemistry is less of a differentiator than it once was — but always confirm on the specific product page.",
      "Charging options (AC watts, solar input, car/DC input) determine how quickly and how you'll realistically recharge it.",
      "Special features — 120/240V, TT-30, fast UPS switchover, expandability — only matter if your specific use case needs them; don't pay for headroom you won't use.",
    ],
    sections: [
      {
        id: "pillar-capacity",
        heading: "Pillar 1: Capacity (Wh) — how long it needs to last",
        body: [
          "List your devices, their real watts, and hours of use per day, then apply PowerMatchLab's standard formula: recommended minimum capacity (Wh) ≈ (daily energy Wh × days of autonomy) ÷ 0.85 usable-energy factor × 1.2 reserve factor. The dedicated sizing guide walks through this in full with a worked example.",
        ],
      },
      {
        id: "pillar-output",
        heading: "Pillar 2: Continuous and surge output (W) — what it can actually run",
        body: [
          "Capacity alone doesn't guarantee a device will run — add up the running watts of everything you'd use at once for the continuous output check, then add the single largest startup surge on top for the surge check. A station can have plenty of watt-hours and still fail to start a motor-driven appliance if its output rating is too low.",
        ],
      },
      {
        id: "pillar-chemistry",
        heading: "Pillar 3: Battery chemistry",
        body: [
          "Nearly every current model, including every product in the PowerMatchLab catalog, uses LiFePO4 (LFP) for its long cycle life and thermal stability. Chemistry is less of a differentiator among current products than it was a few years ago, but always confirm the specific figure on the product's own page rather than assuming.",
        ],
      },
      {
        id: "pillar-charging",
        heading: "Pillar 4: Charging options",
        body: [
          "AC charging watts sets the fastest realistic wall-outlet recharge speed. Solar input watts (where verified) determines whether and how well it pairs with panels. Some models also accept car/DC charging. PowerMatchLab's charging guides cover how to estimate real-world charging time for each.",
        ],
      },
      {
        id: "pillar-weight",
        heading: "Pillar 5: Weight and portability",
        body: [
          "Bigger capacity generally means more weight — a real trade-off for anything you carry (backpacking, van life) versus something that stays put (home backup, a vehicle-mounted setup). Check the listed weight on the product page and in the Compare tool before assuming a given capacity is practical for your use case.",
        ],
      },
      {
        id: "pillar-special-features",
        heading: "Pillar 6: Special features for specific use cases",
        body: [
          "120/240V output matters only if you have a specific 240V load (well pump, electric range, dryer). A native TT-30 outlet matters for RV owners who want to plug in their factory shore cord directly. Fast UPS switchover (commonly 10-20 ms) matters for automatic cutover on sensitive electronics. Expandability matters if your capacity needs might grow over time rather than staying fixed.",
          "None of these are universally necessary — they're worth paying for only if your specific use case actually needs them, which is why PowerMatchLab has a dedicated guide for each major use case (camping, RV, home backup, remote work/van life).",
        ],
      },
      {
        id: "putting-it-together",
        heading: "Putting it together",
        body: [
          "Run through capacity and output for your actual devices first — those two checks eliminate most unsuitable options immediately. Then filter by whichever special features your use case genuinely needs, and compare weight and charging options among what's left. PowerMatchLab's Power Calculator automates the capacity and output checks against the current catalog once you enter your own device list.",
        ],
      },
    ],
    relatedProductIds: ["jackery-explorer-1000-v2", "ecoflow-delta-2-max", "anker-solix-f3000"],
    relatedGuideSlugs: [
      "what-is-a-portable-power-station",
      "how-to-size-a-portable-power-station",
      "watts-vs-watt-hours",
      "how-long-does-a-portable-power-station-last",
    ],
    faq: [
      {
        question: "What's the single most important spec to check first?",
        answer:
          "There isn't one universal answer — capacity and output are both necessary checks, and a station that fails either one is the wrong choice regardless of how good its other specs look. Start from your actual devices, not a single headline spec.",
      },
      {
        question: "Is a more expensive power station always better?",
        answer:
          "Not necessarily — price often tracks capacity, output, brand, and feature set, but the \"best\" station is the one that clears your specific capacity and output requirements without paying for headroom or features you won't use.",
      },
      {
        question: "Should I buy based on brand reputation?",
        answer:
          "Brand can be a reasonable signal for support and warranty service, but always verify the specific model's own specs — capacity, output, chemistry, and charging — rather than assuming every product from a given brand performs the same.",
      },
    ],
    sources: [
      "Manufacturer specification sheets referenced in products.json",
    ],
    lastUpdated: "2026-09-04",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
