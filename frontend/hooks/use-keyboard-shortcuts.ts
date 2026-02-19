'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const SHORTCUTS: Record<string, string> = {
  n: '/expenses',
  i: '/income',
};

export function useGlobalKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable;
        if (isInput) return;

        const key = e.key.toLowerCase();
        const route = SHORTCUTS[key];
        if (!route) return;

        e.preventDefault();

        if (pathname === route) {
          window.dispatchEvent(new CustomEvent('shortcut:open-form'));
        } else {
          router.push(`${route}?action=new`);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, pathname]);
}
