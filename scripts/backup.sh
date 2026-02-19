#!/bin/bash
# FinTrack Pro - PostgreSQL Backup Script
# Runs pg_dump and optionally uploads to S3-compatible storage
# Schedule: every 6 hours via cron
# Retention: 30 days

set -euo pipefail

# ─── Configuration ────────────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-/home/nod/money/backups}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USERNAME:-fintrack}"
DB_NAME="${DB_DATABASE:-fintrack}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/fintrack_${TIMESTAMP}.sql.gz"

# S3 settings (optional)
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_ENDPOINT="${S3_BACKUP_ENDPOINT:-}"

# ─── Setup ────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup: ${DB_NAME}@${DB_HOST}:${DB_PORT}"

# ─── Dump ─────────────────────────────────────────────────
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_FILE"

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup created: ${BACKUP_FILE} (${FILE_SIZE})"

# ─── Upload to S3 (optional) ─────────────────────────────
if [ -n "$S3_BUCKET" ]; then
  S3_PATH="s3://${S3_BUCKET}/backups/$(basename "$BACKUP_FILE")"

  if [ -n "$S3_ENDPOINT" ]; then
    aws s3 cp "$BACKUP_FILE" "$S3_PATH" --endpoint-url "$S3_ENDPOINT"
  else
    aws s3 cp "$BACKUP_FILE" "$S3_PATH"
  fi

  echo "[$(date)] Uploaded to ${S3_PATH}"
fi

# ─── Cleanup old backups ─────────────────────────────────
DELETED=$(find "$BACKUP_DIR" -name "fintrack_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "[$(date)] Deleted ${DELETED} backups older than ${RETENTION_DAYS} days"
fi

echo "[$(date)] Backup complete"
