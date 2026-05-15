'use client';

import { useState, useEffect } from 'react';

export type TextSize = 'small' | 'medium' | 'large';

interface AppSettings {
  aiConfidenceThreshold: number;
  scanCooldown: number;
  theme: 'light' | 'dark';
  textSize: TextSize;
  hapticEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  aiConfidenceThreshold: 0.45,
  scanCooldown: 5,
  theme: 'dark',
  textSize: 'medium',
  hapticEnabled: true,
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ecoops_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ecoops_settings', JSON.stringify(settings));
      
      // Apply text size to document root
      const root = document.documentElement;
      root.classList.remove('text-small', 'text-medium', 'text-large');
      root.classList.add(`text-${settings.textSize}`);
      
      // Apply theme
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const triggerFeedback = () => {
    if (settings.hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
    // Sound feedback could be added here
  };

  return {
    ...settings,
    isLoaded,
    updateSettings,
    triggerFeedback,
  };
}
