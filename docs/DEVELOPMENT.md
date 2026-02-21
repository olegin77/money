# Development Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 16 (or Docker)
- Redis 7 (or Docker)

## Initial Setup

```bash
git clone https://github.com/olegin77/money.git
cd money
pnpm install

# Start database and Redis via Docker
docker-compose up -d db redis

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
cd backend && pnpm migration:run && cd ..

# Start development servers
pnpm dev
```

Development URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs

## Project Structure

```
money/
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── auth/             # JWT + 2FA authentication
│   │   ├── users/            # User management, GDPR export/import/deletion
│   │   ├── expenses/         # Expenses CRUD, receipt upload
│   │   ├── income/           # Income CRUD
│   │   ├── perimeters/       # Categories with sharing & permission matrix
│   │   ├── friends/          # Friend requests & friendships
│   │   ├── analytics/        # CQRS analytics (read/write services)
│   │   ├── notifications/    # Notifications + preferences
│   │   ├── scheduler/        # BullMQ recurring transactions, account cleanup
│   │   ├── common/           # Guards, middleware, encryption, events, audit logging
│   │   └── database/         # Migrations
│   ├── scripts/              # backup-db.sh, rollback-last.sh, validate-migration.sh
│   └── test/                 # E2E tests
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   ├── components/
│   │   ├── ui/               # Design system (shadcn/ui based)
│   │   ├── layout/           # Sidebar, mobile nav, header
│   │   ├── expenses/         # Expense form & list
│   │   ├── income/           # Income form & list
│   │   ├── analytics/        # Charts & stat cards
│   │   ├── dashboard/        # Balance hero, getting started
│   │   ├── friends/          # Friend cards, search
│   │   ├── notifications/    # Notification bell
│   │   ├── onboarding/       # Onboarding wizard
│   │   ├── perimeters/       # Category cards, share dialog
│   │   └── providers/        # Auth, keyboard shortcuts, RTL, offline sync
│   ├── lib/
│   │   ├── api/              # API client modules
│   │   ├── i18n/             # Translations (EN, RU, AR)
│   │   └── offline/          # IndexedDB sync queue
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # Zustand state stores
│   └── stories/              # Storybook stories
└── docs/                     # Documentation
```

## Development Commands

```bash
# Start all services (frontend + backend)
pnpm dev

# Backend only
cd backend && pnpm start:dev

# Frontend only
cd frontend && pnpm dev
```

## Testing

```bash
# Backend unit tests
cd backend && pnpm test

# Backend E2E tests
cd backend && pnpm test:e2e
```

## Building

```bash
# Backend (NestJS compilation)
cd backend && pnpm build

# Frontend (Next.js production build, includes ESLint)
cd frontend && pnpm build
```

Both builds must pass with zero errors before deploying.

## Database

```bash
cd backend

# Generate migration from entity changes
pnpm typeorm migration:generate -d src/config/typeorm.config.ts src/database/migrations/MigrationName

# Create empty migration
pnpm typeorm migration:create src/database/migrations/MigrationName

# Run pending migrations
pnpm migration:run

# Revert last migration
pnpm typeorm migration:revert -d src/config/typeorm.config.ts
```

See [MIGRATIONS.md](./MIGRATIONS.md) for production migration procedures.

## Code Style

### Naming Conventions

- Files: kebab-case (`user.service.ts`)
- Classes: PascalCase (`UserService`)
- Functions: camelCase (`findUser`)
- Constants: UPPER_SNAKE_CASE (`JWT_SECRET`)
- Interfaces/Types: PascalCase (`User`, `ApiResponse`)

### ESLint Rules (build-blocking)

- `@typescript-eslint/no-unused-vars`: unused variables must start with `_`
- `prettier/prettier`: formatting enforced; fix with `npx prettier --write <file>`

### Backend (NestJS)

- Use dependency injection via `@Injectable()`
- Use DTOs with `class-validator` for all request bodies
- Use proper NestJS exceptions (`NotFoundException`, `ForbiddenException`, etc.)
- Apply `@ApiTags()` and `@ApiOperation()` decorators for Swagger

### Frontend (React/Next.js)

- Functional components only
- React Query for server state
- Zustand for client state
- Tailwind CSS for styling (8px grid system)
- ARIA labels on all interactive elements

## Design System

### Typography
- Headings: Satoshi font (`font-satoshi`)
- Body: DM Sans (`font-sans`)

### Spacing (8px grid)
- `p-1` (4px), `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)

### Components
- Based on shadcn/ui with glassmorphism effects
- Dark mode support via CSS custom properties

## Troubleshooting

### Database connection issues

```bash
docker-compose ps          # Check if containers are running
docker-compose logs db     # Check PostgreSQL logs
docker-compose logs redis  # Check Redis logs
```

### Port already in use

```bash
lsof -ti:3001 | xargs kill -9   # Kill process on backend port
lsof -ti:3000 | xargs kill -9   # Kill process on frontend port
```

### Module not found

```bash
rm -rf node_modules && pnpm install
```

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [React Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
