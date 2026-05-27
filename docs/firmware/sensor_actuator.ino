/*
 * Phase 2: Sensor Reader + Actuation Controller
 * 
 * Dual-function sketch:
 *   1. Reads sensors and sends JSON every 2s (BME280 is now OPTIONAL)
 *   2. Listens for pump commands from Pi over serial
 * 
 * v2.0 — BME280 is optional. System continues running without it.
 *         Temperature/humidity show as "null" in JSON when absent.
 * 
 * Pi sends commands like:
 *   {"pump_1":"ON"}   →  turns Zone 1 pump ON
 *   {"pump_1":"OFF"}  →  turns Zone 1 pump OFF
 *   {"pump_all":"OFF"} →  turns all pumps OFF (emergency stop)
 * 
 * Relay pins use ACTIVE-LOW signaling:
 *   LOW  = relay energized = pump RUNNING
 *   HIGH = relay released  = pump STOPPED
 *   (This is fail-safe — Arduino reset → pins float HIGH → pumps off)
 */

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>

Adafruit_BME280 bme;

// --- Sensor Pins ---
const int soilPin1 = A0;
const int soilPin2 = A1;
const int soilPin3 = A2;

// --- Relay Pins (Active-LOW) ---
const int relayPin1 = 7;   // Zone 1 pump
const int relayPin2 = 6;   // Zone 2 pump
const int relayPin3 = 5;   // Zone 3 pump

// --- Calibration ---
const int dryValue = 460;
const int wetValue = 173;

// --- BME280 Status ---
bool bme_ok = false;        // Will be set to true if BME280 initializes

// --- Command buffer ---
String incomingCommand = "";

void setup() {
  Serial.begin(9600);

  // Set relay pins as OUTPUT and start with pumps OFF (HIGH = inactive)
  pinMode(relayPin1, OUTPUT);
  pinMode(relayPin2, OUTPUT);
  pinMode(relayPin3, OUTPUT);
  digitalWrite(relayPin1, HIGH);
  digitalWrite(relayPin2, HIGH);
  digitalWrite(relayPin3, HIGH);

  // Initialize BME280 — but don't halt if it fails
  Wire.begin();
  delay(100);
  if (bme.begin(0x76)) {
    bme_ok = true;
    Serial.println("{\"status\": \"BME280 initialized at 0x76\"}");
  } else if (bme.begin(0x77)) {
    bme_ok = true;
    Serial.println("{\"status\": \"BME280 initialized at 0x77 (alternate addr)\"}");
  } else {
    Serial.println("{\"warning\": \"BME280 not found — continuing without environmental sensor\"}");
    // Do NOT halt — pump control still works without BME
  }
}

void loop() {
  // ─── PART 1: Read & Send Sensor Data ─────────────────────────
  int percent1 = constrain(map(analogRead(soilPin1), dryValue, wetValue, 0, 100), 0, 100);
  int percent2 = constrain(map(analogRead(soilPin2), dryValue, wetValue, 0, 100), 0, 100);
  int percent3 = constrain(map(analogRead(soilPin3), dryValue, wetValue, 0, 100), 0, 100);

  StaticJsonDocument<256> sensorDoc;
  sensorDoc["moisture_zone_1"] = percent1;
  sensorDoc["moisture_zone_2"] = percent2;
  sensorDoc["moisture_zone_3"] = percent3;

  // Read BME280 only if available, with sanity check
  if (bme_ok) {
    float temp  = bme.readTemperature();
    float humid = bme.readHumidity();
    float press = bme.readPressure() / 100.0F;

    // Reject floating-bus garbage values
    if (temp >= -40 && temp <= 85 && humid >= 0 && humid <= 100 && press >= 300 && press <= 1100) {
      sensorDoc["temperature_c"] = temp;
      sensorDoc["humidity_perc"] = humid;
    } else {
      sensorDoc["temperature_c"] = nullptr;
      sensorDoc["humidity_perc"] = nullptr;
    }
  } else {
    sensorDoc["temperature_c"] = nullptr;
    sensorDoc["humidity_perc"] = nullptr;
  }

  serializeJson(sensorDoc, Serial);
  Serial.println();

  // ─── PART 2: Listen for Pi Commands ──────────────────────────
  if (Serial.available() > 0) {
    incomingCommand = Serial.readStringUntil('\n');
    incomingCommand.trim();

    if (incomingCommand.length() > 0) {
      // Parse the command JSON
      StaticJsonDocument<100> cmdDoc;
      DeserializationError err = deserializeJson(cmdDoc, incomingCommand);

      if (!err) {
        // Check each pump command
        if (cmdDoc["pump_1"] == "ON")   digitalWrite(relayPin1, LOW);   // LOW = ON
        if (cmdDoc["pump_1"] == "OFF")  digitalWrite(relayPin1, HIGH);
        
        if (cmdDoc["pump_2"] == "ON")   digitalWrite(relayPin2, LOW);
        if (cmdDoc["pump_2"] == "OFF")  digitalWrite(relayPin2, HIGH);
        
        if (cmdDoc["pump_3"] == "ON")   digitalWrite(relayPin3, LOW);
        if (cmdDoc["pump_3"] == "OFF")  digitalWrite(relayPin3, HIGH);

        // Emergency all-off
        if (cmdDoc["pump_all"] == "OFF") {
          digitalWrite(relayPin1, HIGH);
          digitalWrite(relayPin2, HIGH);
          digitalWrite(relayPin3, HIGH);
        }

        // Send acknowledgment
        StaticJsonDocument<100> ack;
        ack["status"] = "ok";
        ack["pump_1"] = digitalRead(relayPin1) == LOW ? "ON" : "OFF";
        ack["pump_2"] = digitalRead(relayPin2) == LOW ? "ON" : "OFF";
        ack["pump_3"] = digitalRead(relayPin3) == LOW ? "ON" : "OFF";
        serializeJson(ack, Serial);
        Serial.println();
      }
    }
  }

  delay(2000);
}
