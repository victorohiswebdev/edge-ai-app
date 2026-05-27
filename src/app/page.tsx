"use client";

import { useEffect, useState, useCallback } from "react";
import type { LatestReading, SensorReading } from "@/lib/types";
import { getLatestReading, getHistory, getSummary } from "@/lib/api";
import SensorChart from "@/components/SensorChart";
import type { SensorSummary } from "@/lib/types";

export default function DashboardPage() {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [summary, setSummary] = useState<SensorSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [l, h, s] = await Promise.all([
      getLatestReading(),
      getHistory(24, 200),
      getSummary(24),
    ]);
    setLatest(l);
    setHistory(h);
    setSummary(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // Poll every 10 seconds when backend is available
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-1 space-y-6 overflow-y-auto p-8">
        {/* Live sensor cards */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Live Sensors
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SensorCard
              label="Temperature"
              value={
                latest?.temperature_c != null
                  ? `${latest.temperature_c.toFixed(1)}°C`
                  : "N/A"
              }
              subtitle="Ambient (BME280)"
            />
            <SensorCard
              label="Humidity"
              value={
                latest?.humidity_perc != null
                  ? `${Math.round(latest.humidity_perc)}%`
                  : "N/A"
              }
              subtitle="Ambient (BME280)"
            />
            <SensorCard
              label="Pressure"
              value="1013 hPa"
              subtitle="Atmospheric"
            />
            <SensorCard
              label="Pump Status"
              value="Idle"
              subtitle="All zones off"
            />
          </div>
        </section>

        {/* Zone moisture cards */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Zone Moisture
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ZoneCard
              name="Zone 1 — Control"
              mode="Control"
              moisture={latest?.moisture_zone_1 ?? null}
            />
            <ZoneCard
              name="Zone 2 — Stress"
              mode="Stress"
              moisture={latest?.moisture_zone_2 ?? null}
            />
            <ZoneCard
              name="Zone 3 — AI-Managed"
              mode="AI"
              moisture={latest?.moisture_zone_3 ?? null}
            />
          </div>
        </section>

        {/* 24-hour chart */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            24-Hour History
          </h2>
          <div className="mt-3">
            <SensorChart data={history} />
          </div>
        </section>

        {/* Plant health placeholder */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Plant Health
          </h2>
          <div className="mt-3 flex h-48 items-center justify-center rounded-2xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              CNN inference panel — coming soon
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-8 py-4">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Smart Farming Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Edge AI Framework — Predictive Water Management & Plant Health
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success" />
          System Online
        </span>
      </div>
    </header>
  );
}

function SensorCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold tracking-tight text-card-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  Control: "bg-accent/10 text-accent",
  Stress: "bg-muted text-muted-foreground",
  AI: "bg-primary/10 text-primary",
};

function ZoneCard({
  name,
  mode,
  moisture,
}: {
  name: string;
  mode: string;
  moisture: number | null;
}) {
  const pct = moisture ?? 0;
  const display = moisture != null ? `${pct}%` : "N/A";
  const barWidth = moisture != null ? `${pct}%` : "0%";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{name}</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[mode] || "bg-muted text-muted-foreground"}`}
        >
          {mode}
        </span>
      </div>
      <p className="mt-2 font-heading text-3xl font-bold tracking-tight text-card-foreground">
        {display}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-5">
      <div className="h-3 w-20 rounded bg-muted" />
      <div className="mt-3 h-8 w-28 rounded bg-muted" />
      <div className="mt-3 h-3 w-24 rounded bg-muted" />
    </div>
  );
}
