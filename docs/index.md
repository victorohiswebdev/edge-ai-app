# Edge AI Smart Farming — Hardware & Software Documentation

**An Integrated Edge AI Framework for Predictive Water Management and Plant Health Assessment**

Eguaikhide Victor Ohifueme (22/ENG04/034) — Afe Babalola University, Ado-Ekiti

---

## System Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     RAPID PROTOTYPE SETUP                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     USB Serial      ┌──────────────────┐  │
│  │   Arduino Uno     │◄──────────────────►│  Raspberry Pi 4    │  │
│  │  (Co-processor)   │   9600 baud JSON   │  (Edge Server)     │  │
│  └──────┬───────────┘                     └────────┬─────────┘  │
│         │                                          │            │
│         ▼                                          ▼            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Soil Mst │  │ Soil Mst │  │ Soil Mst │  │ BME280 (Opt) │    │
│  │ Zone 1   │  │ Zone 2   │  │ Zone 3   │  │ Temp/Hum/Prs │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────┘    │
│       │              │             │                             │
│       ▼              ▼             ▼                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │ Pump 1   │  │ Pump 2   │  │ Pump 3   │                       │
│  │ (Zone 1) │  │ (Zone 2) │  │ (Zone 3) │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
│                                                                  │
│             30,000 mAh Oraimo Power Bank (Single Source)         │
└─────────────────────────────────────────────────────────────────┘
```

## Documentation Structure

| Section | What It Covers |
|---|---|
| [`hardware/`](hardware/) | Wiring, pin assignments, power architecture, calibration |
| [`firmware/`](firmware/) | Arduino sketches — sensor reading, pump control, diagnostics |
| [`software/`](software/) | Python scripts — data logger, pump test, synthetic data, FastAPI |

---

## Quick Start — From Scratch

### 1. Hardware Setup

Follow [`hardware/wiring-overview.md`](hardware/wiring-overview.md) to wire the components. You'll need:

- Arduino Uno × 1
- Raspberry Pi 4 × 1
- Capacitive Soil Moisture Sensor v1.2 × 3
- BME280 (GYBME280-5V) × 1 — **fully optional**, system runs without it
- 4-Channel 5V Relay Module (active-LOW) × 1
- 5V DC Submersible Pump × 3
- 30,000 mAh Power Bank × 1
- Jumper wires (male-to-male, male-to-female)

### 2. Flash Arduino

1. Open Arduino IDE
2. Install libraries: **Adafruit BME280**, **Adafruit Unified Sensor**, **ArduinoJson** (Benoit Blanchon)
3. Upload [`firmware/sensor-actuator.md`](firmware/sensor-actuator.md) to the Arduino
4. Open Serial Monitor at 9600 baud to verify JSON output

### 3. Start Pi Logger

```bash
python3 software/data_logger.py --port /dev/ttyACM0
```

### 4. Start Dashboard

```bash
cd ..
npm run dev
# Opens http://localhost:3000
```

### 5. Test Pumps

```bash
python3 software/pump-test.py --demo
```
