'use client';

import { useEffect } from 'react';
import { startOnlineSync } from '@/lib/offline/sync-manager';

export function OfflineSyncProvider() {
  useEffect(() => {
    startOnlineSync();
  }, []);

  return null;
}
