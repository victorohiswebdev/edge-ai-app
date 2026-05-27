/*
 * Step 1: Sensor Reader — Arduino to Pi via Serial
 * 
 * Reads 3 capacitive soil moisture sensors + BME280 environment sensor (if available),
 * packages everything into JSON, and sends it over Serial every 2 seconds.
 * 
 * v2.0 — BME280 is now OPTIONAL. The system continues running without it.
 *         Temperature/humidity fields will show "null" in the JSON output.
 * 
 * Required Libraries (install via Arduino IDE Library Manager):
 *   - Adafruit BME280 Library
 *   - Adafruit Unified Sensor
 *   - ArduinoJson (by Benoit Blanchon)
 * 
 * Wiring:
 *   BME280 (optional): VCC→5V, GND→GND, SDA→A4, SCL→A5
 *   Sensor 1: AOUT→A0, VCC→5V, GND→GND
 *   Sensor 2: AOUT→A1, VCC→5V, GND→GND
 *   Sensor 3: AOUT→A2, VCC→5V, GND→GND
 */

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>

Adafruit_BME280 bme;  // I2C

// --- Soil Moisture Sensor Pins ---
const int soilPin1 = A0;
const int soilPin2 = A1;
const int soilPin3 = A2;

// --- CALIBRATION LIMITS ---
// These are initial values for v1.2 capacitive sensors in air vs submerged.
// Adjust after testing in your actual soil.
const int dryValue = 470;   // Raw ADC value when sensor is in dry air
const int wetValue = 270;   // Raw ADC value when sensor is fully submerged in water

// --- BME280 Status ---
bool bme_ok = false;        // Will be set to true if BME280 initializes successfully

void setup() {
  Serial.begin(9600);
  
  // Initialize BME280 — but don't halt if it fails
  Wire.begin();
  delay(100);               // Give BME280 time to power up
  if (bme.begin(0x76)) {
    bme_ok = true;
    Serial.println("{\"status\": \"BME280 initialized at 0x76\"}");
  } else if (bme.begin(0x77)) {
    bme_ok = true;
    Serial.println("{\"status\": \"BME280 initialized at 0x77 (alternate addr)\"}");
  } else {
    Serial.println("{\"warning\": \"BME280 not found — continuing without environmental sensor\"}");
    // Do NOT halt — the system works with just soil moisture sensors
  }
}

void loop() {
  // --- 1. Read Soil Moisture (raw ADC → 0-100%) ---
  int raw1 = analogRead(soilPin1);
  int raw2 = analogRead(soilPin2);
  int raw3 = analogRead(soilPin3);

  // Map raw ADC values to a percentage (0% = dry air, 100% = submerged)
  int percent1 = constrain(map(raw1, dryValue, wetValue, 0, 100), 0, 100);
  int percent2 = constrain(map(raw2, dryValue, wetValue, 0, 100), 0, 100);
  int percent3 = constrain(map(raw3, dryValue, wetValue, 0, 100), 0, 100);

  // --- 2. Read Environment Sensor (only if available) ---
  float temp  = NAN;
  float humid = NAN;
  float press = NAN;

  if (bme_ok) {
    temp  = bme.readTemperature();      // °C
    humid = bme.readHumidity();         // %
    press = bme.readPressure() / 100.0F; // hPa
    
    // Sanity check — reject floating-bus garbage values
    // If readings are physically impossible, treat sensor as failed temporarily
    if (temp < -40 || temp > 85 || humid < 0 || humid > 100 || press < 300 || press > 1100) {
      temp  = NAN;
      humid = NAN;
      press = NAN;
    }
  }

  // --- 3. Build JSON Packet ---
  // Use a larger doc to accommodate the "null" representation
  StaticJsonDocument<256> doc;
  doc["moisture_zone_1"] = percent1;
  doc["moisture_zone_2"] = percent2;
  doc["moisture_zone_3"] = percent3;
  
  // NAN values serialize as "null" in JSON — the Pi data logger handles this
  if (isnan(temp)) {
    doc["temperature_c"] = nullptr;
    doc["humidity_perc"] = nullptr;
  } else {
    doc["temperature_c"] = temp;
    doc["humidity_perc"] = humid;
  }

  // --- 4. Send over Serial ---
  serializeJson(doc, Serial);
  Serial.println();   // Newline so the Pi knows the message is complete

  delay(2000);  // Read every 2 seconds
}
