import Dexie, { Table } from 'dexie';

export interface OfflineExpense {
  id?: number;
  tempId: string;
  amount: number;
  currency: string;
  description?: string;
  categoryId?: string;
  date: string;
  paymentMethod?: string;
  location?: string;
  tags?: string[];
  synced: boolean;
  createdAt: number;
}

export interface OfflineIncome {
  id?: number;
  tempId: string;
  amount: number;
  currency: string;
  description?: string;
  source?: string;
  date: string;
  tags?: string[];
  synced: boolean;
  createdAt: number;
}

export interface SyncQueue {
  id?: number;
  type: 'expense' | 'income' | 'update' | 'delete';
  entityType: 'expense' | 'income';
  entityId: string;
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
}

class FinTrackDB extends Dexie {
  offlineExpenses!: Table<OfflineExpense, number>;
  offlineIncomes!: Table<OfflineIncome, number>;
  syncQueue!: Table<SyncQueue, number>;

  constructor() {
    super('FinTrackDB');

    this.version(1).stores({
      offlineExpenses: '++id, tempId, synced, createdAt',
      offlineIncomes: '++id, tempId, synced, createdAt',
      syncQueue: '++id, timestamp, type, entityType',
    });
  }
}

export const db = new FinTrackDB();

// Offline sync utilities
export const offlineSync = {
  async addExpenseToQueue(expense: Omit<OfflineExpense, 'id' | 'synced' | 'createdAt'>) {
    await db.offlineExpenses.add({
      ...expense,
      synced: false,
      createdAt: Date.now(),
    });

    await db.syncQueue.add({
      type: 'expense',
      entityType: 'expense',
      entityId: expense.tempId,
      data: expense,
      timestamp: Date.now(),
      retries: 0,
    });
  },

  async addIncomeToQueue(income: Omit<OfflineIncome, 'id' | 'synced' | 'createdAt'>) {
    await db.offlineIncomes.add({
      ...income,
      synced: false,
      createdAt: Date.now(),
    });

    await db.syncQueue.add({
      type: 'income',
      entityType: 'income',
      entityId: income.tempId,
      data: income,
      timestamp: Date.now(),
      retries: 0,
    });
  },

  async getUnsyncedExpenses() {
    return db.offlineExpenses.where('synced').equals(0).toArray();
  },

  async getUnsyncedIncomes() {
    return db.offlineIncomes.where('synced').equals(0).toArray();
  },

  async markExpenseSynced(tempId: string) {
    await db.offlineExpenses.where('tempId').equals(tempId).modify({ synced: true });
  },

  async markIncomeSynced(tempId: string) {
    await db.offlineIncomes.where('tempId').equals(tempId).modify({ synced: true });
  },

  async getPendingSyncItems() {
    return db.syncQueue.orderBy('timestamp').toArray();
  },

  async removeSyncItem(id: number) {
    await db.syncQueue.delete(id);
  },

  async updateSyncItemRetry(id: number, error: string) {
    const item = await db.syncQueue.get(id);
    if (item) {
      await db.syncQueue.update(id, {
        retries: item.retries + 1,
        error,
      });
    }
  },

  async clearSyncedData() {
    await db.offlineExpenses.where('synced').equals(1).delete();
    await db.offlineIncomes.where('synced').equals(1).delete();
  },
};
