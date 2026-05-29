"use client";

import type { DataSource } from "@/lib/types";

interface Props {
  dataSource: DataSource;
}

const badgeConfig: Record<
  DataSource,
  { label: string; dot: string; bg: string }
> = {
  live: {
    label: "Live Data",
    dot: "bg-green-400",
    bg: "bg-white/15 text-white border border-white/20",
  },
  database: {
    label: "Database",
    dot: "bg-blue-400",
    bg: "bg-white/15 text-white border border-white/20",
  },
  synthetic: {
    label: "Simulated",
    dot: "bg-amber-400",
    bg: "bg-white/15 text-white border border-white/20",
  },
};

export function HeroHeader({ dataSource }: Props) {
  const badge = badgeConfig[dataSource];

  return (
    <header className="relative overflow-hidden bg-green-700">
      {/* 🌾 Crop-row pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 48px,
              rgba(255,255,255,0.06) 48px,
              rgba(255,255,255,0.06) 49px
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 80px,
              rgba(255,255,255,0.04) 80px,
              rgba(255,255,255,0.04) 81px
            )
          `,
        }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-14 pt-16 text-center md:pb-16 md:pt-24">
        {/* Badge row */}
        <div className="mb-6 flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${badge.bg}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
            System Online
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-4xl font-black tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
          Smart Farming{" "}
          <span className="text-lime-300">
            Dashboard
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          An Integrated Edge AI Framework for Predictive Water Management{" "}
          <span className="hidden sm:inline">and Plant Health Assessment</span>
        </p>

        {/* Divider */}
        <div className="mt-8 h-px w-24 bg-white/20" />

        {/* Quick metrics row */}
        <div className="mt-6 grid w-full max-w-lg grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-heading text-2xl font-black text-white">3</p>
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              Irrigation Zones
            </p>
          </div>
          <div className="border-x border-white/10">
            <p className="font-heading text-2xl font-black text-white">BME280</p>
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              Environmental Sensor
            </p>
          </div>
          <div>
            <p className="font-heading text-2xl font-black text-white">RF</p>
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              AI Model
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
