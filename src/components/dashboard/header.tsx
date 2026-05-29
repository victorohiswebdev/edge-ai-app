"use client";

import type { DataSource } from "@/lib/types";

const badgeConfig: Record<DataSource, { label: string; dot: string; bg: string }> = {
  live: {
    label: "Live Data",
    dot: "bg-success",
    bg: "bg-success/10 text-success",
  },
  database: {
    label: "Database",
    dot: "bg-blue-500",
    bg: "bg-blue-500/10 text-blue-500",
  },
  synthetic: {
    label: "Simulated",
    dot: "bg-warning",
    bg: "bg-warning/10 text-warning",
  },
};

export function DashboardHeader({ dataSource }: { dataSource: DataSource }) {
  const badge = badgeConfig[dataSource];

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
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badge.bg}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          System Online
        </span>
      </div>
    </header>
  );
}
