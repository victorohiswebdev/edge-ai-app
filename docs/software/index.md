# Software — Python Scripts & API

## Script Overview

| Script | Purpose |
|---|---|
| [`data_logger.py`](./data_logger.py) | Pi-side serial reader → SQLite logger |
| [`pump_test.py`](./pump_test.py) | Interactive pump control + demo cycle |
| [`synthetic_data.py`](./synthetic_data.py) | 14-day synthetic sensor data generator |
| FastAPI (edge-ai-api) | REST backend — serves sensor data to the dashboard |

---

## `data_logger.py` — Pi Serial Logger

**The core runtime script.** Runs on the Raspberry Pi, reads JSON from Arduino over USB Serial, and writes to SQLite.

### Usage

```bash
# Auto-detect Arduino port
python3 data_logger.py

# Manual port
python3 data_logger.py --port /dev/ttyACM0

# Custom write interval (default: 300 s = 5 min)
python3 data_logger.py --interval 600
```

### Architecture

```
Arduino (JSON over Serial, 9600 baud)
    │
    ▼
data_logger.py
    ├── Parses JSON (json.loads — skips malformed lines)
    ├── Validates required keys (moisture_zone_1 must exist)
    ├── Prints formatted console output every 2 s
    └── Batch-writes to SQLite every N seconds
            │
            ▼
        farm_data.db
            │
            ▼
        FastAPI (read-only) → Dashboard
```

### Key Design Decisions

**Batch-write strategy:** Writes to SQLite every 5 minutes (configurable) instead of every 2 seconds. This significantly extends the Pi's SD card life — SD cards have limited write cycles, and constant logging can kill one in months.

**Null-safe BME280 handling:** Uses `data.get("temperature_c")` which returns `None` for missing keys. `None` values map to SQL `NULL`. Console output shows `N/A` for absent sensors.

**Auto-detect Arduino:** Scans USB vendor IDs (2341, 2A03, 1A86, 10C4) and common Linux port patterns (`/dev/ttyACM*`, `/dev/ttyUSB*`).

**Graceful shutdown:** Captures `Ctrl+C`, prints session summary (total reads, DB writes, DB path), then closes serial and DB connections.

### Schema

```sql
CREATE TABLE sensor_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP,
    moisture_zone_1 INTEGER,
    moisture_zone_2 INTEGER,
    moisture_zone_3 INTEGER,
    temperature_c   REAL,      -- NULL when BME280 absent
    humidity_perc   REAL       -- NULL when BME280 absent
);
```

---

## `pump_test.py` — Pump Control

Used to test the relay/pump system interactively or in automated demo mode.

### Usage

```bash
# Interactive mode
python3 pump_test.py

# Turn a specific zone on/off
python3 pump_test.py --zone 1 --on
python3 pump_test.py --zone 2 --off

# Full demo cycle (each zone runs for 3 s)
python3 pump_test.py --demo
```

### Interactive Commands

```
1on / 1off    — Zone 1 pump
2on / 2off    — Zone 2 pump
3on / 3off    — Zone 3 pump
alloff        — Emergency stop
q             — Quit
```

---

## `synthetic_data.py` — Data Generator

Generates 14 days of realistic sensor data for training the Random Forest model and populating the dashboard during development.

### Usage

```bash
# Generate CSV only
python3 synthetic_data.py

# Also insert into farm_data.db
python3 synthetic_data.py --to-db

# Show visualization (requires matplotlib)
python3 synthetic_data.py --plot
```

### Data Patterns

| Zone | Logic |
|---|---|
| Zone 1 (Control) | Threshold-based — waters when moisture < 40% |
| Zone 2 (Stress) | Under-watered — waters only when < 25%, sometimes skips |
| Zone 3 (AI-Managed) | Predictive — uses predicted 2-hour moisture to water earlier |

- **Temperature:** Daily sinusoidal cycle (peak ~35°C at 14:00, trough ~25°C at 04:00) + Gaussian noise
- **Humidity:** Inverse of temperature (higher at night) + Gaussian noise

### Output

```
~/fyp/synthetic_sensor_data.csv          — 1,344 rows (14 days × 96 readings/day)
~/fyp/farm_data.db                       — When --to-db flag is used
~/fyp/synthetic_data_plot.png            — When --plot flag is used
```

---

## FastAPI Backend

The REST API lives in the `edge-ai-api` repo ([GitHub](https://github.com/victorohiswebdev/edge-ai-api)).

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/v1/sensors/latest` | Most recent reading |
| `GET` | `/api/v1/sensors/history?hours=24&limit=200` | Time-series data |
| `GET` | `/api/v1/sensors/summary?hours=24` | Averages over window |
| `POST` | `/api/v1/sensors/ingest` | Push new reading (future use) |

### Architecture

```
data_logger.py (writes) → farm_data.db ← FastAPI (reads only) ← Dashboard
```

**Key decision:** FastAPI is **read-only**. The Pi's `data_logger.py` is the single writer. This avoids SQLite concurrent-write conflicts (`database is locked` errors).
