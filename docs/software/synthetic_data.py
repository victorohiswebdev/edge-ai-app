#!/usr/bin/env python3
"""
synthetic_data.py — Generate realistic training data for the RF model.

Creates 2 weeks of simulated sensor data at 15-minute intervals for all
3 zones, with realistic moisture curves, temperature cycles, and humidity.

Zone 1 (Control):  Threshold-based. Watered when moisture < 40%.
Zone 2 (Stress):   Intentionally under-watered. Longer dry periods.
Zone 3 (AI-Managed): Predictive. Watered earlier, more consistent moisture.

Usage:
  python3 synthetic_data.py              # Generate CSV only
  python3 synthetic_data.py --to-db       # Also insert into farm_data.db
  python3 synthetic_data.py --plot        # Show visualization (needs matplotlib)
"""

import numpy as np
import pandas as pd
import sqlite3
import os
import argparse
from datetime import datetime, timedelta

# ─── Configuration ───────────────────────────────────────────────────────────
INTERVAL_MINUTES = 15
DAYS = 14
DB_PATH = "farm_data.db"
CSV_PATH = "synthetic_sensor_data.csv"

# Zone-specific watering thresholds
THRESHOLD_CONTROL = 40    # Zone 1: water when below 40%
THRESHOLD_STRESS = 25     # Zone 2: let it dry more before watering
THRESHOLD_AI = 45         # Zone 3: water earlier (predictive advantage)


def generate_dataset():
    """Generate a complete synthetic dataset for all 3 zones."""
    
    total_points = int((24 * 60 / INTERVAL_MINUTES) * DAYS)
    timestamps = [
        datetime(2026, 5, 1) + timedelta(minutes=i * INTERVAL_MINUTES)
        for i in range(total_points)
    ]
    
    np.random.seed(42)
    
    # ── Temperature: daily cycle (hot day ~35°C, cool night ~25°C) ──
    hour_of_day = np.array([t.hour + t.minute / 60 for t in timestamps])
    # Peak at 14:00, trough at 04:00
    temp_base = 30 + 5 * np.sin((hour_of_day - 8) * np.pi / 12)
    temperature = temp_base + np.random.normal(0, 0.5, total_points)
    
    # ── Humidity: inverse of temperature (higher at night) ──
    hum_base = 60 - 15 * np.sin((hour_of_day - 8) * np.pi / 12)
    humidity = hum_base + np.random.normal(0, 2, total_points)
    humidity = np.clip(humidity, 30, 95)
    
    # ── Moisture curves for each zone ──
    # Each zone has a different watering pattern
    
    moisture_1 = np.zeros(total_points)  # Control
    moisture_2 = np.zeros(total_points)  # Stress
    moisture_3 = np.zeros(total_points)  # AI-Managed
    
    # Start all zones at 60% moisture (freshly watered)
    m1, m2, m3 = 60.0, 60.0, 60.0
    
    # Track time since last water for Zone 2 stress pattern
    hours_since_water_2 = 0
    
    for i in range(total_points):
        # ── Base evaporation rate ──
        # Evaporates faster when hot and dry
        temp_factor = temperature[i] / 30.0  # ~1.0 baseline, up to 1.2x
        hum_factor = 1.0 - (humidity[i] - 30) / 100  # Dry air = faster evaporation
        
        # Higher temp + lower humidity = faster moisture drop
        evap_rate = 0.3 * temp_factor * (1 + hum_factor * 0.5)
        
        # Add randomness
        noise = np.random.normal(0, 0.1)
        
        # ── Zone 1 (Control): Water when < 40% ──
        m1 -= evap_rate + noise
        if m1 < THRESHOLD_CONTROL:
            m1 = 60 + np.random.normal(0, 2)  # Water to ~60%
        moisture_1[i] = max(0, m1)
        
        # ── Zone 2 (Stress): Let it dry out more ──
        m2 -= evap_rate * 1.1 + noise  # Slightly faster evaporation (stressed)
        hours_since_water_2 += INTERVAL_MINUTES / 60
        
        # Water less frequently — only when critically dry
        if m2 < THRESHOLD_STRESS and hours_since_water_2 > 8:
            m2 = 55 + np.random.normal(0, 3)  # Less water than control
            hours_since_water_2 = 0
        
        # Occasionally skip watering even when below threshold (stress event)
        if m2 < THRESHOLD_STRESS and np.random.random() < 0.15:
            pass  # Skip watering — intentional stress
        elif m2 < THRESHOLD_STRESS and hours_since_water_2 > 8:
            m2 = 55 + np.random.normal(0, 3)
            hours_since_water_2 = 0
            
        moisture_2[i] = max(0, m2)
        
        # ── Zone 3 (AI-Managed): Water earlier, more consistent ──
        # Predictive advantage — water before it drops too low
        # Uses a "prediction" of where moisture will be in 2 hours
        predicted_m3 = m3 - evap_rate * 8  # ~2 hours of evaporation
        
        if predicted_m3 < THRESHOLD_AI:
            m3 = 65 + np.random.normal(0, 1.5)  # More consistent watering
        elif m3 < THRESHOLD_CONTROL:
            m3 = 60 + np.random.normal(0, 2)
        
        moisture_3[i] = max(0, m3)
    
    # Build DataFrame
    df = pd.DataFrame({
        "timestamp": timestamps,
        "moisture_zone_1": np.round(moisture_1, 1),
        "moisture_zone_2": np.round(moisture_2, 1),
        "moisture_zone_3": np.round(moisture_3, 1),
        "temperature_c": np.round(temperature, 2),
        "humidity_perc": np.round(humidity, 2),
    })
    
    return df


def save_csv(df):
    df.to_csv(CSV_PATH, index=False)
    print(f"✅ CSV saved: {CSV_PATH} ({len(df)} rows)")


def save_to_db(df):
    """Insert synthetic data into the existing farm_data.db."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Count existing rows
    cursor.execute("SELECT COUNT(*) FROM sensor_logs")
    existing = cursor.fetchone()[0]
    
    # Insert
    for _, row in df.iterrows():
        cursor.execute("""
            INSERT INTO sensor_logs 
            (timestamp, moisture_zone_1, moisture_zone_2, moisture_zone_3,
             temperature_c, humidity_perc)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            row["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
            row["moisture_zone_1"],
            row["moisture_zone_2"],
            row["moisture_zone_3"],
            row["temperature_c"],
            row["humidity_perc"],
        ))
    
    conn.commit()
    conn.close()
    print(f"✅ Inserted {len(df)} rows into {DB_PATH}")
    print(f"   (was {existing} rows, now {existing + len(df)} rows)")


def plot_data(df):
    """Show a quick visualization of the generated data."""
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("⚠️ matplotlib not installed. Install with: pip install matplotlib")
        return
    
    # Sample every 4th point for cleaner plot
    sample = df.iloc[::4]
    
    fig, axes = plt.subplots(3, 1, figsize=(14, 10), sharex=True)
    
    # Moisture
    axes[0].plot(sample["timestamp"], sample["moisture_zone_1"],
                 label="Zone 1 (Control)", alpha=0.8)
    axes[0].plot(sample["timestamp"], sample["moisture_zone_2"],
                 label="Zone 2 (Stress)", alpha=0.8)
    axes[0].plot(sample["timestamp"], sample["moisture_zone_3"],
                 label="Zone 3 (AI-Managed)", alpha=0.8)
    axes[0].axhline(y=40, color="gray", linestyle="--", alpha=0.5, label="Control threshold")
    axes[0].set_ylabel("Moisture (%)")
    axes[0].legend()
    axes[0].set_title("Synthetic Sensor Data — 14 Days")
    axes[0].grid(True, alpha=0.3)
    
    # Temperature
    axes[1].plot(sample["timestamp"], sample["temperature_c"],
                 color="red", alpha=0.7)
    axes[1].set_ylabel("Temperature (°C)")
    axes[1].grid(True, alpha=0.3)
    
    # Humidity
    axes[2].plot(sample["timestamp"], sample["humidity_perc"],
                 color="blue", alpha=0.7)
    axes[2].set_ylabel("Humidity (%)")
    axes[2].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig("synthetic_data_plot.png", dpi=150)
    print(f"✅ Plot saved: synthetic_data_plot.png")
    
    # Also show in terminal if possible
    try:
        plt.show()
    except:
        pass


def print_summary(df):
    """Print a text summary of the generated data."""
    print(f"\n📊 Dataset Summary")
    print(f"   Period:        {df['timestamp'].min()} → {df['timestamp'].max()}")
    print(f"   Data points:   {len(df):,}")
    print(f"   Interval:      {INTERVAL_MINUTES} min")
    print(f"\n   Zone 1 (Control):    mean={df['moisture_zone_1'].mean():.1f}%  "
          f"min={df['moisture_zone_1'].min():.0f}%  max={df['moisture_zone_1'].max():.0f}%")
    print(f"   Zone 2 (Stress):     mean={df['moisture_zone_2'].mean():.1f}%  "
          f"min={df['moisture_zone_2'].min():.0f}%  max={df['moisture_zone_2'].max():.0f}%")
    print(f"   Zone 3 (AI-Managed): mean={df['moisture_zone_3'].mean():.1f}%  "
          f"min={df['moisture_zone_3'].min():.0f}%  max={df['moisture_zone_3'].max():.0f}%")
    print(f"\n   Temperature:  mean={df['temperature_c'].mean():.1f}°C  "
          f"range={df['temperature_c'].min():.0f}–{df['temperature_c'].max():.0f}°C")
    print(f"   Humidity:     mean={df['humidity_perc'].mean():.1f}%  "
          f"range={df['humidity_perc'].min():.0f}–{df['humidity_perc'].max():.0f}%")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic FYP sensor data")
    parser.add_argument("--to-db", action="store_true", help="Insert into farm_data.db")
    parser.add_argument("--plot", action="store_true", help="Show visualization")
    args = parser.parse_args()
    
    print("🌱 Generating synthetic sensor data...")
    df = generate_dataset()
    
    save_csv(df)
    print_summary(df)
    
    if args.to_db:
        save_to_db(df)
    
    if args.plot:
        plot_data(df)
    
    print("\n💡 Next step: python3 train_model.py  (after we write it)")
