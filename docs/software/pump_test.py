#!/usr/bin/env python3
"""
pump_test.py — Send pump commands to Arduino and watch them respond.

Usage:
  python3 pump_test.py                    # Interactive mode
  python3 pump_test.py --zone 1 --on      # One-shot: turn Zone 1 ON
  python3 pump_test.py --zone 1 --off     # One-shot: turn Zone 1 OFF
  python3 pump_test.py --demo             # Full demo cycle
"""

import serial
import serial.tools.list_ports
import json
import time
import sys
import argparse


def find_arduino():
    ports = serial.tools.list_ports.comports()
    for pattern in ["/dev/ttyACM*", "/dev/ttyUSB*"]:
        import glob
        matches = glob.glob(pattern)
        if matches:
            return matches[0]
    return None


def send_command(arduino, command):
    """Send a JSON command and read the acknowledgment."""
    cmd_str = json.dumps(command) + "\n"
    arduino.write(cmd_str.encode())
    time.sleep(0.5)
    
    # Read the acknowledgment
    response = ""
    time.sleep(1)
    while arduino.in_waiting > 0:
        line = arduino.readline().decode("utf-8", errors="ignore").strip()
        if line:
            response += line + "\n"
    
    return response.strip()


def demo_cycle(arduino):
    """Run through all zones one by one."""
    print("\n🎬 Demo Cycle — Each pump runs for 3 seconds\n")
    
    for zone in [1, 2, 3]:
        print(f"  💧 Zone {zone} — ON")
        ack = send_command(arduino, {f"pump_{zone}": "ON"})
        print(f"     Arduino says: {ack}")
        time.sleep(3)
        
        print(f"  💧 Zone {zone} — OFF")
        ack = send_command(arduino, {f"pump_{zone}": "OFF"})
        print(f"     Arduino says: {ack}")
        time.sleep(1)
    
    # Emergency all-off
    print("  🛑 All pumps OFF")
    send_command(arduino, {"pump_all": "OFF"})
    print("✅ Demo complete!")


def main():
    parser = argparse.ArgumentParser(description="Pump Control Test")
    parser.add_argument("--zone", type=int, choices=[1, 2, 3], help="Zone to control")
    parser.add_argument("--on", action="store_true", help="Turn pump ON")
    parser.add_argument("--off", action="store_true", help="Turn pump OFF")
    parser.add_argument("--demo", action="store_true", help="Run demo cycle")
    parser.add_argument("--port", help="Serial port (default: auto-detect)")
    args = parser.parse_args()

    port = args.port or find_arduino()
    if not port:
        print("❌ Arduino not found.")
        sys.exit(1)

    try:
        arduino = serial.Serial(port, 9600, timeout=2)
        time.sleep(2)  # Let Arduino reset
        arduino.flush()
        print(f"✅ Connected to {port}")
    except Exception as e:
        print(f"❌ Failed: {e}")
        sys.exit(1)

    try:
        if args.demo:
            demo_cycle(arduino)
        elif args.zone and args.on:
            print(f"  💧 Zone {args.zone} — ON")
            ack = send_command(arduino, {f"pump_{args.zone}": "ON"})
            print(f"     {ack}")
        elif args.zone and args.off:
            print(f"  💧 Zone {args.zone} — OFF")
            ack = send_command(arduino, {f"pump_{args.zone}": "OFF"})
            print(f"     {ack}")
        else:
            # Interactive mode
            print("\nInteractive pump control. Commands:")
            print("  1on / 1off   — Zone 1")
            print("  2on / 2off   — Zone 2")
            print("  3on / 3off   — Zone 3")
            print("  alloff       — Emergency stop")
            print("  q            — Quit\n")
            
            while True:
                cmd = input("> ").strip().lower()
                if cmd == "q":
                    break
                elif cmd == "alloff":
                    ack = send_command(arduino, {"pump_all": "OFF"})
                    print(f"  🛑 {ack}")
                elif cmd == "1on":
                    ack = send_command(arduino, {"pump_1": "ON"})
                    print(f"  💧 {ack}")
                elif cmd == "1off":
                    ack = send_command(arduino, {"pump_1": "OFF"})
                    print(f"  ✅ {ack}")
                elif cmd == "2on":
                    ack = send_command(arduino, {"pump_2": "ON"})
                    print(f"  💧 {ack}")
                elif cmd == "2off":
                    ack = send_command(arduino, {"pump_2": "OFF"})
                    print(f"  ✅ {ack}")
                elif cmd == "3on":
                    ack = send_command(arduino, {"pump_3": "ON"})
                    print(f"  💧 {ack}")
                elif cmd == "3off":
                    ack = send_command(arduino, {"pump_3": "OFF"})
                    print(f"  ✅ {ack}")
                else:
                    print("  ❓ Unknown command")
    finally:
        arduino.close()


if __name__ == "__main__":
    main()
