"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { captureSnapshot, fetchCaptures } from "@/lib/api";

interface CaptureItem {
  filename: string;
  timestamp: string;
  size_bytes: number;
}

export default function CameraLabPage() {
  const [capturing, setCapturing] = useState(false);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captures, setCaptures] = useState<CaptureItem[]>([]);

  const loadCaptures = useCallback(async () => {
    const result = await fetchCaptures(5);
    if (result) setCaptures(result.captures);
  }, []);

  useEffect(() => {
    loadCaptures();
  }, [loadCaptures]);

  const handleCapture = useCallback(async () => {
    setCapturing(true);
    setError(null);
    try {
      const blobUrl = await captureSnapshot();
      if (blobUrl) {
        setLatestImage(blobUrl);
        await loadCaptures();
      } else {
        setError("Capture failed — check camera connection");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setCapturing(false);
    }
  }, [loadCaptures]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Camera Lab
            </h1>
            <p className="text-xs text-muted-foreground">
              Pi Camera Module — test snapshots and inspection
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-6 py-8">
        {/* Capture button */}
        <section>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCapture}
              disabled={capturing}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {capturing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Capturing...
                </>
              ) : (
                <>
                  <span className="text-lg">📷</span>
                  Take Snapshot
                </>
              )}
            </button>
            {error && (
              <span className="rounded-xl bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive">
                {error}
              </span>
            )}
          </div>
        </section>

        {/* Latest capture */}
        {latestImage && (
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Latest Capture
            </h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={latestImage}
                alt="Latest camera capture"
                className="w-full max-w-2xl object-contain"
              />
            </div>
          </section>
        )}

        {/* Capture history */}
        {captures.length > 0 && (
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Recent Captures
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {captures.map((cap) => (
                <div
                  key={cap.filename}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="space-y-0.5 p-2.5">
                    <p className="truncate text-[10px] font-medium text-foreground">
                      {cap.filename}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatSize(cap.size_bytes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Camera info */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-sm font-bold text-foreground">
            Camera Info
          </h2>
          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <p>Sensor: OV5647 (Pi Camera Module V2)</p>
            <p>Resolution: 640 × 480 (preview config)</p>
            <p>Interface: CSI-2 via libcamera + picamera2</p>
            <p>Capture method: picamera2 → JPEG</p>
          </div>
        </section>
      </main>
    </div>
  );
}
