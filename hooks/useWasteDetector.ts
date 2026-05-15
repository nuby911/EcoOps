/**
 * useWasteDetector.ts
 * ---
 * Custom React hook that manages the TF.js waste detection loop.
 * - Initializes the classifier on mount.
 * - Runs requestAnimationFrame-based detection against the video element.
 * - Exposes detections, FPS, model status, and backend info.
 * - Handles cleanup on unmount.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  initClassifier,
  detectWaste,
  getBackendName,
  disposeClassifier,
  type WasteDetection,
  type ModelStatus,
} from '@/lib/wasteClassifier';
import { useSettings } from '@/components/providers/SettingsProvider';

export interface UseWasteDetectorReturn {
  /** Current detections from the latest frame */
  detections: WasteDetection[];
  /** Model loading/init status */
  modelStatus: ModelStatus;
  /** Current inference FPS */
  fps: number;
  /** Active TF.js backend name */
  backendName: string;
  /** Error message if something went wrong */
  error: string | null;
  /** Whether detection loop is actively running */
  isDetecting: boolean;
  /** Start the detection loop */
  startDetection: (video: HTMLVideoElement) => void;
  /** Stop the detection loop */
  stopDetection: () => void;
}

export function useWasteDetector(): UseWasteDetectorReturn {
  const [detections, setDetections] = useState<WasteDetection[]>([]);
  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
  const [fps, setFps] = useState(0);
  const [backendName, setBackendName] = useState('none');
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const animFrameRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isRunningRef = useRef(false);
  const fpsTimestamps = useRef<number[]>([]);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize the classifier once
  useEffect(() => {
    if (initPromiseRef.current) return;

    initPromiseRef.current = initClassifier((status) => {
      setModelStatus(status);
    })
      .then(() => {
        setBackendName(getBackendName());
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to initialize classifier.');
      });

    return () => {
      // Dispose on unmount
      isRunningRef.current = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      disposeClassifier();
    };
  }, []);

  const { aiConfidenceThreshold } = useSettings();

  // Detection loop
  const runDetectionLoop = useCallback(async function loop() {
    if (!isRunningRef.current || !videoRef.current) return;

    const video = videoRef.current;

    // Skip if video isn't ready
    if (video.readyState < 2 || video.paused || video.ended) {
      animFrameRef.current = requestAnimationFrame(loop);
      return;
    }

    try {
      const results = await detectWaste(video, {
        maxDetections: 10,
        scoreThreshold: aiConfidenceThreshold,
        includeUnknown: false,
      });

      if (isRunningRef.current) {
        setDetections(results);
      }
    } catch (err) {
      // Don't spam errors on every frame — just log once
      console.warn('[useWasteDetector] Detection error:', err);
    }

    // FPS calculation (rolling window of last 30 frames)
    const now = performance.now();
    fpsTimestamps.current.push(now);
    if (fpsTimestamps.current.length > 30) {
      fpsTimestamps.current.shift();
    }
    if (fpsTimestamps.current.length > 1) {
      const elapsed =
        fpsTimestamps.current[fpsTimestamps.current.length - 1] - fpsTimestamps.current[0];
      const avgFps = ((fpsTimestamps.current.length - 1) / elapsed) * 1000;
      setFps(Math.round(avgFps));
    }

    // Schedule next frame
    if (isRunningRef.current) {
      animFrameRef.current = requestAnimationFrame(loop);
    }
  }, [aiConfidenceThreshold]);

  const startDetection = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video;
      isRunningRef.current = true;
      setIsDetecting(true);
      fpsTimestamps.current = [];
      runDetectionLoop();
    },
    [runDetectionLoop]
  );

  const stopDetection = useCallback(() => {
    isRunningRef.current = false;
    setIsDetecting(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setDetections([]);
    setFps(0);
  }, []);

  return {
    detections,
    modelStatus,
    fps,
    backendName,
    error,
    isDetecting,
    startDetection,
    stopDetection,
  };
}
