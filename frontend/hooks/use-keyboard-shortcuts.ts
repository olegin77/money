'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const SHORTCUTS: Record<string, string> = {
  n: '/expenses',
  i: '/income',
};

export function useGlobalKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);

  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable;
        if (isInput) return;

        const key = e.key.toLowerCase();

        // Help dialog: Ctrl+? (Ctrl+Shift+/)
        if (key === '?' || (e.shiftKey && key === '/')) {
          e.preventDefault();
          setHelpOpen(prev => !prev);
          return;
        }

        const route = SHORTCUTS[key];
        if (!route) return;

        e.preventDefault();

        if (pathname === route) {
          window.dispatchEvent(new CustomEvent('shortcut:open-form'));
        } else {
          router.push(`${route}?action=new`);
        }
      }

      // Escape closes help dialog
      if (e.key === 'Escape') {
        setHelpOpen(false);
      }
    },
    [router, pathname]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);

  return { helpOpen, setHelpOpen };
}
