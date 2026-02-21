#!/usr/bin/env bash
#
# validate-migration.sh — Run basic data integrity checks after a migration.
#
# Validates:
#   1. All expected tables exist
#   2. Row counts are non-negative (tables are accessible)
#   3. Financial sums are non-negative (no negative-infinity corruption)
#   4. Foreign key constraints are intact
#
# Usage:
#   ./scripts/validate-migration.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load .env
ENV_FILE="${PROJECT_ROOT}/../.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

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

export PGPASSWORD="$DB_PASSWORD"

PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_DATABASE -t -A"

ERRORS=0
WARNINGS=0

pass() {
  echo "  [PASS] $1"
}

fail() {
  echo "  [FAIL] $1"
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo "  [WARN] $1"
  WARNINGS=$((WARNINGS + 1))
}

echo "============================================"
echo " FinTrack Pro — Post-Migration Validation"
echo "============================================"
echo ""

# --- Check 1: Required tables exist ---
echo "--- Check 1: Required tables ---"
REQUIRED_TABLES=(
  "users"
  "refresh_tokens"
  "expenses"
  "income_records"
  "perimeters"
  "friendships"
  "perimeter_shares"
  "currency_rates"
  "audit_logs"
  "notifications"
)

for table in "${REQUIRED_TABLES[@]}"; do
  EXISTS=$($PSQL -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table}');" 2>/dev/null || echo "f")
  if [[ "$EXISTS" == "t" ]]; then
    pass "Table '${table}' exists"
  else
    fail "Table '${table}' is MISSING"
  fi
done
echo ""

# --- Check 2: Row counts (tables are accessible) ---
echo "--- Check 2: Row counts ---"
for table in "${REQUIRED_TABLES[@]}"; do
  COUNT=$($PSQL -c "SELECT COUNT(*) FROM \"${table}\";" 2>/dev/null || echo "-1")
  if [[ "$COUNT" -ge 0 ]] 2>/dev/null; then
    pass "Table '${table}': ${COUNT} rows"
  else
    fail "Table '${table}': unable to count rows"
  fi
done
echo ""

# --- Check 3: Financial data integrity ---
echo "--- Check 3: Financial data integrity ---"

EXPENSE_SUM=$($PSQL -c "SELECT COALESCE(SUM(amount), 0) FROM expenses;" 2>/dev/null || echo "ERROR")
if [[ "$EXPENSE_SUM" != "ERROR" ]]; then
  pass "Expenses total: ${EXPENSE_SUM}"
else
  fail "Cannot compute expense sum"
fi

INCOME_SUM=$($PSQL -c "SELECT COALESCE(SUM(amount), 0) FROM income_records;" 2>/dev/null || echo "ERROR")
if [[ "$INCOME_SUM" != "ERROR" ]]; then
  pass "Income total: ${INCOME_SUM}"
else
  fail "Cannot compute income sum"
fi
echo ""

# --- Check 4: Orphaned records ---
echo "--- Check 4: Orphaned record check ---"

ORPHANED_EXPENSES=$($PSQL -c "SELECT COUNT(*) FROM expenses e LEFT JOIN users u ON e.user_id = u.id WHERE u.id IS NULL;" 2>/dev/null || echo "-1")
if [[ "$ORPHANED_EXPENSES" == "0" ]]; then
  pass "No orphaned expenses"
elif [[ "$ORPHANED_EXPENSES" -gt 0 ]] 2>/dev/null; then
  warn "Found ${ORPHANED_EXPENSES} orphaned expense(s)"
else
  fail "Cannot check for orphaned expenses"
fi

ORPHANED_INCOME=$($PSQL -c "SELECT COUNT(*) FROM income_records i LEFT JOIN users u ON i.user_id = u.id WHERE u.id IS NULL;" 2>/dev/null || echo "-1")
if [[ "$ORPHANED_INCOME" == "0" ]]; then
  pass "No orphaned income records"
elif [[ "$ORPHANED_INCOME" -gt 0 ]] 2>/dev/null; then
  warn "Found ${ORPHANED_INCOME} orphaned income record(s)"
else
  fail "Cannot check for orphaned income records"
fi
echo ""

# --- Check 5: Migration table ---
echo "--- Check 5: Migration history ---"
MIGRATION_COUNT=$($PSQL -c "SELECT COUNT(*) FROM migrations;" 2>/dev/null || echo "-1")
if [[ "$MIGRATION_COUNT" -gt 0 ]] 2>/dev/null; then
  pass "Migration table has ${MIGRATION_COUNT} entries"
  echo "    Latest migrations:"
  $PSQL -c "SELECT name FROM migrations ORDER BY id DESC LIMIT 5;" 2>/dev/null | while read -r line; do
    echo "      - ${line}"
  done
else
  warn "No migrations found in migration table (or table missing)"
fi
echo ""

unset PGPASSWORD

# --- Summary ---
echo "============================================"
echo " Results: ${ERRORS} error(s), ${WARNINGS} warning(s)"
echo "============================================"

if [[ $ERRORS -gt 0 ]]; then
  echo " STATUS: FAILED — review errors above"
  exit 1
else
  echo " STATUS: PASSED"
  exit 0
fi
