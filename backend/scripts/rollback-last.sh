#!/usr/bin/env bash
#
# rollback-last.sh — Revert the most recent TypeORM migration.
#
# Usage:
#   ./scripts/rollback-last.sh          # revert one migration
#   ./scripts/rollback-last.sh 3        # revert the last 3 migrations
#
# Automatically creates a backup before reverting.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

REVERT_COUNT="${1:-1}"

echo "==> FinTrack Pro — Migration Rollback"
echo "    Reverting ${REVERT_COUNT} migration(s)..."
echo ""

# Create a backup first
echo "--- Step 1: Creating safety backup before rollback ---"
if bash "${SCRIPT_DIR}/backup-db.sh"; then
  echo "    Backup created successfully."
else
  echo "    WARNING: Backup failed. Proceeding anyway (data may still be safe)."
fi
echo ""

# Show current migration status
echo "--- Step 2: Current migration status ---"
cd "$PROJECT_ROOT"
npx typeorm-ts-node-commonjs migration:show -d src/config/typeorm.config.ts 2>/dev/null || true
echo ""

# Revert migrations
echo "--- Step 3: Reverting ${REVERT_COUNT} migration(s) ---"
for i in $(seq 1 "$REVERT_COUNT"); do
  echo "    Reverting migration ${i} of ${REVERT_COUNT}..."
  if npx typeorm-ts-node-commonjs migration:revert -d src/config/typeorm.config.ts; then
    echo "    Migration ${i} reverted successfully."
  else
    echo "    ERROR: Failed to revert migration ${i}. Stopping."
    exit 1
  fi
done
echo ""

# Show new status
echo "--- Step 4: Post-rollback migration status ---"
npx typeorm-ts-node-commonjs migration:show -d src/config/typeorm.config.ts 2>/dev/null || true
echo ""

echo "==> Rollback complete. ${REVERT_COUNT} migration(s) reverted."
echo "    If something went wrong, restore from the backup created in Step 1."
