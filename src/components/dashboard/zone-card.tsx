"use client";

import { motion } from "framer-motion";

interface Props {
  name: string;
  mode: string;
  moisture: number | null;
  accent: {
    from: string;
    to: string;
    dot: string;
    progress: string;
    tint: string;
    badge: string;
  };
}

const modeLabels: Record<string, string> = {
  Control: "bg-success/10 text-success",
  Stress: "bg-warning/10 text-warning",
  AI: "bg-info/10 text-info",
};

export function ZoneCard({ name, mode, moisture, accent }: Props) {
  const pct = moisture ?? 0;
  const display = moisture != null ? `${pct}%` : "N/A";
  const barWidth = moisture != null ? `${pct}%` : "0%";
  const modeStyle = modeLabels[mode] || "bg-muted text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accent.tint} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Top accent bar */}
      <div
        className={`absolute left-4 right-4 top-0 h-0.5 rounded-full bg-gradient-to-r ${accent.from} ${accent.to} opacity-60 transition-all duration-400 group-hover:left-3 group-hover:right-3 group-hover:opacity-100`}
      />

      {/* Corner dots */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot} opacity-60`} />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{name}</p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${modeStyle}`}
          >
            {mode}
          </span>
        </div>

        <p className="mt-2 font-heading text-3xl font-bold tracking-tight text-card-foreground">
          {display}
        </p>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full rounded-full ${accent.progress} transition-all duration-700`}
            initial={{ width: "0%" }}
            animate={{ width: barWidth }}
          />
        </div>
      </div>
    </motion.div>
  );
}
