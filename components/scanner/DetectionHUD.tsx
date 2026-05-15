/**
 * DetectionHUD.tsx
 * ---
 * Heads-Up Display overlay for the scanner.
 * Shows: FPS, active backend, model status, latest detection result,
 * category confidence bar, Log Material button, and privacy badge.
 */

'use client';

import React from 'react';
import { Cpu, Lock, Zap, PlusCircle, Wifi, WifiOff } from 'lucide-react';
import type { WasteDetection, ModelStatus } from '@/lib/wasteClassifier';

interface DetectionHUDProps {
  detections: WasteDetection[];
  modelStatus: ModelStatus;
  fps: number;
  backendName: string;
  isDetecting: boolean;
  onLogMaterial?: (detection: WasteDetection, weight: number) => void;
}

const CATEGORY_BG: Record<string, string> = {
  Plastic: 'rgba(34,197,94,0.12)',
  Paper: 'rgba(59,130,246,0.12)',
  Organic: 'rgba(245,158,11,0.12)',
  Unknown: 'rgba(107,114,128,0.12)',
};

const CATEGORY_BORDER: Record<string, string> = {
  Plastic: '#22C55E',
  Paper: '#3B82F6',
  Organic: '#F59E0B',
  Unknown: '#6B7280',
};

const CATEGORY_EMOJI: Record<string, string> = {
  Plastic: '♻️',
  Paper: '📄',
  Organic: '🌿',
  Unknown: '❓',
};

// Average densities (kg/m²) - purely for estimation based on screen area
const CATEGORY_DENSITY: Record<string, number> = {
  Plastic: 0.8,
  Paper: 0.5,
  Organic: 1.2,
  Unknown: 0.5
};

export function DetectionHUD({
  detections,
  modelStatus,
  fps,
  backendName,
  isDetecting,
  onLogMaterial,
}: DetectionHUDProps) {
  const [manualWeight, setManualWeight] = React.useState<number | null>(null);
  const topDetection = detections[0] ?? null;
  const confidence = topDetection ? Math.round(topDetection.score * 100) : 0;
  const isReady = modelStatus === 'ready';

  // Estimate weight based on bbox size and category density
  const getEstimatedWeight = React.useCallback((detection: WasteDetection) => {
    const [ymin, xmin, ymax, xmax] = detection.bbox;
    const area = (ymax - ymin) * (xmax - xmin); // Normalized area (0 to 1)
    const density = CATEGORY_DENSITY[detection.wasteCategory] || 0.5;
    // Base weight + area influence
    const estimated = 0.1 + (area * 2 * density);
    return parseFloat(estimated.toFixed(2));
  }, []);

  // Update manual weight when a new top detection appears
  React.useEffect(() => {
    if (topDetection) {
      setManualWeight(getEstimatedWeight(topDetection));
    } else {
      setManualWeight(null);
    }
  }, [topDetection?.class, topDetection?.wasteCategory, getEstimatedWeight]);

  return (
    <>
      {/* ── Top Bar HUD ── */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between z-20 pointer-events-none">

        {/* Left: Status pill */}
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md border text-xs font-jetbrains uppercase tracking-wider"
          style={{
            background: 'rgba(10,10,10,0.75)',
            borderColor: isDetecting ? '#22C55E' : '#404040',
            color: isDetecting ? '#22C55E' : '#6B7280',
          }}
        >
          {isDetecting ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live · {detections.length} object{detections.length !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              {modelStatus === 'idle' ? 'Standby' : modelStatus.replace('-', ' ')}
            </>
          )}
        </div>

        {/* Right: Metrics cluster */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* FPS badge */}
          {isDetecting && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-md border text-xs font-jetbrains tracking-wider"
              style={{ background: 'rgba(10,10,10,0.75)', borderColor: '#262626', color: '#e5e2e1' }}
            >
              <Zap className="w-3 h-3 text-primary" />
              {fps} fps
            </div>
          )}

          {/* Backend badge */}
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-md border text-xs font-jetbrains uppercase tracking-wider"
            style={{
              background: 'rgba(10,10,10,0.75)',
              borderColor: backendName === 'WebGPU' ? '#22C55E' : '#3B82F6',
              color: backendName === 'WebGPU' ? '#22C55E' : '#60A5FA',
            }}
          >
            <Cpu className="w-3 h-3" />
            {backendName || 'Loading…'}
          </div>
        </div>
      </div>

      {/* ── Bottom Results Panel ── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        {/* Privacy Badge */}
        <div className="flex justify-center mb-3">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-jetbrains uppercase tracking-wider"
            style={{
              background: 'rgba(10,10,10,0.6)',
              border: '1px solid #262626',
              color: '#6B7280',
            }}
          >
            <Lock className="w-2.5 h-2.5" />
            Zero-egress · 100% on-device · No data sent
          </div>
        </div>

        {/* Detection Result Card */}
        {topDetection && isDetecting ? (
          <div
            className="w-full max-w-md mx-auto rounded-2xl p-4 backdrop-blur-xl border"
            style={{
              background: CATEGORY_BG[topDetection.wasteCategory] ?? 'rgba(10,10,10,0.85)',
              borderColor: CATEGORY_BORDER[topDetection.wasteCategory] ?? '#262626',
              boxShadow: `0 0 40px ${CATEGORY_BORDER[topDetection.wasteCategory]}22`,
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">
                  {CATEGORY_EMOJI[topDetection.wasteCategory]}
                </span>
                <div>
                  <h3 className="text-base font-bold text-on-surface leading-tight">
                    {topDetection.wasteLabel}
                  </h3>
                  <p
                    className="font-jetbrains text-[10px] uppercase tracking-wider mt-0.5"
                    style={{ color: CATEGORY_BORDER[topDetection.wasteCategory] }}
                  >
                    {topDetection.wasteCategory} · {topDetection.class}
                  </p>
                </div>
              </div>

              {/* Recyclable badge */}
              <div
                className="rounded px-2 py-1 font-jetbrains text-[9px] uppercase font-bold tracking-widest border"
                style={{
                  background: `${CATEGORY_BORDER[topDetection.wasteCategory]}1A`,
                  borderColor: CATEGORY_BORDER[topDetection.wasteCategory],
                  color: CATEGORY_BORDER[topDetection.wasteCategory],
                }}
              >
                {topDetection.wasteCategory === 'Organic' ? 'Compost' : 'Recyclable'}
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center font-jetbrains text-[10px] uppercase tracking-wider mb-1.5">
                <span className="text-on-surface-variant">Confidence</span>
                <span className="font-bold" style={{ color: CATEGORY_BORDER[topDetection.wasteCategory] }}>
                  {confidence}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: '#1C1C1C', border: '1px solid #262626' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${confidence}%`,
                    background: CATEGORY_BORDER[topDetection.wasteCategory],
                    boxShadow: `0 0 8px ${CATEGORY_BORDER[topDetection.wasteCategory]}`,
                  }}
                />
              </div>
            </div>

            {/* Weight Adjustment Panel */}
            <div className="bg-background/40 border border-[#262626] rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-jetbrains text-[10px] uppercase text-on-surface-variant font-bold">Weight (kg)</span>
                <input 
                  type="number"
                  value={manualWeight || 0}
                  step="0.01"
                  onChange={(e) => setManualWeight(parseFloat(e.target.value))}
                  className="bg-transparent text-right font-bold text-on-surface focus:outline-none w-20"
                />
              </div>
              <input 
                type="range"
                min="0.05"
                max="5.00"
                step="0.05"
                value={manualWeight || 0.5}
                onChange={(e) => setManualWeight(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-1 text-[8px] font-jetbrains text-on-surface-variant/50 uppercase">
                <span>0.05kg</span>
                <span>Adjust manually</span>
                <span>5kg</span>
              </div>
            </div>

            {/* All detections summary (if more than 1) */}
            {detections.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {detections.slice(1, 4).map((d, i) => (
                  <span
                    key={i}
                    className="font-jetbrains text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: `${CATEGORY_BORDER[d.wasteCategory]}15`,
                      border: `1px solid ${CATEGORY_BORDER[d.wasteCategory]}40`,
                      color: CATEGORY_BORDER[d.wasteCategory],
                    }}
                  >
                    {d.wasteLabel} {Math.round(d.score * 100)}%
                  </span>
                ))}
              </div>
            )}

            {/* Log Material CTA */}
            <button
              onClick={() => onLogMaterial?.(topDetection, manualWeight || 0)}
              className="w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: CATEGORY_BORDER[topDetection.wasteCategory],
                color: '#0A0A0A',
              }}
            >
              <PlusCircle className="w-4 h-4" />
              Log {manualWeight?.toFixed(2)} kg
            </button>
          </div>
        ) : isReady && isDetecting ? (
          /* No detection — waiting state */
          <div
            className="w-full max-w-md mx-auto rounded-2xl p-4 backdrop-blur-xl border text-center"
            style={{ background: 'rgba(10,10,10,0.8)', borderColor: '#262626' }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-primary animate-pulse" />
              <p className="font-jetbrains text-xs uppercase tracking-wider text-on-surface-variant">
                Scanning for waste…
              </p>
            </div>
            <p className="text-[10px] text-on-surface-variant/50">
              Point camera at plastic, paper, or organic waste
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
