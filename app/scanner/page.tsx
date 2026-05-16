'use client';

/**
 * app/scanner/page.tsx
 * ---
 * Live Waste Scanner page — the core "Wow Factor" feature.
 * Orchestrates the camera stream, TF.js detection loop, and all UI overlays.
 * All inference runs 100% on-device via WebGPU/WebGL. Zero data egress.
 */

import React, { useEffect, useCallback, useState } from 'react';
import { Camera, CameraOff, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { BentoCard } from '@/components/ui/BentoCard';
import { CameraViewfinder } from '@/components/scanner/CameraViewfinder';
import { DetectionHUD } from '@/components/scanner/DetectionHUD';
import { ScannerLoadingState } from '@/components/scanner/ScannerLoadingState';
import { useCamera } from '@/hooks/useCamera';
import { useWasteDetector } from '@/hooks/useWasteDetector';
import type { WasteDetection } from '@/lib/wasteClassifier';
import { logWasteAction } from '@/app/actions/waste';

// ─── Scan Log Entry ───────────────────────────────────────────────────────────

interface ScanLogEntry extends WasteDetection {
  id: string;
  timestamp: Date;
}

const POINTS_MAP: Record<string, number> = {
  Plastic: 15,
  Paper: 20,
  Organic: 5,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScannerPage() {
  const [scanLog, setScanLog] = useState<ScanLogEntry[]>([]);
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());
  const [justLogged, setJustLogged] = useState(false);

  const { videoRef, isActive, isLoading: camLoading, error: camError, startCamera, stopCamera } = useCamera();
  const { detections, modelStatus, fps, backendName, error: modelError, isDetecting, startDetection, stopDetection } = useWasteDetector();

  const isModelReady = modelStatus === 'ready';
  const hasError = !!(camError || modelError);

  // Start detection once camera is active and model is ready
  useEffect(() => {
    if (isActive && isModelReady && videoRef.current) {
      startDetection(videoRef.current);
    } else {
      stopDetection();
    }
  }, [isActive, isModelReady, videoRef, startDetection, stopDetection]);

  // Auto-start camera when model is ready
  useEffect(() => {
    if (isModelReady) {
      startCamera();
    }
  }, [isModelReady, startCamera]);

  const handleToggleCamera = useCallback(() => {
    if (isActive) {
      stopDetection();
      stopCamera();
    } else {
      startCamera();
    }
  }, [isActive, startCamera, stopCamera, stopDetection]);

  const handleLogMaterial = useCallback(async (detection: WasteDetection, weight: number) => {
    const key = `${detection.class}-${Math.round(detection.score * 1000)}`;
    if (loggedIds.has(key)) return;

    const entry: ScanLogEntry = {
      ...detection,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
    };

    setScanLog((prev) => [entry, ...prev.slice(0, 11)]); // keep last 12
    setLoggedIds((prev) => new Set([...prev, key]));
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1500);

    try {
      await logWasteAction({
        category: detection.wasteCategory,
        weight: weight,
        aiConfidenceScore: detection.score,
      });
    } catch (err) {
      console.error('Failed to log to database:', err);
    }
  }, [loggedIds]);

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-on-surface mb-1">
            Material Classifier
          </h2>
          <p className="text-sm text-on-surface-variant">
            Real-time AI analysis · on-device · zero-egress
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Backend badge */}
          {backendName && backendName !== 'none' && (
            <div
              className="hidden md:flex items-center gap-2 py-1.5 px-3 rounded-full border font-jetbrains text-xs uppercase tracking-wider"
              style={{
                background: 'rgba(10,10,10,0.5)',
                borderColor: backendName === 'WebGPU' ? '#22C55E' : '#3B82F6',
                color: backendName === 'WebGPU' ? '#22C55E' : '#60A5FA',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: backendName === 'WebGPU' ? '#22C55E' : '#3B82F6' }}
              />
              {backendName} Accelerated
            </div>
          )}

          {/* Camera toggle */}
          <button
            onClick={handleToggleCamera}
            disabled={!isModelReady || camLoading}
            className="flex items-center gap-2 py-2 px-4 rounded-full border transition-all font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: isActive ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              borderColor: isActive ? '#EF4444' : '#22C55E',
              color: isActive ? '#EF4444' : '#22C55E',
            }}
          >
            {isActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {isActive ? 'Stop' : 'Start'} Camera
          </button>

          {process.env.NODE_ENV === 'development' && (
            <button
              id="simulate-scan-btn"
              onClick={() => handleLogMaterial({ class: 'bottle', wasteCategory: 'Plastic', wasteLabel: 'PET Bottle', score: 0.98, bbox: [0,0,0,0], color: '#22C55E' }, 0.5)}
              className="py-2 px-4 rounded-full border border-blue-500 text-blue-500 font-semibold text-sm bg-blue-500/10"
            >
              Simulate Scan
            </button>
          )}
        </div>
      </div>

      {/* ── Main Viewfinder ── */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border"
        style={{
          height: 'clamp(360px, 55vh, 640px)',
          background: '#050505',
          borderColor: isActive ? 'rgba(34,197,94,0.4)' : '#262626',
          boxShadow: isActive ? '0 0 40px rgba(34,197,94,0.08)' : 'none',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        {/* Camera feed + bounding boxes */}
        <CameraViewfinder
          videoRef={videoRef}
          detections={detections}
          isActive={isActive && isDetecting}
        />

        {/* Loading overlay */}
        {!isModelReady && !hasError && (
          <div className="absolute inset-0 z-30" style={{ background: '#0A0A0A' }}>
            <ScannerLoadingState
              modelStatus={modelStatus}
              backendName={backendName}
              error={modelError}
            />
          </div>
        )}

        {/* Camera permission / loading overlay */}
        {isModelReady && !isActive && !camLoading && !camError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(10,10,10,0.95)' }}>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-on-surface mb-1">Camera Ready</p>
              <p className="text-sm text-on-surface-variant">Click &quot;Start Camera&quot; to begin scanning</p>
            </div>
          </div>
        )}

        {/* Camera loading spinner */}
        {camLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: 'rgba(10,10,10,0.9)' }}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-jetbrains text-xs uppercase tracking-wider text-on-surface-variant">
                Requesting camera…
              </p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {(camError || modelError) && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 p-6 text-center" style={{ background: 'rgba(10,10,10,0.95)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              ⚠️
            </div>
            <div>
              <p className="text-base font-semibold text-on-surface mb-2">
                {camError ? 'Camera Access Error' : 'AI Model Error'}
              </p>
              <p className="text-sm text-on-surface-variant max-w-xs">{camError || modelError}</p>
            </div>
            {camError && (
              <button
                onClick={startCamera}
                className="bg-primary text-[#0A0A0A] font-bold py-2.5 px-8 rounded-xl hover:bg-primary-hover transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Detection HUD (layered above video, below error overlays) */}
        {isModelReady && (
          <DetectionHUD
            detections={detections}
            modelStatus={modelStatus}
            fps={fps}
            backendName={backendName}
            isDetecting={isDetecting}
            onLogMaterial={handleLogMaterial}
          />
        )}

        {/* Logged confirmation flash */}
        {justLogged && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
            <div
              className="flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-sm animate-bounce"
              style={{
                background: 'rgba(34,197,94,0.9)',
                color: '#0A0A0A',
                boxShadow: '0 0 30px rgba(34,197,94,0.5)',
              }}
            >
              <CheckCircle2 className="w-5 h-5" />
              Material Logged!
            </div>
          </div>
        )}
      </div>

      {/* ── Scan Log ── */}
      <BentoCard className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-on-surface">Scan Log</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {scanLog.length === 0 ? 'No items logged yet' : `${scanLog.length} item${scanLog.length !== 1 ? 's' : ''} this session`}
            </p>
          </div>
          <Link href="/inventory" className="font-jetbrains text-xs uppercase tracking-wider text-primary hover:underline">
            View All
          </Link>
        </div>

        {scanLog.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid #262626' }}
            >
              <LinkIcon className="w-6 h-6 text-on-surface-variant" />
            </div>
            <p className="text-sm text-on-surface-variant">
              Detected items you log will appear here
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: '#262626' }}>
            {scanLog.map((entry) => {
              const pts = POINTS_MAP[entry.wasteCategory] ?? 10;
              const color = entry.color;
              const emoji =
                entry.wasteCategory === 'Plastic' ? '♻️'
                : entry.wasteCategory === 'Paper' ? '📄'
                : entry.wasteCategory === 'Organic' ? '🌿'
                : '❓';

              return (
                <div
                  key={entry.id}
                  className="py-3 flex items-center justify-between gap-3 group px-1"
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${color}12`, border: `1px solid ${color}30` }}
                  >
                    {emoji}
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-on-surface text-sm truncate">{entry.wasteLabel}</p>
                    <p className="font-jetbrains text-[10px] uppercase tracking-wider mt-0.5" style={{ color }}>
                      {entry.wasteCategory} · {(entry as any).weight || 0}kg · {Math.round(entry.score * 100)}%
                    </p>
                  </div>

                  {/* Points + time */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-jetbrains text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#22C55E' }}
                    >
                      +{pts} pts
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </BentoCard>

    </div>
  );
}
