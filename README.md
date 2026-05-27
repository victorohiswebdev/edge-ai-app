# Edge AI Smart Farming Dashboard

**An Integrated Edge AI Framework for Predictive Water Management and Plant Health Assessment**

A real-time monitoring dashboard for a smart farming system that runs fully offline on a Raspberry Pi 4. Features AI-driven predictive irrigation (Random Forest) and plant health classification (CNN via TensorFlow Lite).

---

## 🧱 System Overview

```
┌──────────────────┐     USB Serial      ┌──────────────────┐
│   Arduino Uno     │◄──────────────────►│  Raspberry Pi 4   │
│  3× Moisture +    │   9600 baud JSON   │  data_logger.py   │
│  BME280 (optional)│                     │  → SQLite3        │
└──────┬───────────┘                     └────────┬──────────┘
       │                                          │
       ▼                                          ▼
  ┌──────────┐                              ┌──────────────┐
  │ 3× Pumps │                              │  FastAPI      │
  │ (Relays) │                              │  (Read-only)  │
  └──────────┘                              └──────┬───────┘
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │  Dashboard    │
                                            │  (Next.js)    │
                                            └──────────────┘
```

**Stack:** Next.js 16.2.6 · React 19.2.4 · Tailwind CSS v4 · TypeScript 5 · Framer Motion 12

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
edge-ai-app/
├── docs/                          ← Hardware, firmware & software docs
│   ├── index.md                   ← Master documentation index
│   ├── hardware/                  ← Wiring, power, calibration guides
│   ├── firmware/                  ← Arduino sketches + documentation
│   └── software/                  ← Python scripts + API reference
├── public/
│   └── fonts/
│       ├── poppins/               ← Poppins (self-hosted body font)
│       └── space-grotesk/         ← Space Grotesk (self-hosted heading font)
├── src/
│   ├── lib/
│   │   └── fonts.ts               ← next/font/local configuration
│   └── app/
│       ├── globals.css            ← Tailwind v4 @theme brand tokens
│       ├── layout.tsx             ← Root layout with font loading
│       └── page.tsx               ← Dashboard homepage
├── next.config.ts
└── package.json
```

---

## 🎨 Design System

**Typography:**
- **Body:** Poppins (400–700) — self-hosted woff2, zero network calls
- **Headings:** Space Grotesk (700 only) — used sparingly for titles and stats

**Colour Palette (Warm Light):**
- Primary: `#16a34a` (forest green)
- Accent: `#d97706` (amber)
- Background: `#faf8f5` (warm off-white)
- Cards: `#ffffff` (white)
- Dark mode: auto-switches via `prefers-color-scheme`

Both fonts are fully self-hosted — **no Google Fonts CDN calls**, meeting the offline requirement.

---

## 📚 Documentation

All hardware, firmware, and software documentation lives in [`docs/`](docs/):

| Section | What You'll Find |
|---|---|
| [Hardware](docs/hardware/wiring-overview.md) | Wiring diagrams, pin assignments, power architecture, sensor calibration |
| [Firmware](docs/firmware/index.md) | Arduino sketches — sensor reading, pump control, diagnostics |
| [Software](docs/software/index.md) | Pi data logger, pump test tool, synthetic data generator, FastAPI reference |
| [Runbook](RUNBOOK.md) | Boot sequence, service management, data source states, troubleshooting |

The header badge shows the current pipeline state: **Simulated** (amber) → **Database** (blue) → **Live Data** (green).

---

## 🧪 Development

```bash
# Run development server
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

The dashboard uses a **style-first approach**: design tokens and layout are established before data-fetching logic. During development, the UI renders placeholder data. Wiring to the FastAPI backend is the final step.

---

## 🔗 Related Repositories

- [edge-ai-api](https://github.com/victorohiswebdev/edge-ai-api) — FastAPI backend (sensor data REST API)
- [edge-ai-app](https://github.com/victorohiswebdev/edge-ai-app) — This dashboard

---

## 📄 License & Academic Context

Final Year Project — Afe Babalola University, Ado-Ekiti
Department of Electrical/Electronics and Computer Engineering
Student: Eguaikhide Victor Ohifueme (22/ENG04/034)
Supervisor: Dr. Monday Eyinagho
