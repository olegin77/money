'use client';

import { useOffline } from '@/hooks/use-offline';
import { Button } from '@/components/ui/button';

export function OfflineIndicator() {
  const { isOnline, syncStatus, manualSync } = useOffline();

  if (isOnline && syncStatus.pending === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="glass max-w-sm rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}
          />
          <div className="flex-1">
            <p className="text-sm font-semibold">{isOnline ? 'Online' : 'Offline Mode'}</p>
            {syncStatus.pending > 0 && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {syncStatus.pending} item{syncStatus.pending > 1 ? 's' : ''} pending sync
              </p>
            )}
          </div>
          {isOnline && syncStatus.pending > 0 && !syncStatus.isSyncing && (
            <Button size="sm" onClick={manualSync}>
              Sync Now
            </Button>
          )}
          {syncStatus.isSyncing && <div className="text-sm text-gray-500">Syncing...</div>}
        </div>
      </div>
    </div>
  );
}
