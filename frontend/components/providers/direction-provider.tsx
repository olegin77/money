'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { getLangDir } from '@/lib/i18n/translations';

/**
 * Synchronises the `lang` and `dir` attributes on `<html>`
 * whenever the user changes their language preference.
 */
export function DirectionProvider() {
  const lang = useAuthStore(s => s.user?.language) ?? 'en';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', getLangDir(lang));
  }, [lang]);

  return null;
}
