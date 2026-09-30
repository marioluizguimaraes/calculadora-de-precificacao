import { useCallback, useSyncExternalStore } from 'react';

import { env } from '@/shared/config/env';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = `${env.VITE_STORAGE_KEY}:tema`;
const listeners = new Set<() => void>();

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** Aplica o tema salvo antes da primeira renderização (evita piscar). */
export function applyStoredTheme() {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Armazenamento indisponível (modo privado): segue com o padrão claro.
  }
  document.documentElement.dataset.theme = stored === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    readTheme,
    (): Theme => 'light',
  );

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignora: a preferência vale só para esta sessão.
    }
    listeners.forEach((l) => {
      l();
    });
  }, []);

  const toggle = useCallback(() => {
    setTheme(readTheme() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  return { theme, setTheme, toggle };
}
