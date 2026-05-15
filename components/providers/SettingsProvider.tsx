'use client';

import React, { createContext, useContext } from 'react';
import { useAppSettings, TextSize } from '@/hooks/useAppSettings';

interface SettingsContextType {
  aiConfidenceThreshold: number;
  scanCooldown: number;
  theme: 'light' | 'dark';
  textSize: TextSize;
  hapticEnabled: boolean;
  isLoaded: boolean;
  updateSettings: (updates: Partial<{
    aiConfidenceThreshold: number;
    scanCooldown: number;
    theme: 'light' | 'dark';
    textSize: TextSize;
    hapticEnabled: boolean;
  }>) => void;
  triggerFeedback: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settings = useAppSettings();

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
