"use client";

import { useEffect, useState, useCallback } from "react";
import type { SystemHealth } from "@/lib/types";
import { fetchSystemHealth } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import SystemHealthCard from "@/components/SystemHealthCard";
import { LiveLogPanel } from "@/components/dashboard/live-log-panel";
import { fetchLiveReading } from "@/lib/api";
import type { LiveReading } from "@/lib/types";

export default function SystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [live, setLive] = useState<LiveReading | null>(null);
  const [liveUpdated, setLiveUpdated] = useState<string>("—");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [he, liv] = await Promise.all([
      fetchSystemHealth(),
      fetchLiveReading(),
    ]);
    if (he) setHealth(he);
    if (liv) {
      setLive(liv);
      setLiveUpdated(new Date().toLocaleTimeString());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <DashboardShell>
      <div className="space-y-8 p-6 md:p-10">
        {/* Page Header */}
        <header>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            System Health
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time status of all hardware and software subsystems
          </p>
        </header>

        {/* System Health Grid */}
        <section>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            Health Monitor
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Arduino connection, sensor data, services, and database status
          </p>
          <div className="mt-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-48 rounded-2xl bg-muted" />
              </div>
            ) : (
              <SystemHealthCard health={health} />
            )}
          </div>
        </section>

        {/* Serial Monitor */}
        <section>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            Serial Monitor
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Live data stream from Arduino Uno via USB serial (9600 baud)
          </p>
          <div className="mt-4">
            <LiveLogPanel live={live} updatedAt={liveUpdated} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
