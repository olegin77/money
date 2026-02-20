/**
 * Offline Sync Queue with LWW (Last Writer Wins) conflict resolution.
 * Queues mutations when offline and replays them when connectivity is restored.
 * Each record gets a client UUID + timestamp for idempotency.
 */

import { v4 as uuidv4 } from 'uuid';

export interface SyncOperation {
  id: string;
  clientId: string;
  timestamp: number;
  type: 'create' | 'update' | 'delete';
  entity: 'expense' | 'income';
  entityId?: string;
  data?: Record<string, unknown>;
  retries: number;
}

const STORAGE_KEY = 'fintrack_sync_queue';
const MAX_RETRIES = 3;

function loadQueue(): SyncOperation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncOperation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function getClientId(): string {
  if (typeof window === 'undefined') return '';
  let cid = localStorage.getItem('fintrack_client_id');
  if (!cid) {
    cid = uuidv4();
    localStorage.setItem('fintrack_client_id', cid);
  }
  return cid;
}

export function enqueueOperation(
  type: SyncOperation['type'],
  entity: SyncOperation['entity'],
  data?: Record<string, unknown>,
  entityId?: string
): SyncOperation {
  const op: SyncOperation = {
    id: uuidv4(),
    clientId: getClientId(),
    timestamp: Date.now(),
    type,
    entity,
    entityId,
    data,
    retries: 0,
  };
  const queue = loadQueue();
  // LWW: if there's a pending op for the same entity+entityId, replace it
  const idx = queue.findIndex(q => q.entity === entity && q.entityId === entityId && entityId);
  if (idx >= 0 && entityId) {
    queue[idx] = op;
  } else {
    queue.push(op);
  }
  saveQueue(queue);
  return op;
}

export function removeOperation(id: string): void {
  const queue = loadQueue();
  saveQueue(queue.filter(q => q.id !== id));
}

export function incrementRetry(id: string): boolean {
  const queue = loadQueue();
  const op = queue.find(q => q.id === id);
  if (!op) return false;
  op.retries += 1;
  if (op.retries >= MAX_RETRIES) {
    saveQueue(queue.filter(q => q.id !== id));
    return false;
  }
  saveQueue(queue);
  return true;
}

export function getPendingOperations(): SyncOperation[] {
  return loadQueue();
}

export function getQueueSize(): number {
  return loadQueue().length;
}

export function clearQueue(): void {
  saveQueue([]);
}
