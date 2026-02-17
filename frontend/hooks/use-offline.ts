import { useState, useEffect } from 'react';
import { syncManager } from '@/lib/sync/sync-manager';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    unsyncedExpenses: 0,
    unsyncedIncomes: 0,
    isSyncing: false,
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateSyncStatus = async () => {
      const status = await syncManager.getSyncStatus();
      setSyncStatus(status);
    };

    // Set initial status
    updateOnlineStatus();
    updateSyncStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Update sync status periodically
    const interval = setInterval(updateSyncStatus, 5000);

    // Start auto-sync when online
    if (navigator.onLine) {
      syncManager.startAutoSync();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const manualSync = async () => {
    if (!isOnline) {
      return { success: 0, failed: 0 };
    }
    return syncManager.syncAll();
  };

  return {
    isOnline,
    syncStatus,
    manualSync,
  };
}
