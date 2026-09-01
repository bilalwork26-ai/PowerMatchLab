import type { UseCaseKey } from "@/types/product";

/**
 * Editorial framing for each Best-For page. The product list itself is derived
 * from `products.json` at render time by `selectBestFor()` in lib/best-for.ts —
 * this file only supplies the human explanation of what matters and why.
 */

export interface BestForContent {
  key: UseCaseKey;
  slug: string;
  title: string;
  metaDescription: string;
  intro: string[];
  whatMatters: { heading: string; detail: string }[];
  commonMistakes: string[];
  compatibilityLogic: string[];
  faq: { question: string; answer: string }[];
  lastUpdated: string;
}

export const BEST_FOR: BestForContent[] = [
  {
    key: "camping",
    slug: "best-for-camping",
    title: "Best Power Stations for Camping",
    metaDescription:
      "What actually matters for camping power: weight, USB-C output, low standby drain and enough capacity for a weekend of lights, phones and a 12V fridge.",
    intro: [
      "Camping power is usually about small, steady loads — phones, lights, a fan, a 12V cooler — carried somewhere on foot or in a packed vehicle.",
      "That makes weight and standby efficiency more important than raw output.",
    ],
    whatMatters: [
      {
        heading: "Weight and size",
        detail:
          "You carry this from the car to the site and back. Under ~5 kg is trivial; 10-13 kg is a two-hand lift; above ~16 kg gets awkward for tent camping.",
      },
      {
        heading: "Low idle consumption",
        detail:
          "A unit that sips 4-9 W while idle wastes far less of its charge over a quiet weekend than one with high standby drain. Where idle draw is unverified we say so.",
      },
      {
        heading: "USB-C power delivery",
        detail:
          "Most camp devices charge over USB-C now. Multiple high-wattage USB-C ports can mean you never need the inverter at all, which saves energy.",
      },
      {
        heading: "Enough — not maximum — capacity",
        detail:
          "A weekend of phones, lights and a small fridge is often 200-600 Wh total. A huge battery is dead weight you carry for nothing.",
      },
    ],
    commonMistakes: [
      "Buying a 2kWh unit for a use case that needs 400 Wh, then hating the weight.",
      "Ignoring standby drain — some units lose a meaningful fraction of charge just sitting on over a few days.",
      "Assuming a small station can run a full-size AC appliance; check surge and continuous watts.",
    ],
    compatibilityLogic: [
      "We favour units the manufacturer positions for camping / day trips / outdoors.",
      "Lighter units rank higher; verified low idle consumption is a plus.",
      "Very large, heavy platforms are down-ranked here even if their specs are strong.",
    ],
    faq: [
      {
        question: "Do I need an inverter-style (pure sine) output for camping?",
        answer:
          "All stations in this catalog output pure sine AC, which is safe for sensitive electronics. For USB devices the inverter is not used at all.",
      },
      {
        question: "Can I recharge while camping?",
        answer:
          "Yes — a folding solar panel within the unit's input range can top it up during the day. Real solar output is usually 60-80% of the panel's rating.",
      },
    ],
    lastUpdated: "2026-09-01",
  },
  {
    key: "rv",
    slug: "best-for-rv",
    title: "Best Power Stations for RV Use",
    metaDescription:
      "RV power priorities: a TT-30 outlet or enough output for the rig's loads, expansion capacity for longer trips, and manageable weight for a mobile install.",
    intro: [
      "RV use spans everything from topping up house batteries to running a rooftop air conditioner. The right unit depends on whether you want plug-in shore-cord compatibility or just enough output for specific appliances.",
    ],
    whatMatters: [
      {
        heading: "TT-30 compatibility",
        detail:
          "A native TT-30 (30A) outlet lets you plug a standard RV shore cord straight into the station. Without it you are limited to the household outlets on the unit.",
      },
      {
        heading: "Continuous and surge output",
        detail:
          "RV air conditioners have large startup surges. Check that both continuous and surge ratings clear your biggest load plus everything else running.",
      },
      {
        heading: "Expansion capacity",
        detail:
          "Longer boondocking trips benefit from expandable platforms so you can add battery capacity without a second unit.",
      },
      {
        heading: "Weight and mounting",
        detail:
          "It lives in the rig, so weight matters for payload and for the spot you mount it, but portability matters less than for camping.",
      },
    ],
    commonMistakes: [
      "Expecting any power station to run a 13,500 BTU rooftop AC — most cannot start it without a soft-start kit and ample surge headroom.",
      "Overlooking TT-30: without it, shore-cord appliances need adapters and you lose the 30A circuit.",
      "Not planning for recharge — alternator, solar or shore power — on multi-day trips.",
    ],
    compatibilityLogic: [
      "Units with a verified TT-30 outlet rank higher.",
      "Higher verified continuous and surge output ranks higher.",
      "Expandable platforms get a bonus; fixed-capacity units are not excluded.",
    ],
    faq: [
      {
        question: "Will a portable power station replace my RV's converter/charger?",
        answer:
          "Not directly. A power station powers AC loads; integrating it with the rig's 12V system and charger needs additional wiring or a dedicated inverter/charger setup.",
      },
      {
        question: "Can I charge the station from the RV alternator while driving?",
        answer:
          "Some units accept a 12V/24V DC input that can be fed from the vehicle with the right cable and current limits. Check the unit's DC input spec.",
      },
    ],
    lastUpdated: "2026-09-01",
  },
  {
    key: "refrigerator-backup",
    slug: "best-for-refrigerator-backup",
    title: "Best Power Stations for Refrigerator Backup",
    metaDescription:
      "For keeping a fridge or freezer cold through an outage: surge headroom, 1kWh+ usable capacity, low idle draw and ideally solar input for multi-day events.",
    intro: [
      "Keeping food cold through an outage is a focused job: handle the compressor's startup surge, then supply roughly 1,000-1,600 Wh per day for as long as the power is out.",
    ],
    whatMatters: [
      {
        heading: "Surge headroom",
        detail:
          "The compressor's inrush current is the moment a too-small unit fails. A surge rating well above the fridge's startup spike is essential.",
      },
      {
        heading: "Usable daily capacity",
        detail:
          "Plan around 1,000-1,600 Wh per fridge per day. A 1kWh station covers roughly a day; 2kWh gets you toward two.",
      },
      {
        heading: "Low idle consumption",
        detail:
          "Over a multi-day outage, a unit that idles at 6-9 W wastes far less than one with high standby draw.",
      },
      {
        heading: "Solar input",
        detail:
          "A panel that replaces the fridge's daily energy can keep the loop going indefinitely in good weather.",
      },
    ],
    commonMistakes: [
      "Sizing on running watts (≈150 W) instead of daily energy (often 1,000-1,600 Wh).",
      "Buying a compact 300Wh unit that cannot sustain a full-size fridge for more than a couple of hours.",
      "Forgetting that opening the door and a warm room both raise energy use sharply.",
    ],
    compatibilityLogic: [
      "Units with verified surge ratings that clear a typical fridge startup rank higher.",
      "Higher verified capacity and lower verified idle draw rank higher.",
      "Solar input capability is a plus for multi-day scenarios.",
    ],
    faq: [
      {
        question: "How long will a 1kWh station run my fridge?",
        answer:
          "As a planning estimate, capacity_wh × 0.85 ÷ daily energy. For a fridge using 1,200 Wh/day, a 1,024Wh unit is roughly three-quarters of a day. Real results vary with the fridge and ambient temperature.",
      },
      {
        question: "Should I get one big station or two smaller ones?",
        answer:
          "One larger unit is simpler and usually more efficient. Two smaller units add redundancy and flexibility but cost more per Wh and take more space.",
      },
    ],
    lastUpdated: "2026-09-01",
  },
  {
    key: "home-backup",
    slug: "best-for-home-backup",
    title: "Best Power Stations for Home Backup",
    metaDescription:
      "Home backup priorities: fast UPS switchover, enough output for your essential circuit, large or expandable capacity, and 120/240V if you have split-phase loads.",
    intro: [
      "Home backup ranges from 'keep the fridge, internet and a few lights on' to 'run most of the house'. Match the unit to which of those you actually need.",
    ],
    whatMatters: [
      {
        heading: "UPS switchover time",
        detail:
          "A fast transfer (around 10-20 ms) keeps desktops, networking gear and some medical devices running through the cutover without rebooting.",
      },
      {
        heading: "Continuous output vs. your essentials",
        detail:
          "Add up the essential loads you want on at once. The unit's rated output must clear that, with surge headroom for the fridge and any pumps.",
      },
      {
        heading: "Capacity and expandability",
        detail:
          "Whole-day or multi-day coverage needs large capacity, or an expandable platform you can grow.",
      },
      {
        heading: "120/240V split-phase",
        detail:
          "Well pumps, ranges, dryers and some HVAC need 240V. Only a few large units provide it natively; the rest are limited to 120V loads.",
      },
    ],
    commonMistakes: [
      "Assuming a 1kWh unit can back up the whole house — it is an essentials device, not a generator replacement.",
      "Ignoring 240V requirements for well pumps or ranges.",
      "Not accounting for how you will recharge during a long outage.",
    ],
    compatibilityLogic: [
      "Units with fast verified UPS switchover rank higher.",
      "Higher verified output and capacity rank higher; expandable platforms get a bonus.",
      "If you mark 240V as required, units without native 240V are shown as Not Suitable rather than hidden.",
    ],
    faq: [
      {
        question: "Can a power station connect to my home panel?",
        answer:
          "Some large units support a transfer switch or a dedicated inlet for backing up selected circuits. This is an electrical installation and should be done by a licensed electrician.",
      },
      {
        question: "How much capacity do I need for a 24-hour outage?",
        answer:
          "Add up the daily energy of the loads you want to keep on. Essentials (fridge, internet, phones, some lights) often land around 2,000-4,000 Wh per day; add reserve and divide by ~0.85 for usable capacity.",
      },
    ],
    lastUpdated: "2026-09-01",
  },
];

export function getBestFor(slug: string): BestForContent | undefined {
  return BEST_FOR.find((b) => b.slug === slug);
}
