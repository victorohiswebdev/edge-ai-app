/*
 * Diagnostic Sketch — Raw ADC Values
 * 
 * Temporarily upload this to see what your sensors output
 * in dry air. Use the values to update dryValue in the main sketch.
 * 
 * Hold a sensor in your hand or dip in water to get wetValue too.
 */

#include <ArduinoJson.h>

const int soilPin1 = A0;
const int soilPin2 = A1;
const int soilPin3 = A2;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int raw1 = analogRead(soilPin1);
  int raw2 = analogRead(soilPin2);
  int raw3 = analogRead(soilPin3);

  StaticJsonDocument<200> doc;
  doc["raw_zone_1"] = raw1;
  doc["raw_zone_2"] = raw2;
  doc["raw_zone_3"] = raw3;

  serializeJson(doc, Serial);
  Serial.println();

  delay(2000);
}
