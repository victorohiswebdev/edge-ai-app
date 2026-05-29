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

export interface SystemHealth {
  status: "healthy" | "degraded" | "offline";
  arduino: {
    detected: boolean;
    port: string | null;
    connected: boolean;
    last_reading_seconds_ago: number | null;
  };
  sensors: Record<string, { status: string; value?: number | null; note?: string }>;
  services: Record<string, { running: boolean }>;
  database: {
    size_mb: number | null;
    total_readings: number;
    last_write_seconds_ago: number | null;
  };
  heartbeat: {
    logger_active: boolean;
    last_heartbeat: string | null;
  };
}

// ─── Pump Control ─────────────────────────────────

export interface PumpStatus {
  pump_1: "ON" | "OFF";
  pump_2: "ON" | "OFF";
  pump_3: "ON" | "OFF";
  updated_at: string | null;
}
