# Edge AI Smart Farming Dashboard

**An Integrated Edge AI Framework for Predictive Water Management and Plant Health Assessment**

A real-time monitoring dashboard for a smart farming system that runs fully offline on a Raspberry Pi 4. Features AI-driven predictive irrigation (Random Forest) and plant health classification (CNN via TensorFlow Lite).

## System Overview

```
┌──────────────────┐     USB Serial      ┌──────────────────────────────┐
│   Arduino Uno     │◄──────────────────►│  Raspberry Pi 4               │
│  3× Moisture +    │   9600 baud JSON   │  data_logger.py               │
│  BME280 (optional)│   pump commands    │  → SQLite3 (farm_data.db)     │
└──────┬───────────┘                     └─────────┬────────────────────┘
       │                                           │
       ▼                                           ▼
  ┌──────────┐                              ┌──────────────┐
  │ 3× Pumps │                              │  FastAPI      │
  │ (Relays) │                              │  port 8000    │
  └──────────┘                              │  7 routers    │
       ▲                                    │  RF + CNN     │
       │                                    └──────┬───────┘
       │                                           │
       │                                    ┌──────▼───────┐
       │                                    │  Dashboard    │
       │                                    │  Next.js 16   │
       │                                    │  port 3000    │
       └────── Pi Camera V2 (CSI) ─────────│  5 sub-pages   │
                                            └──────────────┘
```

**Stack:** Next.js 16.2.6 · React 19.2.4 · Tailwind CSS v4 · TypeScript 5 · Recharts 3.8

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The dashboard expects the FastAPI backend at `http://localhost:8000` (set `NEXT_PUBLIC_API_URL` to override). When the backend is unreachable, the dashboard falls back to synthetic data for development.

## Page Structure

The dashboard is split into 5 focused pages with a collapsible sidebar nav. Each page only fetches the data it needs — reducing Pi CPU load compared to a single-scroll approach.

| Page | Route | Poll Interval | What It Shows |
|------|-------|--------------|---------------|
| **Overview** | `/` | 10s | Sensor cards (temp, humidity, VPD), zone moisture gauges, system status dots |
| **Irrigation** | `/irrigation` | 10s | RF predictions + CNN override + integrated decision cards + pump control |
| **Camera Lab** | `/camera-lab` | manual | Camera capture, snapshot gallery, auto-classification results |
| **System** | `/system` | 10s | Hardware health check, serial monitor log, service status |
| **History** | `/history` | 2min | 24-hour moisture + temperature chart (Recharts) |

**Design decisions for Pi performance:**
- Sidebar uses CSS-only transitions (no Framer Motion)
- Collapsible sidebar (w-16/w-56) saves space on small displays
- History page polls at 2min (chart data is heavy)
- All other pages poll at 10s
- Self-hosted fonts (Poppins + Space Grotesk woff2) — zero network calls

## Project Structure

```
edge-ai-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── globals.css         # Tailwind v4 @theme brand tokens
│   │   ├── page.tsx            # Overview — sensor cards + zone gauges
│   │   ├── irrigation/
│   │   │   └── page.tsx        # AI Irrigation — predictions + pump control
│   │   ├── camera-lab/
│   │   │   └── page.tsx        # Camera Lab — snapshots + classification
│   │   ├── system/
│   │   │   └── page.tsx        # System Health + serial monitor
│   │   └── history/
│   │       └── page.tsx        # 24-hour chart
│   ├── components/
│   │   ├── DashboardShell.tsx          # Sidebar nav + layout wrapper
│   │   ├── IntegratedDecisionCard.tsx  # RF + CNN combined decision (3-zone)
│   │   ├── IrrigationPredictionCard.tsx # RF-only prediction card (standalone)
│   │   ├── PumpControl.tsx             # Per-zone ON/OFF + emergency stop
│   │   ├── SystemHealthCard.tsx        # Hardware + service health panel
│   │   ├── SensorChart.tsx             # Recharts line chart (24h)
│   │   └── dashboard/
│   │       ├── sensor-card.tsx         # Environment card (temp/humidity/VPD)
│   │       ├── zone-card.tsx           # Zone moisture gauge card
│   │       ├── hero-header.tsx         # Old hero banner (unused now)
│   │       ├── skeleton-card.tsx       # Loading shimmer placeholder
│   │       ├── info-tooltip.tsx        # Hover tooltip (Framer Motion)
│   │       ├── live-log-panel.tsx      # Serial log viewer
│   │       └── plant-health-card.tsx   # CNN classification panel
│   └── lib/
│       ├── api.ts              # API fetch layer + synthetic fallback
│       ├── types.ts            # TypeScript interfaces matching API schemas
│       └── fonts.ts            # next/font/local self-hosted fonts
└── package.json
```

## Design System

**Typography:**
- **Body:** Poppins (400–700) — self-hosted woff2, zero network calls
- **Headings:** Space Grotesk (700) — used for titles and stats

**Colour Palette:**
- Primary: `#16a34a` (forest green)
- Accent: `#d97706` (amber)
- Info: `#2563eb` (blue)
- Success: `#16a34a` — Healthy / Irrigate / Online
- Warning: `#d97706` — Stressed / Database / Degraded
- Danger: `#dc2626` — Wilted / Offline / Alert

**Card design:** Rounded-2xl, 1px border, subtle shadow, accent bar at top, consistent 20px spacing. Dark mode supported via `prefers-color-scheme`.

**Both fonts are fully self-hosted** — no Google Fonts CDN calls, meeting the offline requirement.

## AI Components

### Integrated Decision Card
Shows all 3 zones with combined RF + CNN decisions:
- **RF Model panel:** Predicted moisture %, "Needs water" / "Stable" verdict
- **CNN Plant Health panel:** Classification (Healthy/Stressed/Wilted) with confidence %
- **Moisture gauge bar:** Current moisture vs threshold
- **Override banner:** Red "CNN Override Active" when stressed/wilted plant blocks irrigation
- **Final action badge:** IRRIGATE (amber), OK (green), CHECK (red)

### Irrigation Prediction Card
Standalone RF-only prediction with per-zone detail and reasoning text.

### Plant Health Card
Shown in Camera Lab after capture — classification result with confidence bars for all 3 classes.

## Development

```bash
# Run development server
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

## Related Repos

- [edge-ai-api](https://github.com/victorohiswebdev/edge-ai-api) — FastAPI backend (sensor REST API + AI inference)
- [edge-ai-app](https://github.com/victorohiswebdev/edge-ai-app) — This dashboard

## Academic Context

Final Year Project — Afe Babalola University, Ado-Ekiti
Department of Electrical/Electronics and Computer Engineering
Student: Eguaikhide Victor Ohifueme (22/ENG04/034)
Supervisor: Dr. Monday Eyinagho
