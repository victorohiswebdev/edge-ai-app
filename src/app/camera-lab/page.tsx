"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { captureSnapshot, fetchCaptures, fetchLatestPlantHealth } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";

interface CaptureItem {
  filename: string;
  timestamp: string;
  size_bytes: number;
}

interface ClassificationResult {
  classification: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export default function CameraLabPage() {
  const [capturing, setCapturing] = useState(false);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captures, setCaptures] = useState<CaptureItem[]>([]);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);

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
    setClassification(null);
    try {
      const blobUrl = await captureSnapshot();
      if (blobUrl) {
        setLatestImage(blobUrl);
        // Fetch the auto-classification result
        const health = await fetchLatestPlantHealth();
        if (health) {
          setClassification({
            classification: health.classification,
            confidence: health.confidence,
            probabilities: health.probabilities,
          });
        }
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
    <DashboardShell>
      <div className="space-y-8 p-6 md:p-10">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
              Camera Lab
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pi Camera Module — capture snapshots and plant health classification
            </p>
          </div>
        </header>

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

            {/* Classification result */}
            {classification && (
              <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                <h3 className="font-heading text-base font-bold text-foreground">
                  Plant Health Classification
                </h3>
                <div className="mt-4 flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black ${
                      classification.classification === "healthy"
                        ? "bg-green-100 text-green-700"
                        : classification.classification === "stressed"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {classification.classification === "healthy"
                      ? "✓"
                      : classification.classification === "stressed"
                      ? "!"
                      : "✗"}
                  </div>
                  <div>
                    <p
                      className={`text-xl font-black capitalize ${
                        classification.classification === "healthy"
                          ? "text-green-600"
                          : classification.classification === "stressed"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {classification.classification}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {(classification.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Confidence bars */}
                <div className="mt-4 space-y-2">
                  {Object.entries(classification.probabilities).map(([cls, prob]) => (
                    <div key={cls} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-medium capitalize text-muted-foreground">
                        {cls}
                      </span>
                      <div className="flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            cls === classification.classification
                              ? "bg-gradient-to-r from-primary to-emerald-400"
                              : "bg-muted-foreground/20"
                          }`}
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs font-bold tabular-nums text-card-foreground">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
      </div>
    </DashboardShell>
  );
}
