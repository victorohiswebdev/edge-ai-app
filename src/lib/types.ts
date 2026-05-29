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

export interface LiveReading {
  moisture_zone_1: number | null;
  moisture_zone_2: number | null;
  moisture_zone_3: number | null;
  temperature_c: number | null;
  humidity_perc: number | null;
  timestamp: string;
}

// ─── Data source tracking ─────────────────────────────────

export type DataSource = "synthetic" | "database" | "live";

export interface WithSource<T> {
  data: T;
  source: DataSource;
}

export interface SystemStatus {
  database_connected: boolean;
  logger_active: boolean;
  last_reading: string | null;
  total_readings: number;
}
