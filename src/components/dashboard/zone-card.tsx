"use client";

import { InfoTooltip } from "./info-tooltip";

interface Props {
  name: string;
  mode: string;
  moisture: number | null;
  info: string;
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
  Control: "bg-success/10 text-success border border-success/20",
  Stress: "bg-warning/10 text-warning border border-warning/20",
  AI: "bg-info/10 text-info border border-info/20",
};

export function ZoneCard({ name, mode, moisture, info, accent }: Props) {
  const pct = moisture ?? 0;
  const display = moisture != null ? `${pct}%` : "N/A";
  const barWidth = moisture != null ? `${pct}%` : "0%";
  const modeStyle = modeLabels[mode] || "bg-muted text-muted-foreground";

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated">
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accent.tint} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Top accent bar */}
      <div
        className={`absolute left-4 right-4 top-0 h-0.5 rounded-full bg-gradient-to-r ${accent.from} ${accent.to} opacity-60 transition-all duration-300 group-hover:left-3 group-hover:right-3 group-hover:opacity-100`}
      />

      {/* Corner dots */}
      <div className="absolute right-3 top-3 flex gap-1">
        <span
          className={`h-1.5 w-1.5 rounded-full ${accent.dot} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        />
        <span
          className={`h-1.5 w-1.5 rounded-full ${accent.dot} opacity-0 transition-opacity duration-300 group-hover:opacity-60`}
        />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {name}
            </p>
            <InfoTooltip content={info} />
          </div>
          <span
            className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${modeStyle}`}
          >
            {mode}
          </span>
        </div>

        <p className="mt-2 font-heading text-4xl font-black tracking-tight text-card-foreground md:text-[2.5rem]">
          {display}
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Soil Moisture</span>
            <span>{moisture != null ? `${Math.round(pct)}%` : "—"}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${accent.progress} transition-all duration-700`}
              style={{ width: barWidth }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
