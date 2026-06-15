"use client";

import { useEffect, useState, useCallback } from "react";
import type { IrrigationResponse, IntegratedDecisionResponse } from "@/lib/types";
import { fetchIrrigationPrediction, fetchIntegratedDecision } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import IntegratedDecisionCard from "@/components/IntegratedDecisionCard";
import PumpControl from "@/components/PumpControl";
import { fetchPumpStatus } from "@/lib/api";
import type { PumpStatus } from "@/lib/types";

export default function IrrigationPage() {
  const [irrigation, setIrrigation] = useState<IrrigationResponse | null>(null);
  const [integrated, setIntegrated] = useState<IntegratedDecisionResponse | null>(null);
  const [pumpStatus, setPumpStatus] = useState<PumpStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [irr, idec, ps] = await Promise.all([
      fetchIrrigationPrediction(),
      fetchIntegratedDecision(),
      fetchPumpStatus(),
    ]);
    if (irr) setIrrigation(irr);
    if (idec) setIntegrated(idec);
    if (ps) setPumpStatus(ps);
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
            AI Irrigation System
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            RF prediction + CNN override — autonomous zone management
          </p>
          {irrigation?.environment && (
            <div className="mt-3 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                🌡 {irrigation.environment.temperature_c}°C
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                💧 {irrigation.environment.humidity_pct}%
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                VPD {irrigation.environment.vpd_kpa} kPa
              </span>
            </div>
          )}
        </header>

        {/* Integrated Decision */}
        <section>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            Integrated Decision
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            RF moisture prediction combined with CNN plant health for final irrigation action
          </p>
          <div className="mt-4">
            {loading ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">Loading predictions...</p>
              </div>
            ) : (
              <IntegratedDecisionCard decisions={integrated?.integrated_decisions ?? null} />
            )}
          </div>
        </section>

        {/* Pump Control */}
        <section>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            Pump Control
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Manual override for irrigation zones — commands queued and executed by Arduino
          </p>
          <div className="mt-4">
            <PumpControl pumpStatus={pumpStatus} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
