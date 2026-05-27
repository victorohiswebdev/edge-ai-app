export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
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
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" />
            System Online
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 space-y-6 overflow-y-auto p-8">
        {/* Live sensor cards */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Live Sensors
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sensorCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 font-heading text-3xl font-bold tracking-tight text-card-foreground">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Zone moisture cards */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Zone Moisture
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {zoneCards.map((zone) => (
              <div
                key={zone.name}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{zone.name}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      zone.mode === "AI"
                        ? "bg-primary/10 text-primary"
                        : zone.mode === "Control"
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {zone.mode}
                  </span>
                </div>
                <p className="mt-2 font-heading text-3xl font-bold tracking-tight text-card-foreground">
                  {zone.moisture}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: zone.percentage }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chart placeholder */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            24-Hour History
          </h2>
          <div className="mt-3 flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              Chart component — coming soon
            </p>
          </div>
        </section>

        {/* Plant health placeholder */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Plant Health
          </h2>
          <div className="mt-3 flex h-48 items-center justify-center rounded-2xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              CNN inference panel — coming soon
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

const sensorCards = [
  { label: "Temperature", value: "28.4°C", subtitle: "Ambient (BME280)" },
  { label: "Humidity", value: "62%", subtitle: "Ambient (BME280)" },
  { label: "Pressure", value: "1013 hPa", subtitle: "Atmospheric" },
  { label: "Pump Status", value: "Idle", subtitle: "All zones off" },
];

const zoneCards = [
  {
    name: "Zone 1 — Control",
    mode: "Control",
    moisture: "42%",
    percentage: "42%",
  },
  {
    name: "Zone 2 — Stress",
    mode: "Stress",
    moisture: "18%",
    percentage: "18%",
  },
  {
    name: "Zone 3 — AI-Managed",
    mode: "AI",
    moisture: "55%",
    percentage: "55%",
  },
];
