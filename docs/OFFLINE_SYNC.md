# Offline Sync Strategy

## Overview

FinTrack uses a **Last-Write-Wins (LWW)** strategy for offline data synchronization. Transactions created or edited offline are stored in IndexedDB (via Dexie.js) and synced to the server when connectivity is restored.

## Architecture

```
[IndexedDB]          [Sync Queue]           [Server API]
offlineExpenses  -->  syncQueue item  -->   POST /expenses
offlineIncomes   -->  syncQueue item  -->   POST /income
```

### Storage

- **FinTrackDB** — Dexie.js database with three object stores:
  - `offlineExpenses` — cached expenses with `synced` flag
  - `offlineIncomes` — cached incomes with `synced` flag
  - `syncQueue` — pending operations ordered by `timestamp`

### Sync Queue Schema

| Field      | Type   | Description                          |
|------------|--------|--------------------------------------|
| id         | number | Auto-increment primary key           |
| type       | string | `expense`, `income`, `update`, `delete` |
| entityType | string | `expense` or `income`                |
| entityId   | string | Client-generated UUID (tempId)       |
| data       | object | Full entity payload                  |
| timestamp  | number | `Date.now()` when queued             |
| retries    | number | Retry counter (starts at 0)          |
| error      | string | Last error message (if failed)       |

## Last-Write-Wins (LWW) Strategy

Each offline operation carries a `timestamp` (client `Date.now()` at creation time). When syncing:

1. Operations are processed in **timestamp order** (oldest first).
2. The server receives the full entity payload.
3. If two devices edit the same record, the operation with the **later timestamp wins**.
4. The `entityId` (UUID) prevents duplicate creation.

### Conflict Scenarios

**Scenario A: Two devices create the same expense offline**
- Device A creates expense with `tempId: "abc-123"` at 10:00
- Device B creates expense with `tempId: "def-456"` at 10:05
- Both sync at 10:10 — both are created (different UUIDs, no conflict)

**Scenario B: Two devices edit the same expense offline**
- Device A edits expense `id: X` at 10:00 (offline)
- Device B edits expense `id: X` at 10:05 (offline)
- Device A syncs at 10:10 — update applied (timestamp 10:00)
- Device B syncs at 10:11 — update applied, overwrites A's changes (timestamp 10:05 > 10:00)
- Result: Device B's version wins (LWW)

**Scenario C: Create offline, delete on another device**
- Device A creates expense offline at 10:00
- Device B is online and has no record of it
- Device A syncs at 10:10 — expense created on server
- No conflict — new record

## Sync Process

The `OfflineSyncProvider` component manages synchronization:

1. **On online event** — triggers sync of all pending queue items
2. **On app focus** — checks for pending items and syncs
3. **Retry logic** — failed items increment `retries` counter; items with `retries > 5` are discarded

### Sync Flow

```
1. Get pending items:  syncQueue.orderBy('timestamp').toArray()
2. For each item:
   a. POST/PATCH/DELETE to server API
   b. On success: remove from syncQueue, mark entity as synced
   c. On failure: increment retry counter, store error message
3. Clear synced offline data periodically
```

## Deduplication

- Each offline entity has a unique `tempId` (UUID v4)
- The server checks for existing records with the same client-generated ID
- Duplicate POSTs are idempotent via the idempotency middleware

## Data Cleanup

Synced offline data is periodically cleaned:

```typescript
offlineSync.clearSyncedData()
// Removes all entries where synced === true
```

## Limitations

- LWW may silently discard offline edits if a newer edit exists on server
- No three-way merge for partial field updates
- Clock skew between devices can affect ordering (mitigated by server timestamp fallback)
- Maximum queue size is bounded by IndexedDB storage limits (~50MB typical)
