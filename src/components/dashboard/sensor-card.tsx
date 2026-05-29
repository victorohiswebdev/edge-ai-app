"use client";

import { InfoTooltip } from "./info-tooltip";

interface Props {
  label: string;
  value: string;
  subtitle: string;
  accent: { from: string; to: string };
  tint: string;
  info: string;
}

export function SensorCard({ label, value, subtitle, accent, tint, info }: Props) {
  return (
    <div
      className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated"
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tint} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Top accent bar */}
      <div
        className={`absolute left-4 right-4 top-0 h-0.5 rounded-full bg-gradient-to-r ${accent.from} ${accent.to} opacity-60 transition-all duration-300 group-hover:left-3 group-hover:right-3 group-hover:opacity-100`}
      />

      {/* Corner dots */}
      <div className="absolute right-3 top-3 flex gap-1">
        <span
          className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${accent.from} ${accent.to} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        />
        <span
          className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${accent.from} ${accent.to} opacity-0 transition-opacity duration-300 group-hover:opacity-60`}
        />
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <InfoTooltip content={info} />
        </div>
        <p className="mt-1.5 font-heading text-4xl font-black tracking-tight text-card-foreground md:text-[2.5rem]">
          {value}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
