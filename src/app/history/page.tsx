"use client";

import { useEffect, useState, useCallback } from "react";
import type { SensorReading } from "@/lib/types";
import { getHistory } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import SensorChart from "@/components/SensorChart";

export default function HistoryPage() {
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const result = await getHistory(24, 200);
    setHistory(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 120000); // 2 min — chart data is heavy
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <DashboardShell>
      <div className="space-y-8 p-6 md:p-10">
        {/* Page Header */}
        <header>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Sensor History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            24-hour trend analysis for moisture, temperature, and humidity
          </p>
          {history.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {history.length} readings ·{" "}
              {new Date(history[0]?.timestamp ?? "").toLocaleDateString()} —{" "}
              {new Date(history[history.length - 1]?.timestamp ?? "").toLocaleDateString()}
            </p>
          )}
        </header>

        {/* Chart */}
        <section>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            24-Hour History
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Downsampled display for trend analysis — auto-refreshes every 2 minutes
          </p>
          <div className="mt-4">
            {loading ? (
              <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  Loading chart data...
                </div>
              </div>
            ) : (
              <SensorChart data={history} />
            )}
          </div>
        </section>

        {/* Stats summary */}
        {history.length > 0 && (
          <section>
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
              Quick Stats
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Averages over the 24-hour window
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {(() => {
                const valid = history.filter((r) => r.moisture_zone_1 != null);
                const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
                const m1 = valid.map((r) => r.moisture_zone_1!);
                const m2 = valid.map((r) => r.moisture_zone_2!);
                const m3 = valid.map((r) => r.moisture_zone_3!);
                const t = valid.filter((r) => r.temperature_c != null).map((r) => r.temperature_c!);
                const h = valid.filter((r) => r.humidity_perc != null).map((r) => r.humidity_perc!);

                const stats = [
                  { label: "Zone 1 Avg", value: `${avg(m1).toFixed(0)}%`, color: "text-green-600" },
                  { label: "Zone 2 Avg", value: `${avg(m2).toFixed(0)}%`, color: "text-amber-600" },
                  { label: "Zone 3 Avg", value: `${avg(m3).toFixed(0)}%`, color: "text-blue-600" },
                  { label: "Temp Avg", value: t.length ? `${avg(t).toFixed(1)}°C` : "N/A", color: "text-red-500" },
                  { label: "Humidity Avg", value: h.length ? `${avg(h).toFixed(0)}%` : "N/A", color: "text-sky-600" },
                ];
                return stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ));
              })()}
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
