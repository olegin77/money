/**
 * Sync Manager — replays queued offline operations when back online.
 */

import { api } from '@/lib/api/client';
import { getPendingOperations, removeOperation, incrementRetry, SyncOperation } from './sync-queue';

async function replayOperation(op: SyncOperation): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'X-Client-Id': op.clientId,
      'X-Client-Timestamp': String(op.timestamp),
      'X-Idempotency-Key': op.id,
    };

    const basePath = op.entity === 'expense' ? '/expenses' : '/income';

    switch (op.type) {
      case 'create':
        await api.post(basePath, op.data, { headers });
        break;
      case 'update':
        if (op.entityId) {
          await api.patch(`${basePath}/${op.entityId}`, op.data, { headers });
        }
        break;
      case 'delete':
        if (op.entityId) {
          await api.delete(`${basePath}/${op.entityId}`, { headers });
        }
        break;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncPendingOperations(): Promise<{
  synced: number;
  failed: number;
}> {
  const ops = getPendingOperations();
  let synced = 0;
  let failed = 0;

  // Process in order (oldest first) for LWW correctness
  const sorted = [...ops].sort((a, b) => a.timestamp - b.timestamp);

  for (const op of sorted) {
    const success = await replayOperation(op);
    if (success) {
      removeOperation(op.id);
      synced++;
    } else {
      const canRetry = incrementRetry(op.id);
      if (!canRetry) failed++;
    }
  }

  return { synced, failed };
}

let syncInProgress = false;

export function startOnlineSync(): void {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    if (syncInProgress) return;
    syncInProgress = true;
    try {
      await syncPendingOperations();
    } finally {
      syncInProgress = false;
    }
  };

  window.addEventListener('online', handleOnline);

  // Also try to sync on page load if online
  if (navigator.onLine) {
    handleOnline();
  }
}
