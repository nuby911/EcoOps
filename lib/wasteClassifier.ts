/**
 * wasteClassifier.ts
 * ---
 * Core engine for browser-based waste detection.
 * - Initializes TensorFlow.js with WebGPU backend (falls back to WebGL).
 * - Loads COCO-SSD (MobileNetV2) object detection model.
 * - Maps COCO object labels → Waste categories (Plastic, Paper, Organic).
 * - Zero-egress: all inference runs on-device in the browser.
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';
import type { ObjectDetection, DetectedObject } from '@tensorflow-models/coco-ssd';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WasteCategory = 'Plastic' | 'Paper' | 'Organic' | 'Unknown';

export interface WasteDetection {
  /** Original COCO label (e.g. "bottle") */
  class: string;
  /** Mapped waste category */
  wasteCategory: WasteCategory;
  /** Human-friendly label (e.g. "PET Bottle") */
  wasteLabel: string;
  /** Confidence score 0–1 */
  score: number;
  /** Bounding box [x, y, width, height] in pixels */
  bbox: [number, number, number, number];
  /** Color hex for bounding box rendering */
  color: string;
}

export type ModelStatus =
  | 'idle'
  | 'initializing-backend'
  | 'loading-model'
  | 'warming-up'
  | 'ready'
  | 'error';

// ─── COCO → Waste Mapping ─────────────────────────────────────────────────────

interface WasteMapping {
  category: WasteCategory;
  label: string;
}

const CATEGORY_COLORS: Record<WasteCategory, string> = {
  Plastic: '#22C55E',  // Primary green
  Paper: '#3B82F6',    // Blue
  Organic: '#F59E0B',  // Amber
  Unknown: '#6B7280',  // Gray
};

/**
 * Map from COCO-SSD class name → waste category + human-readable label.
 * Only classes relevant to waste/recyclable detection are included.
 */
const COCO_TO_WASTE: Record<string, WasteMapping> = {
  // Plastic
  bottle: { category: 'Plastic', label: 'PET Bottle' },
  cup: { category: 'Plastic', label: 'Plastic Cup' },
  'wine glass': { category: 'Plastic', label: 'Plastic Glass' },
  cell_phone: { category: 'Plastic', label: 'Electronic Waste' },
  'cell phone': { category: 'Plastic', label: 'Electronic Waste' },
  remote: { category: 'Plastic', label: 'Plastic Remote' },
  mouse: { category: 'Plastic', label: 'Electronic Waste' },
  keyboard: { category: 'Plastic', label: 'Electronic Waste' },
  toothbrush: { category: 'Plastic', label: 'Plastic Toothbrush' },
  laptop: { category: 'Plastic', label: 'Electronic Waste' },
  scissors: { category: 'Plastic', label: 'Plastic Waste' },
  'hair drier': { category: 'Plastic', label: 'Electronic Waste' },
  // Paper
  book: { category: 'Paper', label: 'Paper Book' },
  suitcase: { category: 'Paper', label: 'Cardboard Case' },
  backpack: { category: 'Paper', label: 'Textile / Paper' },
  // Organic
  banana: { category: 'Organic', label: 'Organic — Banana' },
  apple: { category: 'Organic', label: 'Organic — Apple' },
  orange: { category: 'Organic', label: 'Organic — Orange' },
  broccoli: { category: 'Organic', label: 'Organic — Broccoli' },
  carrot: { category: 'Organic', label: 'Organic — Carrot' },
  sandwich: { category: 'Organic', label: 'Organic — Food Waste' },
  'hot dog': { category: 'Organic', label: 'Organic — Food Waste' },
  pizza: { category: 'Organic', label: 'Organic — Food Waste' },
  donut: { category: 'Organic', label: 'Organic — Food Waste' },
  cake: { category: 'Organic', label: 'Organic — Food Waste' },
  'potted plant': { category: 'Organic', label: 'Organic — Plant' },
  bowl: { category: 'Organic', label: 'Organic — Food Container' },
  spoon: { category: 'Plastic', label: 'Plastic Utensil' },
  fork: { category: 'Plastic', label: 'Plastic Utensil' },
  knife: { category: 'Plastic', label: 'Plastic Utensil' },
};

// ─── Classifier Singleton ─────────────────────────────────────────────────────

let model: ObjectDetection | null = null;
let backendName: string = 'none';
let currentStatus: ModelStatus = 'idle';

/**
 * Initialize TensorFlow.js backend and load the COCO-SSD model.
 * Tries WebGPU first, falls back to WebGL if unavailable.
 */
export async function initClassifier(
  onStatusChange?: (status: ModelStatus) => void
): Promise<void> {
  if (model) return; // Already initialized

  const setStatus = (s: ModelStatus) => {
    currentStatus = s;
    onStatusChange?.(s);
  };

  try {
    // ── Step 1: Initialize GPU Backend ──
    setStatus('initializing-backend');

    let gpuReady = false;

    // Try WebGPU first
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      try {
        await tf.setBackend('webgpu');
        await tf.ready();
        gpuReady = true;
        backendName = 'WebGPU';
      } catch {
        console.warn('[WasteClassifier] WebGPU init failed, falling back to WebGL.');
      }
    }

    // Fallback to WebGL
    if (!gpuReady) {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        backendName = 'WebGL';
      } catch {
        // Last resort: CPU
        await tf.setBackend('cpu');
        await tf.ready();
        backendName = 'CPU';
      }
    }

    console.log(`[WasteClassifier] Backend: ${backendName} (${tf.getBackend()})`);

    // ── Step 2: Load COCO-SSD Model ──
    setStatus('loading-model');

    // Dynamic import to keep it client-side only
    const cocoSsd = await import('@tensorflow-models/coco-ssd');
    model = await cocoSsd.load({
      base: 'lite_mobilenet_v2', // Smallest/fastest model variant
    });

    console.log('[WasteClassifier] COCO-SSD model loaded.');

    // ── Step 3: Warm up with a dummy tensor ──
    setStatus('warming-up');
    const dummyImg = tf.zeros([300, 300, 3], 'int32') as tf.Tensor3D;
    await model.detect(dummyImg);
    dummyImg.dispose();

    console.log('[WasteClassifier] Model warmed up. Ready for inference.');
    setStatus('ready');
  } catch (err) {
    console.error('[WasteClassifier] Initialization failed:', err);
    setStatus('error');
    throw err;
  }
}

/**
 * Run object detection on a video element and return mapped waste detections.
 * Only returns objects that match a known waste category (filters out Unknown by default).
 */
export async function detectWaste(
  video: HTMLVideoElement,
  options: { maxDetections?: number; scoreThreshold?: number; includeUnknown?: boolean } = {}
): Promise<WasteDetection[]> {
  if (!model) {
    throw new Error('[WasteClassifier] Model not initialized. Call initClassifier() first.');
  }

  const { maxDetections = 10, scoreThreshold = 0.45, includeUnknown = false } = options;

  // Manually convert video to tensor and ensure it's int32
    // Some model variants (like lite_mobilenet_v2) specifically require int32
    const imgTensor = tf.browser.fromPixels(video) as tf.Tensor3D;
    const predictions: DetectedObject[] = await model.detect(imgTensor, maxDetections);
    imgTensor.dispose();

  const detections: WasteDetection[] = predictions
    .filter((p) => p.score >= scoreThreshold)
    .map((p) => {
      const mapping = COCO_TO_WASTE[p.class];
      const category: WasteCategory = mapping?.category ?? 'Unknown';
      const label = mapping?.label ?? p.class;

      return {
        class: p.class,
        wasteCategory: category,
        wasteLabel: label,
        score: p.score,
        bbox: p.bbox as [number, number, number, number],
        color: CATEGORY_COLORS[category],
      };
    })
    .filter((d) => includeUnknown || d.wasteCategory !== 'Unknown');

  return detections;
}

/** Get the currently active TF.js backend name. */
export function getBackendName(): string {
  return backendName;
}

/** Get the current model status. */
export function getModelStatus(): ModelStatus {
  return currentStatus;
}

/** Dispose model and free GPU memory. */
export function disposeClassifier(): void {
  if (model) {
    model.dispose();
    model = null;
    currentStatus = 'idle';
    console.log('[WasteClassifier] Model disposed.');
  }
}
