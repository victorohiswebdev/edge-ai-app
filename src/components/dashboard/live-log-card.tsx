"use client";

import { motion } from "framer-motion";
import type { LiveReading } from "@/lib/types";

interface Props {
  live: LiveReading | null;
  updatedAt: string;
}

export function LiveLogCard({ live, updatedAt }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top accent bar */}
      <div className="absolute left-4 right-4 top-0 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 opacity-60 transition-all duration-400 group-hover:left-3 group-hover:right-3 group-hover:opacity-100" />

      {/* Corner dots */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500/60" />
      </div>

      <div className="relative">
        <p className="text-sm text-muted-foreground">Live Log</p>
        <div className="mt-2 space-y-1 font-mono text-xs">
          <p>
            Temp:{" "}
            {live?.temperature_c != null
              ? `${live.temperature_c.toFixed(1)}°C`
              : "N/A"}
          </p>
          <p>
            Humidity:{" "}
            {live?.humidity_perc != null
              ? `${Math.round(live.humidity_perc)}%`
              : "N/A"}
          </p>
          <p>
            Z1:{" "}
            {live?.moisture_zone_1 != null
              ? `${live.moisture_zone_1}%`
              : "N/A"}
          </p>
          <p>
            Z2:{" "}
            {live?.moisture_zone_2 != null
              ? `${live.moisture_zone_2}%`
              : "N/A"}
          </p>
          <p>
            Z3:{" "}
            {live?.moisture_zone_3 != null
              ? `${live.moisture_zone_3}%`
              : "N/A"}
          </p>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Last read: {updatedAt}
        </p>
      </div>
    </motion.div>
  );
}
