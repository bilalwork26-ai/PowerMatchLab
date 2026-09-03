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
  sources: GuideSource[];
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
  {
    slug: "power-station-for-refrigerator",
    title: "What Size Power Station Do I Need for a Refrigerator?",
    metaDescription:
      "A step-by-step method for sizing a power station to run a refrigerator: startup surge, daily watt-hours, the 85% usable-energy rule, and a worked example.",
    intro: [
      "A refrigerator is one of the most common reasons people buy a portable power station, and it is also one of the easiest appliances to undersize for if you only look at the number on the door sticker.",
      "This guide walks through the same watts-vs-watt-hours method used throughout PowerMatchLab, applied specifically to a fridge or freezer, so you can size a station with confidence instead of guessing.",
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
    title: "What Size Power Station Do I Need for a CPAP Machine?",
    metaDescription:
      "How to size a power station for CPAP therapy: why wattage varies by model and humidifier setting, how to check your device's real draw, and a worked example.",
    intro: [
      "This is general planning information about sizing a portable power station for CPAP equipment — it is not medical advice. For anything related to your therapy itself, follow the guidance of your CPAP manufacturer or durable medical equipment (DME) provider.",
      "CPAP machines draw far less power than a refrigerator, but exactly how much varies a lot by model and by whether a heated humidifier and heated tubing are in use — so the first step is finding your own device's real number rather than assuming one.",
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
      "bluetti-elite-30-v2",
      "ecoflow-delta-3-classic",
      "anker-solix-c1000-gen-2",
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
    title: "What Size Power Station Do I Need for Camping?",
    metaDescription:
      "Sizing a power station for camping: gear to plan for, daily energy vs. peak watts, trip length and rechargeability, and why battery power avoids generator carbon monoxide risk.",
    intro: [
      "Camping loads are usually smaller and more varied than a home-backup setup — phones, lights, a fan, maybe a 12V cooler or a drone battery — but trip length and how (or whether) you can recharge along the way change the sizing math more than the gear list does.",
      "This guide applies the same watts-vs-watt-hours method used across PowerMatchLab to a camping trip, with a worked example you can adapt to your own gear.",
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
      "bluetti-elite-30-v2",
      "jackery-explorer-1000-v2",
      "anker-solix-c1000-gen-2",
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
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
