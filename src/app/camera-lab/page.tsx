"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { captureSnapshot, fetchCaptures, fetchLatestPlantHealth, classifyCapture } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import type { SnapshotResult } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

type ClassifyStatus = "idle" | "pending" | "success" | "error";

const CLASSIFICATION_COLORS: Record<string, { icon: string; bg: string; text: string }> = {
  healthy: { icon: "✓", bg: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", text: "text-green-600 dark:text-green-400" },
  stressed: { icon: "!", bg: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", text: "text-amber-600 dark:text-amber-400" },
  wilted: { icon: "✗", bg: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", text: "text-red-600 dark:text-red-400" },
};

function ClassificationPanel({
  result,
  error,
  status,
  onRetry,
}: {
  result: ClassificationResult | null;
  error: string | null;
  status: ClassifyStatus;
  onRetry?: () => void;
}) {
  if (status === "pending") {
    return (
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Classifying plant health...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-200 text-sm font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-200">
              !
            </span>
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-200">Classification unavailable</p>
              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                {error || "TFLite model could not classify this image. Check the server logs for details."}
              </p>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (status === "success" && result) {
    const colors = CLASSIFICATION_COLORS[result.classification] || CLASSIFICATION_COLORS.healthy;
    return (
      <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-bold text-foreground">Plant Health Classification</h3>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            CNN — MobileNetV2
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black ${colors.bg}`}>
            {colors.icon}
          </div>
          <div>
            <p className={`text-xl font-black capitalize ${colors.text}`}>
              {result.classification}
            </p>
            <p className="text-sm text-muted-foreground">
              Confidence: <span className="font-bold text-card-foreground">{(result.confidence * 100).toFixed(1)}%</span>
            </p>
          </div>
        </div>

        {/* Probability bars */}
        <div className="mt-4 space-y-2">
          {Object.entries(result.probabilities).map(([cls, prob]) => {
            const barColors: Record<string, string> = {
              healthy: "from-green-500 to-emerald-400",
              stressed: "from-amber-500 to-yellow-400",
              wilted: "from-red-500 to-rose-400",
            };
            return (
              <div key={cls} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium capitalize text-muted-foreground">{cls}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${
                      cls === result.classification
                        ? `bg-gradient-to-r ${barColors[cls] || "from-primary to-emerald-400"}`
                        : "bg-muted-foreground/20"
                    }`}
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs font-bold tabular-nums text-card-foreground">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

function CaptureThumbnail({ filename }: { filename: string }) {
  const imgUrl = `${API_BASE}/api/v1/camera/captures/${encodeURIComponent(filename)}`;
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className="aspect-[4/3] overflow-hidden bg-muted">
      {!errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgUrl}
          alt={filename}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-2xl text-muted-foreground/40">📷</span>
        </div>
      )}
      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-5 w-5 animate-pulse rounded-full bg-muted-foreground/20" />
        </div>
      )}
    </div>
  );
}

function getCaptureDimensions(sizeBytes: number): string {
  if (sizeBytes < 50_000) return "480p";
  if (sizeBytes < 150_000) return "720p";
  if (sizeBytes < 500_000) return "1080p";
  return "Raw";
}

export default function CameraLabPage() {
  const [capturing, setCapturing] = useState(false);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captures, setCaptures] = useState<CaptureItem[]>([]);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [classifyStatus, setClassifyStatus] = useState<ClassifyStatus>("idle");
  const [classifyError, setClassifyError] = useState<string | null>(null);

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
    setClassifyStatus("idle");
    setClassifyError(null);

    try {
      const result = await captureSnapshot();
      if (result) {
        setLatestImage(result.blobUrl);

        if (result.classification) {
          // Snapshot returned classification in headers — fetch full details
          setClassifyStatus("pending");
          const health = await fetchLatestPlantHealth();
          if (health) {
            setClassification({
              classification: health.classification,
              confidence: health.confidence,
              probabilities: health.probabilities,
            });
            setClassifyStatus("success");
          } else {
            // Classification was done but we couldn't fetch details
            setClassification({
              classification: result.classification,
              confidence: result.confidence ?? 0,
              probabilities: {},
            });
            setClassifyStatus("success");
          }
        } else if (result.classificationError) {
          setClassifyStatus("error");
          setClassifyError(result.classificationError);
        } else {
          // No classification info at all — model likely not loaded
          setClassifyStatus("error");
          setClassifyError("TFLite model not available. Ensure tflite-runtime is installed.");
        }

        await loadCaptures();
      } else {
        setError("Capture failed — check camera connection");
      }
    } catch {
      setError("Something went wrong during capture");
    } finally {
      setCapturing(false);
    }
  }, [loadCaptures]);

  const handleReclassify = useCallback(async () => {
    if (captures.length === 0) return;
    setClassifyStatus("pending");
    setClassifyError(null);

    // Re-classify the latest capture by filename
    const latest = captures[0];
    const result = await classifyCapture(latest.filename);
    if (result) {
      const health = await fetchLatestPlantHealth();
      if (health) {
        setClassification({
          classification: health.classification,
          confidence: health.confidence,
          probabilities: health.probabilities,
        });
        setClassifyStatus("success");
      } else {
        setClassifyStatus("error");
        setClassifyError("Classification ran but result not found in database.");
      }
    } else {
      setClassifyStatus("error");
      setClassifyError("Classification still unavailable. Check server logs.");
    }
  }, [captures]);

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
          <div className="flex flex-wrap items-center gap-4">
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
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                {error}
              </span>
            )}
            {classifyStatus === "error" && captures.length > 0 && (
              <button
                onClick={handleReclassify}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                ⟳ Retry Classification
              </button>
            )}
          </div>
        </section>

        {/* Latest capture + classification */}
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

            {/* Classification panel */}
            <ClassificationPanel
              result={classification}
              error={classifyError}
              status={classifyStatus}
              onRetry={handleReclassify}
            />
          </section>
        )}

        {/* Capture history with thumbnails */}
        {captures.length > 0 && (
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Recent Captures
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {captures.map((cap) => (
                <a
                  key={cap.filename}
                  href={`${API_BASE}/api/v1/camera/captures/${encodeURIComponent(cap.filename)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  <CaptureThumbnail filename={cap.filename} />
                  <div className="space-y-0.5 p-2.5">
                    <p className="truncate text-[10px] font-medium text-foreground">
                      {cap.filename}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">
                        {formatSize(cap.size_bytes)}
                      </p>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                        {getCaptureDimensions(cap.size_bytes)}
                      </span>
                    </div>
                  </div>
                </a>
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
            <p>Classification: MobileNetV2 (TFLite) — auto-classify on capture</p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
