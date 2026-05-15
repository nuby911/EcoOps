/**
 * ScannerLoadingState.tsx
 * ---
 * Beautiful loading screen shown while TF.js + COCO-SSD model initializes.
 * Displays animated progress with status messages that match the init phases.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, Layers, Zap, CheckCircle2 } from 'lucide-react';
import type { ModelStatus } from '@/lib/wasteClassifier';

interface ScannerLoadingStateProps {
  modelStatus: ModelStatus;
  backendName: string;
  error: string | null;
  onRetry?: () => void;
}

interface StatusStep {
  key: ModelStatus | 'done';
  icon: React.ElementType;
  label: string;
  sublabel: string;
}

const STEPS: StatusStep[] = [
  {
    key: 'initializing-backend',
    icon: Cpu,
    label: 'Initializing GPU Backend',
    sublabel: 'Requesting WebGPU / WebGL access…',
  },
  {
    key: 'loading-model',
    icon: Layers,
    label: 'Loading AI Model',
    sublabel: 'Downloading COCO-SSD (MobileNetV2)…',
  },
  {
    key: 'warming-up',
    icon: Zap,
    label: 'Warming Up',
    sublabel: 'Running first inference pass…',
  },
  {
    key: 'done',
    icon: CheckCircle2,
    label: 'Ready',
    sublabel: 'All systems online',
  },
];

function getStepIndex(status: ModelStatus): number {
  if (status === 'initializing-backend') return 0;
  if (status === 'loading-model') return 1;
  if (status === 'warming-up') return 2;
  if (status === 'ready') return 3;
  return -1;
}

export function ScannerLoadingState({
  modelStatus,
  backendName,
  error,
  onRetry,
}: ScannerLoadingStateProps) {
  const [dots, setDots] = useState('');
  const activeStepIdx = getStepIndex(modelStatus);

  // Animated ellipsis
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(id);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          ⚠️
        </div>
        <div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">Scanner Initialization Failed</h3>
          <p className="text-sm text-on-surface-variant max-w-xs">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-primary text-[#0A0A0A] font-bold py-2.5 px-8 rounded-xl hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8 select-none">
      {/* Animated ring */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Spinning outer ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: '2s' }}
          viewBox="0 0 96 96"
          fill="none"
        >
          <circle
            cx="48" cy="48" r="44"
            stroke="rgba(34,197,94,0.15)"
            strokeWidth="2"
          />
          <path
            d="M48 4 A44 44 0 0 1 92 48"
            stroke="#22C55E"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {/* Pulsing inner ring */}
        <div
          className="w-16 h-16 rounded-full animate-pulse"
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.3)',
            boxShadow: '0 0 30px rgba(34,197,94,0.2)',
          }}
        />
        {/* Center icon */}
        <Cpu className="absolute w-7 h-7 text-primary" />
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {STEPS.slice(0, 3).map((step, idx) => {
          const isDone = activeStepIdx > idx;
          const isActive = activeStepIdx === idx;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className="flex items-center gap-3 transition-all duration-500"
              style={{ opacity: idx > activeStepIdx + 1 ? 0.3 : 1 }}
            >
              {/* Icon circle */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  background: isDone
                    ? 'rgba(34,197,94,0.15)'
                    : isActive
                      ? 'rgba(34,197,94,0.08)'
                      : 'rgba(38,38,38,0.5)',
                  border: `1px solid ${isDone ? '#22C55E' : isActive ? 'rgba(34,197,94,0.5)' : '#262626'}`,
                }}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
                    style={isActive ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
                  />
                )}
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: isDone ? '#22C55E' : isActive ? '#e5e2e1' : '#6B7280' }}
                >
                  {step.label}
                  {isActive && dots}
                </p>
                {isActive && (
                  <p className="font-jetbrains text-[10px] text-on-surface-variant mt-0.5">
                    {step.sublabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Backend info */}
      {backendName && backendName !== 'none' && (
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 font-jetbrains text-xs uppercase tracking-wider"
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            color: '#22C55E',
          }}
        >
          <Zap className="w-3 h-3" />
          {backendName} Backend Active
        </div>
      )}

      <p className="text-[11px] text-on-surface-variant/50 font-jetbrains text-center max-w-xs">
        Model runs entirely on your device. No data ever leaves your browser.
      </p>
    </div>
  );
}
