/*
 * BME280 Test — Quick sensor check
 *
 * Upload this to your Arduino to verify your BME280 module is wired
 * correctly and returning sane values.
 *
 * Wiring:
 *   BME280 → Arduino Uno
 *   VCC    → 5V
 *   GND    → GND
 *   SDA    → A4
 *   SCL    → A5
 *
 * Required libraries (Arduino Library Manager):
 *   - Adafruit BME280 Library
 *   - Adafruit Unified Sensor
 *
 * After uploading, open Tools → Serial Monitor (9600 baud).
 * You should see temperature, humidity, and pressure every 2 seconds.
 * If you get "BME280 not found!" → check wiring or try address 0x77.
 */

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(9600);
  while (!Serial);  // Wait for Serial Monitor (USB only, remove on Pi)

  Serial.println(F("\n=============================="));
  Serial.println(F("BME280 Sensor Test"));
  Serial.println(F("=============================="));

  // Scan I2C bus for devices first — useful for debugging
  Serial.println(F("\nScanning I2C bus..."));
  byte count = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print(F("  Found device at 0x"));
      Serial.println(addr, HEX);
      count++;
    }
  }
  if (count == 0) {
    Serial.println(F("  No I2C devices found! Check wiring."));
  } else {
    Serial.print(F("  Total: "));
    Serial.print(count);
    Serial.println(F(" device(s)"));
  }

  // Initialize BME280
  Serial.println(F("\nInitializing BME280 at 0x76..."));
  if (!bme.begin(0x76)) {
    Serial.println(F("  ❌ BME280 not found at 0x76!"));
    Serial.println(F("  Trying 0x77 (alternate address)..."));
    if (!bme.begin(0x77)) {
      Serial.println(F("  ❌ BME280 not found at 0x77 either!"));
      Serial.println(F("\nTroubleshooting:"));
      Serial.println(F("  1. Check VCC → 5V and GND → GND"));
      Serial.println(F("  2. Check SDA → A4 and SCL → A5"));
      Serial.println(F("  3. Are pull-up resistors needed? Try 4.7kΩ on SDA/SCL"));
      Serial.println(F("  4. Some GYBME280-5V boards need GyverBME280 lib instead"));
      while (1);  // Halt
    } else {
      Serial.println(F("  ✅ BME280 found at 0x77 (not 0x76)!"));
    }
  } else {
    Serial.println(F("  ✅ BME280 found at 0x76!"));
  }

  Serial.println(F("\n--- Starting readings ---\n"));
}

void loop() {
  // Read all 3 values
  float temperature = bme.readTemperature();        // °C
  float humidity    = bme.readHumidity();           // %
  float pressure    = bme.readPressure() / 100.0F;  // hPa

  // Print formatted output
  Serial.print(F("🌡️  "));
  Serial.print(temperature, 1);
  Serial.print(F(" °C  |  💧 "));
  Serial.print(humidity, 1);
  Serial.print(F(" %  |  📊 "));
  Serial.print(pressure, 1);
  Serial.println(F(" hPa"));

  // Also show raw I2C status every cycle
  // (you'll see this flash when the sensor is OK)
  delay(2000);
}
