"use client";

import type { IntegratedDecision } from "@/lib/types";

interface Props {
  decisions: IntegratedDecision[] | null;
}

const ZONE_LABELS: Record<number, string> = {
  1: "Zone 1 — Control",
  2: "Zone 2 — Stress",
  3: "Zone 3 — AI-Managed",
};

const MODE_STYLES: Record<string, string> = {
  Control: "bg-success/10 text-success border border-success/20",
  Stress: "bg-warning/10 text-warning border border-warning/20",
  AI: "bg-info/10 text-info border border-info/20",
};

function formatSince(days: number): string {
  if (days < 0.04) return "Just watered";
  if (days < 1) return `${Math.round(days * 24)}h ago`;
  return `${days.toFixed(1)}d ago`;
}

export default function IntegratedDecisionCard({ decisions }: Props) {
  if (!decisions || decisions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <p className="text-sm text-muted-foreground">
          No integrated decision data available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {decisions.map((d) => {
        const mode = d.zone === 1 ? "Control" : d.zone === 2 ? "Stress" : "AI";
        const modeStyle = MODE_STYLES[mode];

        // Determine status color from final action
        const actionColor =
          d.final_action === "irrigate"
            ? { bar: "from-amber-500 to-orange-500", badge: "bg-amber-100 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-900 dark:text-amber-200", dot: "bg-amber-500 animate-pulse" }
            : d.final_action === "manual_check"
            ? { bar: "from-red-500 to-rose-500", badge: "bg-red-100 text-red-800 ring-1 ring-red-300 dark:bg-red-900 dark:text-red-200", dot: "bg-red-500 animate-pulse" }
            : { bar: "from-green-500 to-emerald-400", badge: "bg-green-100 text-green-800 ring-1 ring-green-300 dark:bg-green-900 dark:text-green-200", dot: "bg-green-500" };

        const actionLabel =
          d.final_action === "irrigate" ? "IRRIGATE"
          : d.final_action === "manual_check" ? "CHECK"
          : "OK";

        const cnnLabel = d.plant_health.available
          ? d.plant_health.classification
          : "—";

        const cnnColor = !d.plant_health.available
          ? "text-muted-foreground"
          : d.plant_health.classification === "healthy"
          ? "text-green-600"
          : d.plant_health.classification === "stressed"
          ? "text-amber-600"
          : "text-red-600";

        return (
          <div
            key={d.zone}
            className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated"
          >
            {/* Accent bar */}
            <div
              className={`absolute left-4 right-4 top-0 h-0.5 rounded-full bg-gradient-to-r ${actionColor.bar} opacity-80 transition-all duration-300 group-hover:left-3 group-hover:right-3`}
            />

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {ZONE_LABELS[d.zone]}
                  </p>
                  <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${modeStyle}`}>
                    {mode}
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${actionColor.badge}`}>
                  <span className={`h-2 w-2 rounded-full ${actionColor.dot}`} />
                  {actionLabel}
                </div>
              </div>

              {/* RF Prediction + CNN side by side */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    RF Model
                  </p>
                  <p className="mt-1 font-heading text-lg font-black text-card-foreground">
                    {d.predicted_moisture.toFixed(0)}%
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {d.rf_decision.should_irrigate ? "Needs water" : "Stable"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    CNN Plant Health
                  </p>
                  <p className={`mt-1 font-heading text-lg font-black capitalize ${cnnColor}`}>
                    {cnnLabel}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {d.plant_health.available
                      ? `${((d.plant_health.confidence ?? 0) * 100).toFixed(0)}% confidence`
                      : "Not available"}
                  </p>
                </div>
              </div>

              {/* Moisture gauge bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                  <span>Current: {d.current_moisture.toFixed(0)}%</span>
                  <span>Threshold: {d.threshold}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                    style={{ width: `${Math.min(d.current_moisture, 100)}%` }}
                  />
                </div>
              </div>

              {/* Override indicator */}
              {d.override_applied && (
                <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-center dark:bg-red-950/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    ⚡ CNN Override Active
                  </p>
                </div>
              )}

              {/* Final reason footer */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <p className="flex-1 text-[11px] leading-tight text-muted-foreground">
                  {d.final_reason}
                </p>
                <span className="ml-3 shrink-0 text-[10px] font-medium text-muted-foreground">
                  {formatSince(d.days_since_watered)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
