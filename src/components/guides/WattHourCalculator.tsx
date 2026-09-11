"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const darkInput =
  "w-full rounded-md border border-navy-700 bg-navy-900/60 px-3 py-2 text-white outline-none transition-shadow duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

/** Watt-hours = watts × hours. The one formula this whole guide is about. */
export function WattHourCalculator() {
  const [watts, setWatts] = useState(150);
  const [hours, setHours] = useState(4);

  const wh = useMemo(() => Math.max(0, watts) * Math.max(0, hours), [watts, hours]);

  return (
    <div className="not-prose my-8 rounded-xl border border-navy-700 bg-gradient-to-b from-navy-800 to-navy-900 p-5">
      <h2 className="text-lg font-bold text-white">Watt-Hour Calculator</h2>
      <p className="mt-1 text-sm text-navy-300">
        Watt-hours = watts × hours. Enter a device&rsquo;s running watts and how
        long it runs to see how much energy it actually uses.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium text-navy-200">Device running watts (W)</span>
          <input
            type="number"
            min={0}
            value={watts}
            onChange={(e) => setWatts(Math.max(0, Number(e.target.value) || 0))}
            className={cn("mt-1", darkInput)}
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-navy-200">Hours of use</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Math.max(0, Number(e.target.value) || 0))}
            className={cn("mt-1", darkInput)}
          />
        </label>
      </div>

      <div className="mt-5 rounded-lg border border-cyan-700/40 bg-navy-900/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Energy used
        </p>
        <p className="mt-2 text-2xl font-bold text-white">
          {wh.toLocaleString("en-US", { maximumFractionDigits: 1 })} Wh
        </p>
        <p className="mt-2 text-xs text-navy-400">
          {watts.toLocaleString("en-US")} W × {hours} h = {" "}
          {wh.toLocaleString("en-US", { maximumFractionDigits: 1 })} Wh. Compare
          that to a station&rsquo;s usable capacity (roughly 85% of its rated Wh)
          to see how many times it could run that device.
        </p>
      </div>
    </div>
  );
}
