"use client";

import { useState, useEffect, useCallback } from "react";
import type { PumpStatus } from "@/lib/types";
import { sendPumpCommand, fetchPumpStatus, emergencyStop } from "@/lib/api";

interface Props {
  pumpStatus: PumpStatus | null;
}

const ZONES = [
  { num: 1, label: "Zone 1 — Control", mode: "Control" },
  { num: 2, label: "Zone 2 — Stress", mode: "Stress" },
  { num: 3, label: "Zone 3 — AI-Managed", mode: "AI" },
] as const;

const COLORS = {
  Control: {
    dot: "bg-green-500",
    border: "border-green-500/20",
    bg: "bg-green-500/5",
    toggleOn: "bg-green-600 hover:bg-green-700 text-white",
    toggleOff: "bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground",
    badgeOn: "bg-green-500/15 text-green-600",
    accent: "from-green-500 to-emerald-400",
  },
  Stress: {
    dot: "bg-amber-500",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    toggleOn: "bg-amber-600 hover:bg-amber-700 text-white",
    toggleOff: "bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground",
    badgeOn: "bg-amber-500/15 text-amber-600",
    accent: "from-amber-500 to-orange-400",
  },
  AI: {
    dot: "bg-blue-500",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    toggleOn: "bg-blue-600 hover:bg-blue-700 text-white",
    toggleOff: "bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground",
    badgeOn: "bg-blue-500/15 text-blue-600",
    accent: "from-blue-500 to-indigo-400",
  },
};

export default function PumpControl({ pumpStatus }: Props) {
  const [sending, setSending] = useState<Record<number, boolean>>({});
  const [confirmStop, setConfirmStop] = useState(false);
  const [localStatus, setLocalStatus] = useState<PumpStatus | null>(pumpStatus);

  useEffect(() => {
    if (pumpStatus) setLocalStatus(pumpStatus);
  }, [pumpStatus]);

  // Poll pump status when any pump is ON
  useEffect(() => {
    if (!localStatus) return;
    const anyOn =
      localStatus.pump_1 === "ON" ||
      localStatus.pump_2 === "ON" ||
      localStatus.pump_3 === "ON";
    if (!anyOn) return;

    const interval = setInterval(async () => {
      const s = await fetchPumpStatus();
      if (s) setLocalStatus(s);
    }, 3000);

    return () => clearInterval(interval);
  }, [localStatus?.pump_1, localStatus?.pump_2, localStatus?.pump_3]);

  const handleCommand = useCallback(
    async (zone: number, command: "ON" | "OFF") => {
      setSending((prev) => ({ ...prev, [zone]: true }));
      const result = await sendPumpCommand(zone, command);
      if (result?.status === "queued" || result?.status === "duplicate") {
        setLocalStatus((prev) => {
          if (!prev) return prev;
          const key = `pump_${zone}` as keyof PumpStatus;
          return { ...prev, [key]: command };
        });
      }
      setSending((prev) => ({ ...prev, [zone]: false }));
    },
    []
  );

  const handleEmergencyStop = useCallback(async () => {
    setConfirmStop(false);
    await emergencyStop();
    setLocalStatus({
      pump_1: "OFF", pump_2: "OFF", pump_3: "OFF",
      updated_at: new Date().toISOString(),
    });
  }, []);

  const getPumpState = (zone: number): "ON" | "OFF" => {
    if (!localStatus) return "OFF";
    const key = `pump_${zone}` as keyof PumpStatus;
    return localStatus[key] === "ON" ? "ON" : "OFF";
  };

  const anyOn = localStatus && (
    localStatus.pump_1 === "ON" ||
    localStatus.pump_2 === "ON" ||
    localStatus.pump_3 === "ON"
  );

  return (
    <div className="space-y-5">
      {/* 3-zone grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {ZONES.map((zone) => {
          const state = getPumpState(zone.num);
          const isOn = state === "ON";
          const c = COLORS[zone.mode as keyof typeof COLORS];
          const disabled = sending[zone.num];

          return (
            <div
              key={zone.num}
              className={`group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated ${
                isOn ? c.border : "border-border"
              }`}
            >
              {/* Accent bar */}
              <div className={`absolute left-4 right-4 top-0 h-0.5 rounded-full bg-gradient-to-r ${c.accent} opacity-60`} />

              {/* Top row: label + status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${isOn ? c.dot : "bg-muted-foreground/30"} ${isOn ? "shadow-[0_0_6px]" : ""}`}
                    style={isOn ? { boxShadow: `0 0 6px var(--tw-shadow-color)`, color: undefined } as React.CSSProperties : {}}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {zone.label}
                  </span>
                </div>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                    isOn ? c.badgeOn : "bg-muted-foreground/10 text-muted-foreground"
                  }`}
                >
                  {isOn ? "Active" : "Standby"}
                </span>
              </div>

              {/* Value display */}
              <p className="mt-3 font-heading text-3xl font-black tracking-tight text-card-foreground">
                {isOn ? "ON" : "OFF"}
              </p>

              {/* Toggle buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleCommand(zone.num, "ON")}
                  disabled={disabled || isOn}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
                    isOn ? c.toggleOn : c.toggleOn + " opacity-60 hover:opacity-100"
                  }`}
                >
                  {disabled ? "..." : "Turn ON"}
                </button>
                <button
                  onClick={() => handleCommand(zone.num, "OFF")}
                  disabled={disabled || !isOn}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
                    !isOn ? c.toggleOff : c.toggleOff + " opacity-80 hover:opacity-100"
                  }`}
                >
                  {disabled ? "..." : "Turn OFF"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Stop + Status bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${anyOn ? "bg-success shadow-[0_0_6px_rgba(22,163,74,0.5)]" : "bg-muted-foreground/40"}`} />
            {anyOn ? "Pumps active" : "All pumps off"}
          </span>
          {localStatus?.updated_at && (
            <span className="text-[10px] text-muted-foreground/60">
              Last update: {new Date(localStatus.updated_at).toLocaleTimeString()}
            </span>
          )}
        </div>

        {confirmStop ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-destructive">Stop all pumps?</span>
            <button
              onClick={handleEmergencyStop}
              className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-destructive/90"
            >
              Yes, STOP
            </button>
            <button
              onClick={() => setConfirmStop(false)}
              className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmStop(true)}
            className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10"
          >
            <span>⚠</span>
            Emergency All-Off
          </button>
        )}
      </div>
    </div>
  );
}
