import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeightUnit } from '@/types/api';

export type Theme = 'dark' | 'light' | 'system';

interface SettingsState {
  theme: Theme;
  weightUnit: WeightUnit;
  defaultRestSeconds: number;
  restSound: boolean;
  setTheme: (t: Theme) => void;
  setUnit: (u: WeightUnit) => void;
  setDefaultRest: (s: number) => void;
  setRestSound: (on: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      weightUnit: 'kg',
      defaultRestSeconds: 90,
      restSound: true,
      setTheme: (theme) => set({ theme }),
      setUnit: (weightUnit) => set({ weightUnit }),
      setDefaultRest: (defaultRestSeconds) => set({ defaultRestSeconds }),
      setRestSound: (restSound) => set({ restSound }),
    }),
    { name: 'vt-settings' },
  ),
);

export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1A1D22' : '#F1F2F4');
}
