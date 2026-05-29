"use client";

import { useState, useEffect, useCallback } from "react";
import type { PumpStatus } from "@/lib/types";
import {
  sendPumpCommand,
  fetchPumpStatus,
  emergencyStop,
} from "@/lib/api";

interface Props {
  pumpStatus: PumpStatus | null;
}

const ZONES = [
  { num: 1, label: "Zone 1 — Control", color: "green" },
  { num: 2, label: "Zone 2 — Stress", color: "amber" },
  { num: 3, label: "Zone 3 — AI-Managed", color: "blue" },
] as const;

const COLOR_MAP = {
  green: {
    dot: "bg-green-500",
    on: "bg-green-500/15 text-green-600",
    off: "bg-muted-foreground/10 text-muted-foreground",
    border: "border-green-500/20",
    btnOn: "bg-green-600 hover:bg-green-700",
    btnOff: "bg-muted-foreground/20 hover:bg-muted-foreground/30",
  },
  amber: {
    dot: "bg-amber-500",
    on: "bg-amber-500/15 text-amber-600",
    off: "bg-muted-foreground/10 text-muted-foreground",
    border: "border-amber-500/20",
    btnOn: "bg-amber-600 hover:bg-amber-700",
    btnOff: "bg-muted-foreground/20 hover:bg-muted-foreground/30",
  },
  blue: {
    dot: "bg-blue-500",
    on: "bg-blue-500/15 text-blue-600",
    off: "bg-muted-foreground/10 text-muted-foreground",
    border: "border-blue-500/20",
    btnOn: "bg-blue-600 hover:bg-blue-700",
    btnOff: "bg-muted-foreground/20 hover:bg-muted-foreground/30",
  },
};

export default function PumpControl({ pumpStatus }: Props) {
  const [sending, setSending] = useState<Record<number, boolean>>({});
  const [confirmStop, setConfirmStop] = useState(false);
  const [localStatus, setLocalStatus] = useState<PumpStatus | null>(pumpStatus);

  // Sync when prop changes
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
        // Optimistically update
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
      pump_1: "OFF",
      pump_2: "OFF",
      pump_3: "OFF",
      updated_at: new Date().toISOString(),
    });
  }, []);

  const getPumpState = (zone: number): "ON" | "OFF" => {
    if (!localStatus) return "OFF";
    const key = `pump_${zone}` as keyof PumpStatus;
    return localStatus[key] === "ON" ? "ON" : "OFF";
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">Pump Control</p>
        {localStatus && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {localStatus.pump_1 === "ON" ||
            localStatus.pump_2 === "ON" ||
            localStatus.pump_3 === "ON" ? (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                Active
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                All off
              </>
            )}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {ZONES.map((zone) => {
          const state = getPumpState(zone.num);
          const isOn = state === "ON";
          const colors = COLOR_MAP[zone.color];
          const disabled = sending[zone.num];

          return (
            <div
              key={zone.num}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                isOn ? colors.border : "border-border"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isOn ? colors.dot : "bg-muted-foreground/30"
                  }`}
                />
                <span className="text-xs font-medium text-foreground">
                  {zone.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    isOn ? colors.on : colors.off
                  }`}
                >
                  {state}
                </span>
                <button
                  onClick={() => handleCommand(zone.num, "ON")}
                  disabled={disabled || isOn}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    isOn ? "bg-green-600/50" : colors.btnOn
                  }`}
                >
                  {disabled ? "..." : "ON"}
                </button>
                <button
                  onClick={() => handleCommand(zone.num, "OFF")}
                  disabled={disabled || !isOn}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    !isOn ? "bg-muted-foreground/10" : colors.btnOff
                  }`}
                >
                  {disabled ? "..." : "OFF"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Stop */}
      <div className="mt-4 border-t border-border pt-4">
        {confirmStop ? (
          <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <span className="text-xs font-medium text-destructive">
              Are you sure? This turns ALL pumps OFF immediately.
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleEmergencyStop}
                className="rounded-lg bg-destructive px-3 py-1.5 text-[11px] font-bold text-white"
              >
                Yes, STOP
              </button>
              <button
                onClick={() => setConfirmStop(false)}
                className="rounded-lg bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmStop(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10"
          >
            <span className="text-base">⚠</span>
            Emergency All-Off
          </button>
        )}
      </div>
    </div>
  );
}
