/**
 * API service layer — fetches sensor data from FastAPI backend.
 *
 * Falls back to generated synthetic data when the backend is unreachable
 * (common during development without hardware connected).
 */

import type { LatestReading, SensorReading, SensorSummary } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Fetch wrapper ─────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ─── Public API ────────────────────────────────────────────────────

export async function fetchLatestReading(): Promise<LatestReading | null> {
  return fetchJson<LatestReading>(`${API_BASE}/api/v1/sensors/latest`);
}

export async function fetchHistory(
  hours = 24,
  limit = 200
): Promise<SensorReading[] | null> {
  return fetchJson<SensorReading[]>(
    `${API_BASE}/api/v1/sensors/history?hours=${hours}&limit=${limit}`
  );
}

export async function fetchSummary(
  hours = 24
): Promise<SensorSummary | null> {
  return fetchJson<SensorSummary>(
    `${API_BASE}/api/v1/sensors/summary?hours=${hours}`
  );
}

// ─── Synthetic fallback data ───────────────────────────────────────

/** Generate a realistic sensor reading for the current time. */
function generateReading(offsetMinutes = 0): SensorReading {
  const now = new Date(Date.now() - offsetMinutes * 60 * 1000);
  const hour = now.getHours() + now.getMinutes() / 60;

  // Diurnal cycle: peak temp at 14:00 (~33°C), trough at 04:00 (~25°C)
  const tempBase = 29 + 4 * Math.sin(((hour - 8) * Math.PI) / 12);
  const temperature_c = Math.round((tempBase + (Math.random() - 0.5)) * 10) / 10;

  const humidity_perc = Math.round(
    60 - 12 * Math.sin(((hour - 8) * Math.PI) / 12) + (Math.random() - 0.5) * 4
  );

  // Zone moisture with realistic drift and periodic watering
  const baseM1 = 42 + Math.sin(hour / 12) * 8;
  const zone_1 = Math.max(0, Math.min(100, Math.round(baseM1 + (Math.random() - 0.5) * 3)));
  const zone_2 = Math.max(0, Math.min(100, Math.round(baseM1 * 0.45)));
  const zone_3 = Math.max(0, Math.min(100, Math.round(baseM1 * 1.3)));

  return {
    timestamp: now.toISOString(),
    moisture_zone_1: zone_1,
    moisture_zone_2: zone_2,
    moisture_zone_3: zone_3,
    temperature_c,
    humidity_perc,
  };
}

export function generateLatestReading(): LatestReading {
  const r = generateReading(0);
  return {
    moisture_zone_1: r.moisture_zone_1,
    moisture_zone_2: r.moisture_zone_2,
    moisture_zone_3: r.moisture_zone_3,
    temperature_c: r.temperature_c,
    humidity_perc: r.humidity_perc,
    timestamp: r.timestamp,
  };
}

export function generateHistory(hours = 24, points = 96): SensorReading[] {
  const interval = (hours * 60) / points;
  return Array.from({ length: points }, (_, i) =>
    generateReading((points - 1 - i) * interval)
  );
}

export function generateSummary(): SensorSummary {
  const now = new Date();
  const ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return {
    avg_moisture_1: 41.2,
    avg_moisture_2: 18.7,
    avg_moisture_3: 54.8,
    avg_temperature: 28.4,
    avg_humidity: 62.1,
    reading_count: 288,
    from_timestamp: ago.toISOString(),
    to_timestamp: now.toISOString(),
  };
}

// ─── Combined fetcher (API → fallback → synthetic) ─────────────────

export async function getLatestReading(): Promise<LatestReading> {
  const api = await fetchLatestReading();
  return api ?? generateLatestReading();
}

export async function getHistory(
  hours = 24,
  limit = 200
): Promise<SensorReading[]> {
  const api = await fetchHistory(hours, limit);
  return api ?? generateHistory(hours, Math.min(limit, 200));
}

export async function getSummary(hours = 24): Promise<SensorSummary> {
  const api = await fetchSummary(hours);
  return api ?? generateSummary();
}
