"use client";

import type { SystemHealth } from "@/lib/types";

interface Props {
  health: SystemHealth | null;
}

function Dot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ok: "bg-success",
    healthy: "bg-success",
    running: "bg-success",
    detected: "bg-success",
    error: "bg-destructive",
    degraded: "bg-warning",
    offline: "bg-destructive",
    unknown: "bg-muted-foreground",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colors[status] || "bg-muted-foreground"}`}
    />
  );
}

export default function SystemHealthCard({ health }: Props) {
  if (!health) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
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

  const formatAge = (sec: number | null) => {
    if (sec === null || sec === undefined) return "—";
    if (sec < 5) return "just now";
    if (sec < 60) return `${sec}s ago`;
    const m = Math.floor(sec / 60);
    return `${m}m ago`;
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">System Health</p>
        <span className={`text-xs font-medium ${overallColor}`}>
          <Dot status={health.status} /> {health.status}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {/* Arduino */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Arduino</span>
          <span className="flex items-center gap-1.5">
            <Dot status={health.arduino.connected ? "ok" : "error"} />
            {health.arduino.connected
              ? health.arduino.port?.split("/").pop()
              : "disconnected"}
          </span>
        </div>

        {/* Sensors */}
        {["temperature", "humidity", "moisture_z1", "moisture_z2", "moisture_z3"].map(
          (key) => {
            const s = health.sensors[key];
            if (!s) return null;
            const label =
              key === "moisture_z1"
                ? "Zone 1"
                : key === "moisture_z2"
                  ? "Zone 2"
                  : key === "moisture_z3"
                    ? "Zone 3"
                    : key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="flex items-center gap-1.5">
                  <Dot status={s.status} />
                  {s.status === "ok" && s.value != null
                    ? key === "temperature"
                      ? `${s.value.toFixed(1)}°C`
                      : key === "humidity"
                        ? `${s.value}%`
                        : `${s.value}%`
                    : "no data"}
                </span>
              </div>
            );
          },
        )}

        {/* Services */}
        <div className="border-t border-border pt-2">
          {["api", "logger", "dashboard"].map((svc) => (
            <div key={svc} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {svc === "api" ? "API" : svc === "logger" ? "Logger" : "Dashboard"}
              </span>
              <span className="flex items-center gap-1.5">
                <Dot status={health.services[svc]?.running ? "ok" : "error"} />
                {health.services[svc]?.running ? "running" : "stopped"}
              </span>
            </div>
          ))}
        </div>

        {/* Database */}
        <div className="border-t border-border pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Database</span>
            <span className="text-muted-foreground">
              {health.database.size_mb ?? "?"} MB · {health.database.total_readings} readings
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last reading</span>
            <span className="text-muted-foreground">
              {formatAge(health.database.last_write_seconds_ago)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
