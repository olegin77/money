import { offlineSync } from '@/lib/db';
import { expensesApi } from '@/lib/api/expenses';
import { incomeApi } from '@/lib/api/income';

class SyncManager {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncAll();
      }
    }, intervalMs);

    // Initial sync
    if (navigator.onLine) {
      await this.syncAll();
    }
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let success = 0;
    let failed = 0;

    try {
      const pendingItems = await offlineSync.getPendingSyncItems();

      for (const item of pendingItems) {
        try {
          if (item.type === 'expense') {
            await expensesApi.create(item.data);
            await offlineSync.markExpenseSynced(item.entityId);
            await offlineSync.removeSyncItem(item.id!);
            success++;
          } else if (item.type === 'income') {
            await incomeApi.create(item.data);
            await offlineSync.markIncomeSynced(item.entityId);
            await offlineSync.removeSyncItem(item.id!);
            success++;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Sync failed';
          console.error(`Failed to sync ${item.type}:`, err);
          await offlineSync.updateSyncItemRetry(item.id!, message);
          failed++;

          // Remove after 5 failed attempts
          if (item.retries >= 5) {
            await offlineSync.removeSyncItem(item.id!);
          }
        }
      }

      // Cleanup old synced data
      await offlineSync.clearSyncedData();
    } finally {
      this.isSyncing = false;
    }

    return { success, failed };
  }

  async getSyncStatus() {
    const pending = await offlineSync.getPendingSyncItems();
    const unsyncedExpenses = await offlineSync.getUnsyncedExpenses();
    const unsyncedIncomes = await offlineSync.getUnsyncedIncomes();

    return {
      pending: pending.length,
      unsyncedExpenses: unsyncedExpenses.length,
      unsyncedIncomes: unsyncedIncomes.length,
      isSyncing: this.isSyncing,
      isOnline: navigator.onLine,
    };
  }
}

export const syncManager = new SyncManager();
