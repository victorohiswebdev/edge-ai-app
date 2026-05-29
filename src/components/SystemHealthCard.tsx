"use client";

import type { SystemHealth } from "@/lib/types";

interface Props {
  health: SystemHealth | null;
}

// ─── Sub-components ──────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ok: "bg-success shadow-[0_0_6px_rgba(22,163,74,0.5)]",
    healthy: "bg-success shadow-[0_0_6px_rgba(22,163,74,0.5)]",
    running: "bg-success",
    detected: "bg-success",
    error: "bg-destructive",
    degraded: "bg-warning",
    offline: "bg-destructive",
    unknown: "bg-muted-foreground",
    "no data": "bg-muted-foreground/40",
  };
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[status] || "bg-muted-foreground"}`} />
  );
}

function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

function SectionCard({ title, status, children }: { title: string; status?: string; children: React.ReactNode }) {
  const borderColor = !status || status === "ok" || status === "healthy" || status === "running" || status === "detected"
    ? "border-green-500/20"
    : status === "degraded"
      ? "border-amber-500/20"
      : "border-destructive/20";

  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-card ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {status && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <StatusDot status={status} />
            {status}
          </span>
        )}
      </div>
      <div className="space-y-2.5">
        {children}
      </div>
    </div>
  );
}

function formatAge(sec: number | null) {
  if (sec === null || sec === undefined) return "—";
  if (sec < 5) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

// ─── Main ────────────────────────────────────────────────────

export default function SystemHealthCard({ health }: Props) {
  if (!health) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <p className="text-sm font-bold text-foreground">System Health</p>
        <p className="mt-2 text-xs text-muted-foreground">Unable to fetch health data</p>
      </div>
    );
  }

  const overallColor =
    health.status === "healthy"
      ? "text-success"
      : health.status === "degraded"
        ? "text-warning"
        : "text-destructive";

  const sensorKeys = [
    { key: "temperature", label: "Temperature" },
    { key: "humidity", label: "Humidity" },
    { key: "moisture_z1", label: "Zone 1 Moisture" },
    { key: "moisture_z2", label: "Zone 2 Moisture" },
    { key: "moisture_z3", label: "Zone 3 Moisture" },
  ];

  const formatSensorValue = (key: string, s: { status: string; value?: number | null }) => {
    if (s.status !== "ok" || s.value == null) return "no data";
    if (key === "temperature") return `${s.value.toFixed(1)}°C`;
    return `${s.value}%`;
  };

  return (
    <div className="space-y-5">
      {/* Overall status banner */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${overallColor}`}>
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${health.status === "healthy" ? "bg-success" : health.status === "degraded" ? "bg-warning" : "bg-destructive"} mr-2`} />
            {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            All subsystems reporting
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/60">
          {health.heartbeat?.logger_active ? "Logger active" : "Logger idle"}
        </span>
      </div>

      {/* 4-panel bento grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Arduino */}
        <SectionCard title="Arduino" status={health.arduino.connected ? "detected" : "offline"}>
          <StatRow label="Port">
            <>{health.arduino.port?.split("/").pop() ?? "—"}</>
          </StatRow>
          <StatRow label="Connection">
            <span className="flex items-center gap-1.5">
              <StatusDot status={health.arduino.connected ? "ok" : "error"} />
              {health.arduino.connected ? "Connected" : "Disconnected"}
            </span>
          </StatRow>
          <StatRow label="Last reading">
            {formatAge(health.arduino.last_reading_seconds_ago)}
          </StatRow>
        </SectionCard>

        {/* Sensors */}
        <SectionCard title="Sensors">
          {sensorKeys.map(({ key, label }) => {
            const s = health.sensors[key];
            if (!s) return null;
            return (
              <StatRow key={key} label={label}>
                <span className="flex items-center gap-1.5">
                  <StatusDot status={s.status} />
                  {formatSensorValue(key, s)}
                </span>
              </StatRow>
            );
          })}
        </SectionCard>

        {/* Services */}
        <SectionCard title="Services">
          {["api", "logger", "dashboard"].map((svc) => (
            <StatRow key={svc} label={svc === "api" ? "API" : svc === "logger" ? "Logger" : "Dashboard"}>
              <span className="flex items-center gap-1.5">
                <StatusDot status={health.services[svc]?.running ? "running" : "error"} />
                {health.services[svc]?.running ? "Running" : "Stopped"}
              </span>
            </StatRow>
          ))}
        </SectionCard>

        {/* Database */}
        <SectionCard title="Database">
          <StatRow label="Size">
            {health.database.size_mb != null ? `${health.database.size_mb.toFixed(1)} MB` : "—"}
          </StatRow>
          <StatRow label="Total readings">
            {health.database.total_readings.toLocaleString()}
          </StatRow>
          <StatRow label="Last write">
            {formatAge(health.database.last_write_seconds_ago)}
          </StatRow>
          <StatRow label="Status">
            <span className="flex items-center gap-1.5">
              <StatusDot status={health.heartbeat?.logger_active ? "ok" : "degraded"} />
              {health.heartbeat?.logger_active ? "Active" : "Idle"}
            </span>
          </StatRow>
        </SectionCard>
      </div>
    </div>
  );
}
