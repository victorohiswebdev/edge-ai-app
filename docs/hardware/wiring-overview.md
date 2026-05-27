# Hardware — Wiring & Architecture

## System Architecture

The hardware follows a **dual-processor architecture**:

| Component | Role |
|---|---|
| **Raspberry Pi 4 (8 GB)** | Edge server — Python backend, AI inference, web dashboard |
| **Arduino Uno** | Co-processor — ADC for analog sensors, relay switching |
| **3× Capacitive Soil Moisture v1.2** | Zonal moisture readings (calibrated 0–100%) |
| **BME280 (GYBME280-5V)** | Ambient temp, humidity, pressure — **optional** |
| **Pi Camera Module V2** | Plant canopy images for CNN inference |
| **3× 5V DC Submersible Pumps** | Independent zonal irrigation |
| **4-Channel 5V Relay Module** | Pump switching (active-LOW signaling) |
| **30,000 mAh Oraimo Power Bank** | Single off-grid power source |

### Why Arduino + Pi?

The Arduino handles **real-time ADC and relay switching** while the Pi focuses on **AI inference and the web dashboard**. This separation prevents the Pi's OS scheduling from interfering with sensor timing.

---

## Wiring Diagrams

### Sensors → Arduino

```
BME280 (Optional)         Soil Moisture Zone 1     Soil Moisture Zone 2     Soil Moisture Zone 3
┌─────────────┐           ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ VCC → 5V    │           │ AOUT → A0       │      │ AOUT → A1       │      │ AOUT → A2       │
│ GND → GND   │           │ VCC  → 5V       │      │ VCC  → 5V       │      │ VCC  → 5V       │
│ SDA → A4    │           │ GND  → GND      │      │ GND  → GND      │      │ GND  → GND      │
│ SCL → A5    │           └─────────────────┘      └─────────────────┘      └─────────────────┘
└─────────────┘
```

**I²C address detection:**
- Primary: `0x76` (most GYBME280-5V modules)
- Fallback: `0x77` (alternate)
- The firmware auto-detects both addresses

### Arduino → Relay → Pumps

```
Arduino Uno             4-Channel Relay Module         Pumps
┌──────────┐            ┌─────────────────────┐       ┌──────────┐
│ Pin 7    ────────────►│ IN1                 │       │ Pump 1   │
│ Pin 6    ────────────►│ IN2          NO1 ───┼──────►│ (Zone 1) │
│ Pin 5    ────────────►│ IN3          NO2 ───┼──────►│ Pump 2   │
│          │            │               NO3 ───┼──────►│ (Zone 2) │
│ 5V    ───────────────►│ VCC                 │       │ Pump 3   │
│ GND   ───────────────►│ GND          COM ───┼──┐    │ (Zone 3) │
└──────────┘            │               COM ───┼──┤    └──────────┘
                         └─────────────────────┘  │    └──────────┘
                                                  │    └──────────┘
                                         Power Bank (+)
                                         Power Bank (-) ──── All pump (-) leads
```

**Active-LOW logic:**
- `LOW` = relay energized = pump **ON**
- `HIGH` = relay released = pump **OFF**
- This is **fail-safe**: if the Arduino resets, all pins float HIGH → pumps default OFF

### Power Architecture

```
30,000 mAh Oraimo Power Bank
├── USB-A → Pi 4 (5V/3A)
└── Cut USB cable
    ├── (+) → Relay COM1, COM2, COM3 (pump power rail)
    └── (-) → All 3 pump (-) leads (common ground)
```

**Measured power draw:**

| Load | Current |
|---|---|
| Pi 4 idle + logging | ~800 mA – 1.2 A |
| Single pump running | ~300 mA |
| All 3 pumps running | ~900 mA – 1.5 A |
| Total full load | ~2.1 A – 2.7 A |

**Estimated runtime on single charge:**
- Full load (all pumps): ~12 hours
- Idle (no pumping): ~30 hours

> **Key finding:** The 30,000 mAh power bank handles the full system load. Dual-power-rail design was tested but found **unnecessary** for the prototype — the single bank is sufficient.

---

## Sensor Calibration

Capacitive moisture sensors **vary between units**. Always calibrate your specific sensors rather than using generic values.

### Calibration Procedure

1. Upload [`firmware/raw-diagnostic.md`](../firmware/raw-diagnostic.md) — this outputs raw ADC values with no mapping
2. Note the value when the sensor is **bone dry on the table** → this is your `dryValue`
3. Submerge the sensor **fully in water** → note the value → this is your `wetValue`
4. Update the calibration in the main sketch

### Victor's Confirmed Calibration (v1.2 Sensors)

| Condition | ADC Reading |
|---|---|
| Dry air (desk) | ~460 |
| Fully submerged | ~173 |

```
dryValue = 460
wetValue = 173
```

---

## BME280 — Soldering & Replacement Notes

**Current status:** BME280 heat-damaged during veroboard soldering. Replacement ordered.

**Root cause:** MEMS sensor die overheated during soldering (tip >300°C, >3 s per pin).

**When replacing, use proper technique:**
- Soldering iron tip: ≤300°C
- Contact time: ≤3 seconds per pin
- Use a heat-sink clip between the pin and the sensor body
- Pre-tin the pads on the veroboard, then place and reflow

**While BME280 is absent:** The system runs in **BME280-optional mode** — moisture sensors work normally, temperature/humidity show as `null` in both JSON and the dashboard. See `firmware/sensor-actuator.md` for the validation logic that handles this.
