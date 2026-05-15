/**
 * CameraViewfinder.tsx
 * ---
 * Renders the live camera feed with an overlaid <canvas> for drawing
 * real-time bounding boxes around detected waste items.
 * Uses category-specific colors with glow effects for a premium HUD feel.
 */

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { WasteDetection } from '@/lib/wasteClassifier';

interface CameraViewfinderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detections: WasteDetection[];
  isActive: boolean;
}

/** Hex color to rgba string */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function CameraViewfinder({ videoRef, detections, isActive }: CameraViewfinderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Sync canvas dimensions to video's natural resolution */
  const syncCanvasSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;
  }, [videoRef]);

  /** Draw bounding boxes on canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    syncCanvasSize();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isActive || detections.length === 0) return;

    // Scale factor: video resolution vs display size
    const scaleX = canvas.width / (video.videoWidth || 1);
    const scaleY = canvas.height / (video.videoHeight || 1);

    detections.forEach((det) => {
      const [x, y, w, h] = det.bbox;
      const sx = x * scaleX;
      const sy = y * scaleY;
      const sw = w * scaleX;
      const sh = h * scaleY;
      const radius = 8;
      const confidence = Math.round(det.score * 100);

      // ── Glow effect ──
      ctx.shadowColor = det.color;
      ctx.shadowBlur = 16;

      // ── Bounding box with rounded corners ──
      ctx.strokeStyle = det.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, radius);
      ctx.stroke();

      // Reset shadow for fill operations
      ctx.shadowBlur = 0;

      // ── Semi-transparent fill ──
      ctx.fillStyle = hexToRgba(det.color, 0.08);
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, radius);
      ctx.fill();

      // ── Label background ──
      const labelText = `${det.wasteLabel}  ${confidence}%`;
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      const textMetrics = ctx.measureText(labelText);
      const labelPadX = 10;
      const labelPadY = 6;
      const labelH = 24;
      const labelW = textMetrics.width + labelPadX * 2;
      const labelX = sx;
      const labelY = sy > labelH + 4 ? sy - labelH - 4 : sy + sh + 4;

      // Pill-shaped label background
      ctx.fillStyle = hexToRgba(det.color, 0.9);
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelW, labelH, 6);
      ctx.fill();

      // Label text
      ctx.fillStyle = '#0A0A0A';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, labelX + labelPadX, labelY + labelH / 2);

      // ── Corner brackets (accent) ──
      const cornerLen = Math.min(20, sw * 0.2, sh * 0.2);
      ctx.strokeStyle = det.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = det.color;
      ctx.shadowBlur = 10;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(sx, sy + cornerLen);
      ctx.lineTo(sx, sy);
      ctx.lineTo(sx + cornerLen, sy);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(sx + sw - cornerLen, sy);
      ctx.lineTo(sx + sw, sy);
      ctx.lineTo(sx + sw, sy + cornerLen);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(sx, sy + sh - cornerLen);
      ctx.lineTo(sx, sy + sh);
      ctx.lineTo(sx + cornerLen, sy + sh);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(sx + sw - cornerLen, sy + sh);
      ctx.lineTo(sx + sw, sy + sh);
      ctx.lineTo(sx + sw, sy + sh - cornerLen);
      ctx.stroke();

      ctx.shadowBlur = 0;
    });
  }, [detections, isActive, videoRef, syncCanvasSize]);

  // Resync on window resize
  useEffect(() => {
    const handleResize = () => syncCanvasSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [syncCanvasSize]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#050505] overflow-hidden">
      {/* Live Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(1)' }}
      />

      {/* Detection Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: 'cover' }}
      />

      {/* Scan Line Animation */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute left-0 w-full h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #22C55E 50%, transparent 100%)',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.6), 0 0 60px rgba(34, 197, 94, 0.2)',
              animation: 'scanline 2.5s ease-in-out infinite alternate',
            }}
          />
        </div>
      )}

      {/* Viewfinder Grid Lines */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Rule of thirds - horizontal */}
          <div className="absolute top-1/3 left-0 w-full h-px bg-white/5" />
          <div className="absolute top-2/3 left-0 w-full h-px bg-white/5" />
          {/* Rule of thirds - vertical */}
          <div className="absolute left-1/3 top-0 h-full w-px bg-white/5" />
          <div className="absolute left-2/3 top-0 h-full w-px bg-white/5" />
        </div>
      )}

      {/* CSS Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { top: 5%; }
          100% { top: 95%; }
        }
      `}} />
    </div>
  );
}
