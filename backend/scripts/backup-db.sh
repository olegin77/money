#!/usr/bin/env bash
#
# backup-db.sh — Create a timestamped PostgreSQL backup of the FinTrack Pro database.
#
# Usage:
#   ./scripts/backup-db.sh [output_dir]
#
# Environment variables (reads from ../.env if present):
#   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load .env from project root (two levels up from backend/scripts)
ENV_FILE="${PROJECT_ROOT}/../.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# Also try backend-level .env
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${PROJECT_ROOT}/.env"
  set +a
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME:-fintrack}"
DB_PASSWORD="${DB_PASSWORD:-fintrack_secure_pass_2026}"
DB_DATABASE="${DB_DATABASE:-fintrack_pro}"

OUTPUT_DIR="${1:-${PROJECT_ROOT}/backups}"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="${DB_DATABASE}_${TIMESTAMP}.sql.gz"
OUTPUT_PATH="${OUTPUT_DIR}/${FILENAME}"

echo "==> Backing up database '${DB_DATABASE}' on ${DB_HOST}:${DB_PORT}"
echo "    Output: ${OUTPUT_PATH}"

export PGPASSWORD="$DB_PASSWORD"

pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USERNAME" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --verbose \
  "$DB_DATABASE" | gzip > "$OUTPUT_PATH"

unset PGPASSWORD

FILESIZE="$(du -h "$OUTPUT_PATH" | cut -f1)"
echo "==> Backup completed successfully: ${OUTPUT_PATH} (${FILESIZE})"
echo "    To restore: gunzip -c ${OUTPUT_PATH} | pg_restore -d ${DB_DATABASE}"
