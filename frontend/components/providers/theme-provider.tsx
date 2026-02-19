'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export function ThemeProvider() {
  const user = useAuthStore(s => s.user);
  const themeMode = user?.themeMode;

  useEffect(() => {
    const root = document.documentElement;

    if (themeMode === 'light') {
      root.classList.remove('dark');
    } else if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      // Auto-detect from system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      if (prefersDark.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      prefersDark.addEventListener('change', handler);
      return () => prefersDark.removeEventListener('change', handler);
    }
  }, [themeMode]);

  return null;
}
