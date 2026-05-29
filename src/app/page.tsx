"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  LatestReading,
  SensorReading,
  DataSource,
  LiveReading,
  SensorSummary,
} from "@/lib/types";
import { getLatestReading, getHistory, getSummary, fetchLiveReading } from "@/lib/api";
import { DashboardHeader } from "@/components/dashboard/header";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { LiveLogCard } from "@/components/dashboard/live-log-card";
import { ZoneCard } from "@/components/dashboard/zone-card";
import { PlantHealthCard } from "@/components/dashboard/plant-health-card";
import { SkeletonCard } from "@/components/dashboard/skeleton-card";
import SensorChart from "@/components/SensorChart";

// ─── Accent profiles ──────────────────────────────────────────

const TEMP_ACCENT = {
  from: "from-green-500",
  to: "to-teal-400",
  tint: "from-green-500/5 to-teal-500/5",
};

const HUMIDITY_ACCENT = {
  from: "from-sky-500",
  to: "to-cyan-400",
  tint: "from-sky-500/5 to-cyan-500/5",
};

const PUMP_ACCENT = {
  from: "from-amber-500",
  to: "to-orange-400",
  tint: "from-amber-500/5 to-orange-500/5",
};

const ZONE_ACCENTS: Record<string, { from: string; to: string; dot: string; progress: string; tint: string; badge: string }> = {
  Control: {
    from: "from-green-500",
    to: "to-emerald-400",
    dot: "bg-green-500",
    progress: "bg-gradient-to-r from-green-500 to-emerald-400",
    tint: "from-green-500/5 to-emerald-500/5",
    badge: "bg-success/10 text-success",
  },
  Stress: {
    from: "from-amber-500",
    to: "to-orange-400",
    dot: "bg-amber-500",
    progress: "bg-gradient-to-r from-amber-500 to-orange-400",
    tint: "from-amber-500/5 to-orange-500/5",
    badge: "bg-warning/10 text-warning",
  },
  AI: {
    from: "from-blue-500",
    to: "to-indigo-400",
    dot: "bg-blue-500",
    progress: "bg-gradient-to-r from-blue-500 to-indigo-400",
    tint: "from-blue-500/5 to-indigo-500/5",
    badge: "bg-info/10 text-info",
  },
};

// ─── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [live, setLive] = useState<LiveReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [summary, setSummary] = useState<SensorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<DataSource>("synthetic");
  const [liveUpdated, setLiveUpdated] = useState<string>("—");

  const refresh = useCallback(async () => {
    const [l, liv, h, s] = await Promise.all([
      getLatestReading(),
      fetchLiveReading(),
      getHistory(24, 200),
      getSummary(24),
    ]);
    setLatest(l.data);
    if (liv) {
      setLive(liv);
      setLiveUpdated(new Date().toLocaleTimeString());
    }
    setHistory(h.data);
    setSummary(s.data);
    setDataSource(l.source);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <DashboardHeader dataSource={dataSource} />
        <main className="flex-1 space-y-6 overflow-y-auto p-8">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Live Sensors
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader dataSource={dataSource} />

      <main className="flex-1 space-y-8 overflow-y-auto p-8">
        {/* Live Sensors */}
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
              subtitle="BME280"
              accent={{ from: TEMP_ACCENT.from, to: TEMP_ACCENT.to }}
              tint={TEMP_ACCENT.tint}
            />
            <SensorCard
              label="Humidity"
              value={
                latest?.humidity_perc != null
                  ? `${Math.round(latest.humidity_perc)}%`
                  : "N/A"
              }
              subtitle="BME280"
              accent={{ from: HUMIDITY_ACCENT.from, to: HUMIDITY_ACCENT.to }}
              tint={HUMIDITY_ACCENT.tint}
            />
            <SensorCard
              label="Pump Status"
              value="Idle"
              subtitle="All zones off"
              accent={{ from: PUMP_ACCENT.from, to: PUMP_ACCENT.to }}
              tint={PUMP_ACCENT.tint}
            />
            <LiveLogCard live={live} updatedAt={liveUpdated} />
          </div>
        </section>

        {/* Zone Moisture */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Zone Moisture
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ZoneCard
              name="Zone 1 — Control"
              mode="Control"
              moisture={live?.moisture_zone_1 ?? latest?.moisture_zone_1 ?? null}
              accent={ZONE_ACCENTS.Control}
            />
            <ZoneCard
              name="Zone 2 — Stress"
              mode="Stress"
              moisture={live?.moisture_zone_2 ?? latest?.moisture_zone_2 ?? null}
              accent={ZONE_ACCENTS.Stress}
            />
            <ZoneCard
              name="Zone 3 — AI-Managed"
              mode="AI"
              moisture={live?.moisture_zone_3 ?? latest?.moisture_zone_3 ?? null}
              accent={ZONE_ACCENTS.AI}
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

        {/* Plant Health */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Plant Health
          </h2>
          <div className="mt-3">
            <PlantHealthCard />
          </div>
        </section>
      </main>
    </div>
  );
}
