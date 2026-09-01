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

export interface Guide {
  slug: string;
  title: string;
  metaDescription: string;
  intro: string[];
  /** Ordered sections; the table of contents is derived from these. */
  sections: GuideSection[];
  /** Product ids to surface as "related" (must exist in products.json). */
  relatedProductIds: string[];
  faq: GuideFaq[];
  sources: string[];
  lastUpdated: string; // ISO date
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-size-a-portable-power-station",
    title: "How to Size a Portable Power Station (Without the Math Headache)",
    metaDescription:
      "A plain-English method for choosing power station capacity and output: list your devices, estimate daily energy, add reserve, and check continuous and surge watts.",
    intro: [
      "Sizing a power station comes down to two independent questions: can it deliver enough power at once (watts), and can it store enough energy for how long you need it (watt-hours).",
      "This guide walks through both, using the same method as the PowerMatchLab Power Calculator so you can sanity-check its output.",
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
      "ecoflow-delta-3-classic",
      "anker-solix-c1000-gen-2",
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
    title: "Can a Power Station Run a Refrigerator? What to Check First",
    metaDescription:
      "Most 1kWh-class power stations can run a household refrigerator for many hours. Here is how to check surge watts, daily energy and realistic runtime.",
    intro: [
      "A full-size refrigerator is one of the most common reasons people buy a power station, and for most modern 1kWh-and-up units the answer is yes — with caveats around startup surge and how long you need it to last.",
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
      "anker-solix-s2000",
      "jackery-explorer-2000-v2",
      "bluetti-ac180",
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
    title: "LiFePO4 vs. NMC: Battery Chemistry for Power Stations",
    metaDescription:
      "Why most current portable power stations use LiFePO4 (LFP): longer cycle life, better thermal stability, slightly lower energy density. What it means for buyers.",
    intro: [
      "Nearly every power station in the current PowerMatchLab catalog uses LiFePO4 (lithium iron phosphate, or LFP). Here is why the industry shifted, and what the trade-offs mean for you.",
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
      "anker-solix-c2000-gen-2",
      "ecoflow-delta-pro-3",
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
    title: "Solar Input and Charging Times, Explained",
    metaDescription:
      "How to read a power station's solar input and AC charging specs, why real solar rarely hits the rated number, and how to plan realistic recharge times.",
    intro: [
      "Charging specs are easy to misread. This guide covers what solar input watts, AC charging watts and quoted charging times actually tell you.",
    ],
    sections: [
      {
        id: "ac-charging",
        heading: "AC (wall) charging",
        body: [
          "AC charging watts is the fastest a station refills from a normal outlet. A 1,000Wh station with 1,400 W AC input can theoretically refill in under an hour; in practice the last 10-20% tapers, so quoted 'full charge' times are a bit longer.",
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
      "anker-solix-c1000-gen-2",
      "anker-solix-f3800",
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
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
