"use client";

import type { IrrigationPrediction } from "@/lib/types";

interface Props {
  predictions: IrrigationPrediction[] | null;
}

const ZONE_CONFIG: Record<number, { label: string; mode: string }> = {
  1: { label: "Zone 1 — Control", mode: "Control" },
  2: { label: "Zone 2 — Stress", mode: "Stress" },
  3: { label: "Zone 3 — AI-Managed", mode: "AI" },
};

/** Format hours/days since last irrigation event. */
function formatSinceWatered(days: number): string {
  if (days < 0.04) return "Just watered";
  if (days < 1) return `${Math.round(days * 24)}h ago`;
  return `${days.toFixed(1)}d ago`;
}

/** Tailwind classes for zone mode badges */
const MODE_STYLES: Record<string, string> = {
  Control: "bg-success/10 text-success border border-success/20",
  Stress: "bg-warning/10 text-warning border border-warning/20",
  AI: "bg-info/10 text-info border border-info/20",
};

export function IrrigationPredictionCard({ predictions }: Props) {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <p className="text-sm text-muted-foreground">
          No prediction data available. Ensure the API and RF model are loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {predictions.map((pred) => {
        const config = ZONE_CONFIG[pred.zone] || { label: `Zone ${pred.zone}`, mode: "AI" };
        const modeStyle = MODE_STYLES[config.mode] || "bg-muted text-muted-foreground";
        const needsWater = pred.should_irrigate;
        const barPct = Math.min(pred.current_moisture / 100, 1);
        const predPct = Math.min(pred.predicted_moisture / 100, 1);
        const threshPct = pred.threshold / 100;

        return (
          <div
            key={pred.zone}
            className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated"
          >
            {/* Status bar — green if stable, red if irrigation needed */}
            <div
              className={`absolute left-4 right-4 top-0 h-0.5 rounded-full transition-all duration-300 group-hover:left-3 group-hover:right-3 ${
                needsWater
                  ? "bg-gradient-to-r from-amber-500 to-red-500 opacity-80"
                  : "bg-gradient-to-r from-green-500 to-emerald-400 opacity-60"
              }`}
            />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {config.label}
                  </p>
                  <span
                    className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${modeStyle}`}
                  >
                    {config.mode}
                  </span>
                </div>

                {/* Decision badge */}
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                    needsWater
                      ? "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-800"
                      : "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-950 dark:text-green-400 dark:ring-green-800"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      needsWater ? "animate-pulse bg-red-500" : "bg-green-500"
                    }`}
                  />
                  {needsWater ? "IRRIGATE" : "OK"}
                </div>
              </div>

              {/* Moisture values */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Current
                  </p>
                  <p className="font-heading text-2xl font-black tracking-tight text-card-foreground">
                    {pred.current_moisture.toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Predicted
                  </p>
                  <p className="font-heading text-2xl font-black tracking-tight text-card-foreground">
                    {pred.predicted_moisture.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Gauge — current vs predicted vs threshold */}
              <div className="mt-4">
                <div className="mb-3 space-y-2">
                  {/* Current moisture bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[10px] font-medium text-muted-foreground">Current</span>
                    <div className="flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                        style={{ width: `${barPct * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Predicted moisture bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[10px] font-medium text-muted-foreground">
                      {needsWater ? "Will be" : "Forecast"}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          needsWater
                            ? "bg-gradient-to-r from-amber-500 to-red-500"
                            : "bg-gradient-to-r from-teal-500 to-emerald-400"
                        }`}
                        style={{ width: `${predPct * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Threshold line */}
                  <div className="relative flex items-center gap-2">
                    <span className="w-16 text-[10px] font-medium text-muted-foreground">Threshold</span>
                    <div className="relative flex-1">
                      <div className="absolute top-1/2 -translate-y-1/2 h-0.5 w-full rounded bg-red-300/40" />
                      <div
                        className="relative flex flex-col items-center"
                        style={{ width: `${threshPct * 100}%` }}
                      >
                        <div className="h-3 w-0.5 rounded-full bg-red-500" />
                        <span className="mt-0.5 text-[9px] font-bold text-red-500">
                          {pred.threshold}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason + metadata footer */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <p className="flex-1 text-[11px] leading-tight text-muted-foreground">
                  {pred.reason}
                </p>
                <span className="ml-3 shrink-0 text-[10px] font-medium text-muted-foreground">
                  {formatSinceWatered(pred.days_since_watered)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
