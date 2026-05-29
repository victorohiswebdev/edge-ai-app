"use client";

import { motion } from "framer-motion";
import type { LiveReading } from "@/lib/types";

interface Props {
  live: LiveReading | null;
  updatedAt: string;
}

export function LiveLogPanel({ live, updatedAt }: Props) {
  const readings: { label: string; value: string; unit: string }[] = [
    {
      label: "Temperature",
      value: live?.temperature_c?.toFixed(1) ?? "—",
      unit: "°C",
    },
    {
      label: "Humidity",
      value: live?.humidity_perc != null ? Math.round(live.humidity_perc).toString() : "—",
      unit: "%",
    },
    {
      label: "Zone 1 Moisture",
      value: live?.moisture_zone_1 != null ? live.moisture_zone_1.toString() : "—",
      unit: "%",
    },
    {
      label: "Zone 2 Moisture",
      value: live?.moisture_zone_2 != null ? live.moisture_zone_2.toString() : "—",
      unit: "%",
    },
    {
      label: "Zone 3 Moisture",
      value: live?.moisture_zone_3 != null ? live.moisture_zone_3.toString() : "—",
      unit: "%",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-2xl border border-emerald-900/20 bg-gradient-to-br from-[#0a1a0a] via-[#0d220d] to-[#0a1a0a] shadow-xl"
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-emerald-900/30 px-5 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-amber-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
        <span className="ml-2 font-mono text-[11px] font-medium uppercase tracking-wider text-emerald-400/70">
          Serial Monitor — Live Feed
        </span>
        {live && (
          <span className="ml-auto font-mono text-[10px] text-emerald-500/50">
            updated {updatedAt}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        {/* Reading grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {readings.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-xl border border-emerald-800/20 bg-emerald-950/40 p-4 backdrop-blur-sm"
            >
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-emerald-400/50">
                {r.label}
              </p>
              <p className="mt-0.5 font-mono text-xl font-bold tracking-tight text-emerald-200 md:text-2xl">
                {r.value}
                <span className="ml-0.5 text-sm font-normal text-emerald-400/60">
                  {r.unit}
                </span>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Latest raw line (simulated serial output) */}
        <div className="mt-4 rounded-xl border border-emerald-800/15 bg-emerald-950/20 p-4">
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-widest text-emerald-400/40">
            Latest Serial Frame
          </p>
          {live ? (
            <p className="font-mono text-xs leading-relaxed text-emerald-300/80">
              <span className="text-emerald-500/50">$ </span>TEMP:{" "}
              {live.temperature_c?.toFixed(1) ?? "--"}°C{" "}
              <span className="text-emerald-500/30">|</span> HUM:{" "}
              {live.humidity_perc != null ? Math.round(live.humidity_perc) : "--"}%
              <span className="text-emerald-500/30"> |</span> Z1:{" "}
              {live.moisture_zone_1 ?? "--"}%{" "}
              <span className="text-emerald-500/30">|</span> Z2:{" "}
              {live.moisture_zone_2 ?? "--"}%{" "}
              <span className="text-emerald-500/30">|</span> Z3:{" "}
              {live.moisture_zone_3 ?? "--"}%
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="ml-1 inline-block h-4 w-2 bg-emerald-400/60"
              />
            </p>
          ) : (
            <p className="font-mono text-xs italic text-emerald-400/40">
              Waiting for serial data…
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
