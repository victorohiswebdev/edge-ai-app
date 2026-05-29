"use client";

import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string;
  subtitle: string;
  accent: {
    from: string;
    to: string;
  };
  tint: string;
}

export function SensorCard({ label, value, subtitle, accent, tint }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Gradient overlay on hover */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tint} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Top accent bar */}
      <div
        className={`absolute left-4 right-4 top-0 h-0.5 rounded-full bg-gradient-to-r ${accent.from} ${accent.to} opacity-60 transition-all duration-400 group-hover:left-3 group-hover:right-3 group-hover:opacity-100`}
      />

      {/* Corner dots */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
        <span
          className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${accent.from} ${accent.to}`}
        />
        <span
          className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${accent.from} ${accent.to} opacity-60`}
        />
      </div>

      <div className="relative">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-3xl font-bold tracking-tight text-card-foreground">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  );
}
