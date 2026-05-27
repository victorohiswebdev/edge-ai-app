# Firmware — Arduino Sketches

The Arduino runs one of two main sketches depending on the phase of the build. There are also diagnostic sketches for calibration and troubleshooting.

## Sketch Overview

| Sketch | Purpose | File |
|---|---|---|
| **sensor_actuator.ino** | **Primary sketch** — reads sensors + controls pumps | [`sensor_actuator.ino`](./sensor_actuator.ino) |
| sensor_reader.ino | Read-only: sensors → JSON over Serial (no pump control) | [`sensor_reader.ino`](./sensor_reader.ino) |
| raw_diagnostic.ino | Calibration tool — outputs raw ADC values | [`raw_diagnostic.ino`](./raw_diagnostic.ino) |
| bme280_test.ino | Standalone BME280 diagnostic | [`bme280_test.ino`](./bme280_test.ino) |

## Required Libraries

Install via Arduino IDE Library Manager:

```
Adafruit BME280 Library     — BME280 sensor driver
Adafruit Unified Sensor     — Sensor abstraction layer
ArduinoJson (Benoit)        — JSON serialization/deserialization
```

## Primary Sketch: `sensor_actuator.ino`

This is the **production sketch** that runs on the Arduino full-time. It has two concurrent responsibilities:

### Part 1 — Sensor Reading (every 2 s)

Reads all 3 soil moisture sensors and the BME280 (if available), then broadcasts a JSON packet over Serial:

```json
{"moisture_zone_1":42,"moisture_zone_2":18,"moisture_zone_3":55,
 "temperature_c":28.4,"humidity_perc":62.1}
```

When the BME280 is absent, temperature/humidity fields serialize as `null`:

```json
{"moisture_zone_1":42,"moisture_zone_2":18,"moisture_zone_3":55,
 "temperature_c":null,"humidity_perc":null}
```

### Part 2 — Pump Command Listener

Listens for JSON commands from the Pi over Serial:

| Command | Effect |
|---|---|
| `{"pump_1": "ON"}` | Zone 1 pump ON |
| `{"pump_1": "OFF"}` | Zone 1 pump OFF |
| `{"pump_2": "ON"}` | Zone 2 pump ON |
| `{"pump_2": "OFF"}` | Zone 2 pump OFF |
| `{"pump_3": "ON"}` | Zone 3 pump ON |
| `{"pump_3": "OFF"}` | Zone 3 pump OFF |
| `{"pump_all": "OFF"}` | Emergency all-off |

Response (acknowledgment):

```json
{"status":"ok","pump_1":"ON","pump_2":"OFF","pump_3":"OFF"}
```

## BME280-Optional Pattern

Both `sensor_actuator.ino` and `sensor_reader.ino` implement the BME280-optional pattern:

1. **Graceful init failure** — `bme.begin()` failure does NOT call `while(1)`. Instead, it sets `bme_ok = false` and continues.
2. **Sanity check validation** — readings outside physically possible ranges (temp < −40°C or > 85°C, humidity < 0% or > 100%, pressure < 300 or > 1100 hPa) are treated as invalid and replaced with `NAN`.
3. **Null-safe JSON** — `NAN` values serialize as `nullptr` in ArduinoJson, producing valid JSON with null fields.

This prevents the classic "181.3°C floating-bus artifact" (where a disconnected BME280 bus produces garbage through the Adafruit library).

## Calibration: `raw_diagnostic.ino`

Upload this sketch to see the **raw ADC values** from your moisture sensors. The output is JSON every 2 seconds:

```json
{"raw_zone_1":459,"raw_zone_2":453,"raw_zone_3":460}
```

Use these values to determine your `dryValue` and `wetValue` calibration constants.

## Troubleshooting: `bme280_test.ino`

A standalone diagnostic for the BME280 sensor. It:
1. Scans the I²C bus and reports all found devices
2. Attempts BME280 init at 0x76, then 0x77
3. Prints formatted temperature/humidity/pressure readings
4. Includes troubleshooting hints if the sensor isn't found
