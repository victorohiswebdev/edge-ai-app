/** TypeScript types matching FastAPI schemas */

export interface SensorReading {
  id?: number;
  timestamp: string;
  moisture_zone_1: number | null;
  moisture_zone_2: number | null;
  moisture_zone_3: number | null;
  temperature_c: number | null;
  humidity_perc: number | null;
}

export interface LatestReading {
  moisture_zone_1: number | null;
  moisture_zone_2: number | null;
  moisture_zone_3: number | null;
  temperature_c: number | null;
  humidity_perc: number | null;
  timestamp: string;
}

export interface SensorSummary {
  avg_moisture_1: number | null;
  avg_moisture_2: number | null;
  avg_moisture_3: number | null;
  avg_temperature: number | null;
  avg_humidity: number | null;
  reading_count: number;
  from_timestamp: string;
  to_timestamp: string;
}
