# Database Migrations

## Overview

FinTrack uses **TypeORM** for database migrations. Migrations are located in `backend/src/database/migrations/` and run against PostgreSQL 16.

## Configuration

- Migrations directory: `backend/src/database/migrations/*{.ts,.js}`
- Auto-run disabled in production (`migrationsRun: false`)
- TypeORM config: `backend/src/config/typeorm.config.ts`

## Commands

### Generate a new migration

```bash
cd backend
pnpm typeorm migration:generate -d src/config/typeorm.config.ts src/database/migrations/MigrationName
```

### Create an empty migration

```bash
cd backend
pnpm typeorm migration:create src/database/migrations/MigrationName
```

### Run pending migrations

```bash
cd backend
pnpm typeorm migration:run -d src/config/typeorm.config.ts
```

### Revert last migration

```bash
cd backend
pnpm typeorm migration:revert -d src/config/typeorm.config.ts
```

### Show migration status

```bash
cd backend
pnpm typeorm migration:show -d src/config/typeorm.config.ts
```

## Production Deployment Procedure

### Pre-deployment checklist

1. Backup the database:
   ```bash
   pg_dump -h $DB_HOST -U $DB_USER fintrack_prod > backup_$(date +%Y%m%d_%H%M%S).sql
   ```
2. Verify backup file size (should be > 1MB for an active database):
   ```bash
   ls -lh backup_*.sql
   ```
3. Test migration on staging first:
   ```bash
   pnpm typeorm migration:run -d src/config/typeorm.config.ts
   ```

### Deployment steps

1. Stop the application:
   ```bash
   pm2 stop fintrack-backend
   ```
2. Pull latest code:
   ```bash
   git pull origin master
   pnpm install --frozen-lockfile
   ```
3. Run migrations:
   ```bash
   cd backend && pnpm typeorm migration:run -d src/config/typeorm.config.ts
   ```
4. Start the application:
   ```bash
   pm2 restart fintrack-backend
   ```

### Rollback procedure

1. Stop the application:
   ```bash
   pm2 stop fintrack-backend
   ```
2. Revert last migration:
   ```bash
   cd backend && pnpm typeorm migration:revert -d src/config/typeorm.config.ts
   ```
3. If migration revert fails, restore from backup:
   ```bash
   psql -h $DB_HOST -U $DB_USER fintrack_prod < backup_YYYYMMDD_HHMMSS.sql
   ```
4. Restart the application:
   ```bash
   pm2 restart fintrack-backend
   ```

### Data validation post-migration

Run these queries to verify data integrity:

```sql
-- Row counts (should match pre-migration)
SELECT 'expenses' AS table_name, COUNT(*) FROM expenses
UNION ALL
SELECT 'income', COUNT(*) FROM income
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'perimeters', COUNT(*) FROM perimeters;

-- Check for orphaned records
SELECT COUNT(*) FROM expenses WHERE "userId" NOT IN (SELECT id FROM users);
SELECT COUNT(*) FROM income WHERE "userId" NOT IN (SELECT id FROM users);
```

## Best Practices

- Always test migrations on staging before production
- Never modify or delete existing migration files
- Each migration should be idempotent where possible
- Include both `up()` and `down()` methods for reversibility
- Keep migrations small and focused on a single change
