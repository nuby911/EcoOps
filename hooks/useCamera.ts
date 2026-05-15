/**
 * useCamera.ts
 * ---
 * Custom React hook for WebRTC camera access.
 * Requests the rear-facing (environment) camera for mobile waste scanning.
 * Handles permissions, stream lifecycle, and cleanup.
 */

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export interface UseCameraReturn {
  /** Ref to attach to <video> element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Whether the camera stream is active */
  isActive: boolean;
  /** Whether we're waiting for permission / stream */
  isLoading: boolean;
  /** Error message if camera access failed */
  error: string | null;
  /** Whether the scanner is in cooldown mode */
  isCooldown: boolean;
  /** Start the camera stream */
  startCamera: () => Promise<void>;
  /** Stop the camera stream */
  stopCamera: () => void;
  /** Start cooldown timer */
  triggerCooldown: (seconds: number) => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCooldown, setIsCooldown] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const triggerCooldown = useCallback((seconds: number) => {
    setIsCooldown(true);
    setTimeout(() => {
      setIsCooldown(false);
    }, seconds * 1000);
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Stop any existing stream
    stopCamera();

    try {
      // Check for getUserMedia support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for the video to be ready to play
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          video.onloadedmetadata = () => {
            video.play().then(resolve).catch(reject);
          };
          video.onerror = () => reject(new Error('Video element failed to load.'));
        });

        setIsActive(true);
      }
    } catch (err) {
      const message =
        err instanceof DOMException
          ? err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please enable camera access in browser settings.'
            : err.name === 'NotFoundError'
              ? 'No camera found on this device.'
              : err.name === 'NotReadableError'
                ? 'Camera is in use by another application.'
                : `Camera error: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'An unknown error occurred accessing the camera.';

      setError(message);
      console.error('[useCamera]', err);
    } finally {
      setIsLoading(false);
    }
  }, [stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    isLoading,
    error,
    isCooldown,
    startCamera,
    stopCamera,
    triggerCooldown,
  };
}
