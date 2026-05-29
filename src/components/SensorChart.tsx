"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { SensorReading } from "@/lib/types";

interface Props {
  data: SensorReading[];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function SensorChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Downsample for cleaner chart (show ~48 points max)
  const step = Math.max(1, Math.floor(data.length / 48));
  const sampled = data.filter((_, i) => i % step === 0);

  const firstTs = data[0]?.timestamp ?? "";
  const lastTs = data[data.length - 1]?.timestamp ?? "";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow duration-300 hover:shadow-elevated md:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-heading text-base font-bold text-foreground">
            Moisture &amp; Temperature
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(firstTs)} — {formatDate(lastTs)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
            Zone 1
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d97706]" />
            Zone 2
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
            Zone 3
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
            Temp
          </span>
        </div>
      </div>

      <div className="h-64 w-full md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sampled} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="moisture"
              domain={[0, 100]}
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="temp"
              orientation="right"
              domain={[15, 40]}
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}°`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                fontSize: 12,
                boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
              }}
              labelFormatter={(label) => {
                const d = new Date(label);
                return d.toLocaleString("en-NG", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }}
            />
            <Area
              yAxisId="moisture"
              type="monotone"
              dataKey="moisture_zone_1"
              stroke="#16a34a"
              fill="#16a34a"
              fillOpacity={0.08}
              strokeWidth={2}
              dot={false}
              name="Zone 1"
            />
            <Area
              yAxisId="moisture"
              type="monotone"
              dataKey="moisture_zone_2"
              stroke="#d97706"
              fill="#d97706"
              fillOpacity={0.08}
              strokeWidth={2}
              dot={false}
              name="Zone 2"
            />
            <Area
              yAxisId="moisture"
              type="monotone"
              dataKey="moisture_zone_3"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.08}
              strokeWidth={2}
              dot={false}
              name="Zone 3"
            />
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temperature_c"
              stroke="#dc2626"
              fill="#dc2626"
              fillOpacity={0.05}
              strokeWidth={2}
              dot={false}
              name="Temperature"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
