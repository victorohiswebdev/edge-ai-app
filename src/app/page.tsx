"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  LatestReading,
  SensorReading,
  DataSource,
  LiveReading,
  SensorSummary,
  SystemHealth,
  PumpStatus,
  IrrigationResponse,
  IntegratedDecisionResponse,
} from "@/lib/types";
import { getLatestReading, getHistory, getSummary, fetchLiveReading, fetchSystemHealth, fetchPumpStatus, fetchIrrigationPrediction, fetchIntegratedDecision } from "@/lib/api";
import { HeroHeader } from "@/components/dashboard/hero-header";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { LiveLogPanel } from "@/components/dashboard/live-log-panel";
import { ZoneCard } from "@/components/dashboard/zone-card";
import { PlantHealthCard } from "@/components/dashboard/plant-health-card";
import { SkeletonCard } from "@/components/dashboard/skeleton-card";
import SensorChart from "@/components/SensorChart";
import SystemHealthCard from "@/components/SystemHealthCard";
import PumpControl from "@/components/PumpControl";
import IrrigationPredictionCard from "@/components/IrrigationPredictionCard";
import IntegratedDecisionCard from "@/components/IntegratedDecisionCard";

// ─── Accent profiles ──────────────────────────────────────────

const TEMP_ACCENT = { from: "from-green-500", to: "to-teal-400", tint: "from-green-500/5 to-teal-500/5" };
const HUMIDITY_ACCENT = { from: "from-sky-500", to: "to-cyan-400", tint: "from-sky-500/5 to-cyan-500/5" };
const PUMP_ACCENT = { from: "from-amber-500", to: "to-orange-400", tint: "from-amber-500/5 to-orange-500/5" };

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

// ─── Hover info content ───────────────────────────────────────

const INFO = {
  temp: "Ambient air temperature measured by the BME280 sensor at canopy height. Used to calculate evapotranspiration rates and VPD for precision irrigation scheduling.",
  humidity: "Relative humidity reading from the BME280 sensor. Combined with temperature to compute vapour pressure deficit — a key input to the predictive irrigation model.",
  vpd: "Vapour Pressure Deficit calculated from temperature & humidity. High VPD (>2.0 kPa) indicates plants are transpiring rapidly and may need irrigation.",
  z1: "Control zone — baseline irrigation without AI intervention. Watered on a fixed schedule to serve as experimental control for comparing water usage and plant health.",
  z2: "Stress zone — deliberately reduced irrigation to observe plant physiological response under water-limited conditions. Tests the system's drought detection capability.",
  z3: "AI-Managed zone — the Random Forest model predicts optimal irrigation timing and duration based on real-time sensor data, ambient conditions, and historical patterns.",
};

// ─── Helpers ──────────────────────────────────────────────────

function calcVPD(temp: number | null | undefined, hum: number | null | undefined): string {
  if (temp == null || hum == null) return "N/A";
  const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  return `${((1 - hum / 100) * es).toFixed(1)} kPa`;
}

// ─── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [live, setLive] = useState<LiveReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [summary, setSummary] = useState<SensorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<DataSource>("synthetic");
  const [liveUpdated, setLiveUpdated] = useState<string>("—");
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [pumpStatus, setPumpStatus] = useState<PumpStatus | null>(null);
  const [irrigation, setIrrigation] = useState<IrrigationResponse | null>(null);
  const [integrated, setIntegrated] = useState<IntegratedDecisionResponse | null>(null);

  const refresh = useCallback(async () => {
    const [l, liv, h, s, he, ps, irr, idec] = await Promise.all([
      getLatestReading(),
      fetchLiveReading(),
      getHistory(24, 200),
      getSummary(24),
      fetchSystemHealth(),
      fetchPumpStatus(),
      fetchIrrigationPrediction(),
      fetchIntegratedDecision(),
    ]);
    setLatest(l.data);
    if (liv) {
      setLive(liv);
      setLiveUpdated(new Date().toLocaleTimeString());
    }
    setHistory(h.data);
    setSummary(s.data);
    setDataSource(l.source);
    if (he) setHealth(he);
    if (ps) setPumpStatus(ps);
    if (irr) setIrrigation(irr);
    if (idec) setIntegrated(idec);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const quick = setInterval(refresh, 10000);
    const slow = setInterval(() => {
      getHistory(24, 200).then(h => setHistory(h.data));
      getSummary(24).then(s => setSummary(s.data));
      fetchSystemHealth().then(h => setHealth(h));
    }, 120000);
    return () => { clearInterval(quick); clearInterval(slow); };
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-56 animate-pulse bg-green-700" />
        <main className="flex-1 space-y-8 p-8">
          <div>
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeroHeader dataSource={dataSource} />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-10 md:px-8 md:py-12 lg:space-y-14 lg:py-16">
        {/* Environmental Sensors */}
        <section style={{ contentVisibility: "auto" }}>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Environmental Sensors
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time readings from the BME280 environmental sensor
          </p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Pump Control — moved to own section */}
        <section style={{ contentVisibility: "auto" }}>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Pump Control
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manual control for the three irrigation zones. Commands are queued and executed by the Arduino.
          </p>
          <div className="mt-5">
            <PumpControl pumpStatus={pumpStatus} />
          </div>
        </section>

        {/* Irrigation Zones */}
        <section style={{ contentVisibility: "auto" }}>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Irrigation Zones
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Soil moisture levels across the three experimental zones — Control, Stress, and AI-Managed
          </p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
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

        {/* AI Irrigation Prediction */}
        <section style={{ contentVisibility: "auto" }}>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
            AI Irrigation Decision
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Combined RF + CNN decision. Random Forest predicts natural moisture trajectory
            15 min ahead. CNN overrides irrigation when plant stress or wilt is detected.
          </p>
          <div className="mt-5">
            <IntegratedDecisionCard decisions={integrated?.integrated_decisions ?? null} />
          </div>
        </section>

        {/* Serial Monitor */}
        <section style={{ contentVisibility: "auto" }}>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Serial Monitor
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live data stream from the Arduino Uno via USB serial (9600 baud)
          </p>
          <div className="mt-5">
            <LiveLogPanel live={live} updatedAt={liveUpdated} />
          </div>
        </section>

        {/* 24-Hour History */}
        <section style={{ contentVisibility: "auto" }}>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
            24-Hour History
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Historical sensor readings with downsampled display for trend analysis
          </p>
          <div className="mt-5">
            <SensorChart data={history} />
          </div>
        </section>

        {/* System Health — expanded to full width */}
        <section style={{ contentVisibility: "auto" }}>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
            System Health
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time status of all hardware and software subsystems
          </p>
          <div className="mt-5">
            <SystemHealthCard health={health} />
          </div>
        </section>

        {/* Plant Health */}
        <section style={{ contentVisibility: "auto" }}>
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Plant Health
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            CNN-based crop disease detection and growth stage classification
          </p>
          <div className="mt-5">
            <PlantHealthCard />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <p className="text-center text-xs text-muted-foreground">
          Edge AI Framework — FYP 2026 · Afe Babalola University, Ado-Ekiti
        </p>
      </footer>
    </div>
  );
}
