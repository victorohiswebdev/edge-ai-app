"use client";

import { useEffect, useState, useCallback } from "react";
import type { LatestReading, LiveReading, DataSource, SystemHealth } from "@/lib/types";
import { getLatestReading, fetchLiveReading, fetchSystemHealth } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { ZoneCard } from "@/components/dashboard/zone-card";
import { SkeletonCard } from "@/components/dashboard/skeleton-card";

// ─── Accent profiles ──────────────────────────────────────────

const TEMP_ACCENT = { from: "from-green-500", to: "to-teal-400", tint: "from-green-500/5 to-teal-500/5" };
const HUMIDITY_ACCENT = { from: "from-sky-500", to: "to-cyan-400", tint: "from-sky-500/5 to-cyan-500/5" };

const ZONE_ACCENTS: Record<string, { from: string; to: string; dot: string; progress: string; tint: string; badge: string }> = {
  Control: {
    from: "from-green-500", to: "to-emerald-400",
    dot: "bg-green-500", progress: "bg-gradient-to-r from-green-500 to-emerald-400",
    tint: "from-green-500/5 to-emerald-500/5", badge: "bg-success/10 text-success",
  },
  Stress: {
    from: "from-amber-500", to: "to-orange-400",
    dot: "bg-amber-500", progress: "bg-gradient-to-r from-amber-500 to-orange-400",
    tint: "from-amber-500/5 to-orange-500/5", badge: "bg-warning/10 text-warning",
  },
  AI: {
    from: "from-blue-500", to: "to-indigo-400",
    dot: "bg-blue-500", progress: "bg-gradient-to-r from-blue-500 to-indigo-400",
    tint: "from-blue-500/5 to-indigo-500/5", badge: "bg-info/10 text-info",
  },
};

const INFO = {
  temp: "Ambient air temperature measured by the BME280 sensor at canopy height.",
  humidity: "Relative humidity from BME280. Combined with temperature for VPD calculation.",
  vpd: "Vapour Pressure Deficit — high VPD (>2 kPa) indicates rapid transpiration.",
  z1: "Control zone — fixed threshold irrigation. Serves as experimental baseline.",
  z2: "Stress zone — deliberately reduced irrigation for drought response testing.",
  z3: "AI-Managed zone — Random Forest model predicts optimal irrigation timing.",
};

function calcVPD(temp: number | null | undefined, hum: number | null | undefined): string {
  if (temp == null || hum == null) return "N/A";
  const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  return `${((1 - hum / 100) * es).toFixed(1)} kPa`;
}

export default function OverviewPage() {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [live, setLive] = useState<LiveReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<DataSource>("synthetic");
  const [health, setHealth] = useState<SystemHealth | null>(null);

  const refresh = useCallback(async () => {
    const [l, liv, he] = await Promise.all([
      getLatestReading(),
      fetchLiveReading(),
      fetchSystemHealth(),
    ]);
    if (l) { setLatest(l.data); setDataSource(l.source); }
    if (liv) setLive(liv);
    if (he) setHealth(he);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Status badge
  const statusColor = dataSource === "live"
    ? "bg-green-100 text-green-800 ring-green-300 dark:bg-green-900 dark:text-green-200"
    : dataSource === "database"
    ? "bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-900 dark:text-amber-200"
    : "bg-slate-100 text-slate-600 ring-slate-300 dark:bg-slate-900 dark:text-slate-400";

  const statusLabel = dataSource === "live" ? "● Live" : dataSource === "database" ? "◉ Stored" : "○ Simulated";

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-8 p-6 md:p-10">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8 p-6 md:p-10">
        {/* Page Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Smart Farming Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Edge AI Framework — Real-time sensor monitoring
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusColor}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dataSource === "live" ? "animate-pulse bg-green-500" : "bg-current"}`} />
            {statusLabel}
          </span>
        </header>

        {/* Environmental Sensors */}
        <section>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            Environment
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">BME280 sensor readings</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SensorCard
              label="Temperature"
              value={latest?.temperature_c != null ? `${latest.temperature_c.toFixed(1)}°C` : "N/A"}
              subtitle="BME280 · Ambient air"
              accent={{ from: TEMP_ACCENT.from, to: TEMP_ACCENT.to }}
              tint={TEMP_ACCENT.tint}
              info={INFO.temp}
            />
            <SensorCard
              label="Humidity"
              value={latest?.humidity_perc != null ? `${Math.round(latest.humidity_perc)}%` : "N/A"}
              subtitle="BME280 · Relative"
              accent={{ from: HUMIDITY_ACCENT.from, to: HUMIDITY_ACCENT.to }}
              tint={HUMIDITY_ACCENT.tint}
              info={INFO.humidity}
            />
            <SensorCard
              label="Vapour Pressure"
              value={calcVPD(latest?.temperature_c, latest?.humidity_perc)}
              subtitle="VPD · Calculated"
              accent={{ from: "from-teal-500", to: "to-emerald-400" }}
              tint="from-teal-500/5 to-emerald-500/5"
              info={INFO.vpd}
            />
          </div>
        </section>

        {/* Irrigation Zones */}
        <section>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            Irrigation Zones
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Soil moisture across the three experimental zones
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ZoneCard
              name="Zone 1 — Control"
              mode="Control"
              moisture={live?.moisture_zone_1 ?? latest?.moisture_zone_1 ?? null}
              accent={ZONE_ACCENTS.Control}
              info={INFO.z1}
            />
            <ZoneCard
              name="Zone 2 — Stress"
              mode="Stress"
              moisture={live?.moisture_zone_2 ?? latest?.moisture_zone_2 ?? null}
              accent={ZONE_ACCENTS.Stress}
              info={INFO.z2}
            />
            <ZoneCard
              name="Zone 3 — AI-Managed"
              mode="AI"
              moisture={live?.moisture_zone_3 ?? latest?.moisture_zone_3 ?? null}
              accent={ZONE_ACCENTS.AI}
              info={INFO.z3}
            />
          </div>
        </section>

        {/* System Status */}
        <section>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            System Status
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Quick health overview</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Arduino", ok: health?.arduino?.connected },
              { label: "Logger", ok: health?.heartbeat?.logger_active },
              { label: "API", ok: health?.services?.api?.running },
              { label: "Dashboard", ok: health?.services?.dashboard?.running },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-card p-4 text-center"
              >
                <div className={`mx-auto mb-2 h-2.5 w-2.5 rounded-full ${s.ok ? "bg-green-500" : "bg-red-400"}`} />
                <p className="text-xs font-medium text-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {s.ok ? "Online" : "Offline"}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6">
          <p className="text-center text-[11px] text-muted-foreground">
            Edge AI Framework — FYP 2026 · Afe Babalola University, Ado-Ekiti
          </p>
        </footer>
      </div>
    </DashboardShell>
  );
}
