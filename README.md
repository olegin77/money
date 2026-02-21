# FinTrack Pro

Personal finance management application. Full-stack monorepo with NestJS backend and Next.js frontend.

**Production:** http://104.248.254.226
**Swagger API docs:** http://104.248.254.226/api/docs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10, TypeORM, PostgreSQL 16, Redis 7, BullMQ, Socket.io |
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, Zustand, React Query, Recharts |
| Auth | JWT (access/refresh), 2FA (TOTP), bcrypt |
| Infra | Docker, Nginx, PM2, DigitalOcean |

## Project Structure

```
money/
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── auth/             # JWT + 2FA authentication
│   │   ├── users/            # User management + GDPR
│   │   ├── expenses/         # Expenses CRUD + receipt upload
│   │   ├── income/           # Income CRUD
│   │   ├── perimeters/       # Categories with sharing & permissions
│   │   ├── friends/          # Friend requests & friendships
│   │   ├── analytics/        # CQRS analytics + materialized views
│   │   ├── notifications/    # Notifications + preferences
│   │   ├── scheduler/        # BullMQ recurring transactions
│   │   ├── common/           # Guards, middleware, encryption, events
│   │   └── database/         # Migrations
│   ├── scripts/              # backup-db.sh, rollback-last.sh, validate-migration.sh
│   └── test/                 # E2E tests (auth, expenses)
├── frontend/
│   ├── app/                  # Next.js pages (dashboard, expenses, income, etc.)
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
│   │   └── providers/        # Auth, keyboard shortcuts, RTL
│   ├── lib/
│   │   ├── api/              # API client modules
│   │   ├── i18n/             # Translations (EN, RU, AR)
│   │   └── offline/          # IndexedDB sync queue
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # Zustand state stores
│   └── stories/              # Storybook stories
└── docs/                     # Documentation
```

## Features

**Core Finance**
- Expenses & income tracking with categories, recurring transactions, and receipt upload
- NumPad-based mobile entry with quick presets
- Multi-currency support with auto-conversion
- Budget tracking per category with alerts

**Analytics (CQRS)**
- Dashboard with period-over-period comparison
- Expense breakdown by category (pie chart)
- Cash flow, income trends, monthly comparison charts
- CSV/PDF/Excel export
- Materialized views for fast queries, event-driven cache invalidation

**Social**
- Friend system with requests
- Shared categories (perimeters) with permission matrix: viewer / contributor / manager
- Real-time updates via WebSocket

**Security**
- JWT access (15min) + refresh (7d) tokens
- 2FA via TOTP (speakeasy)
- AES-256-GCM encryption service
- Rate limiting (30 req/min mutations, 100 req/min auth)
- Idempotency middleware for POST/PATCH
- Audit logging, GDPR export/import/deletion with 30-day grace

**Accessibility & i18n**
- ARIA labels on all interactive elements, role=progressbar, aria-live regions
- 3 languages: English, Russian, Arabic (with RTL support)
- Keyboard shortcuts (Ctrl+N, Ctrl+I, Ctrl+?)

**Mobile**
- Responsive design (iPhone SE 320px to tablets)
- Bottom navigation with quick-add overlay
- Pull-to-refresh, swipe-to-delete
- Offline queue with Last-Write-Wins sync

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 16+
- Redis 7+

### Local Development

```bash
git clone https://github.com/olegin77/money.git
cd money
pnpm install

# Start PostgreSQL + Redis via Docker
docker-compose up -d db redis

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
cd backend && pnpm migration:run && cd ..

# Start dev servers
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs

### Build

```bash
cd backend && pnpm build    # NestJS compilation
cd frontend && pnpm build   # Next.js production build
```

### Test

```bash
cd backend && pnpm test         # Unit tests
cd backend && pnpm test:e2e     # E2E tests (auth, expenses)
```

## Production Deployment

The app runs on a DigitalOcean droplet with Nginx reverse proxy.

```bash
# On server
cd /root/money
git pull
cd backend && pnpm build
cd ../frontend && pnpm build
pm2 restart all
```

**Architecture:**
```
Client -> Nginx (:80)
           ├── /api/v1/*    -> NestJS (:3001)
           ├── /api/docs    -> Swagger UI (:3001)
           ├── /socket.io/* -> WebSocket (:3001)
           └── /*           -> Next.js (:3000)
```

**Database scripts** (in `backend/scripts/`):
```bash
./scripts/backup-db.sh           # pg_dump with timestamp
./scripts/rollback-last.sh [N]   # Revert N migrations (default: 1)
./scripts/validate-migration.sh  # Check table integrity
```

## API Overview

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | `POST /auth/register, /auth/login, /auth/refresh, /auth/2fa/*` | Registration, login, 2FA, token refresh |
| Users | `GET/PATCH /users/me, POST /users/me/export, /users/me/import` | Profile, GDPR export/import, account deletion |
| Expenses | `GET/POST/PATCH/DELETE /expenses, POST /expenses/:id/receipt` | CRUD + batch + receipt upload |
| Income | `GET/POST/PATCH/DELETE /income` | CRUD with recurring support |
| Categories | `GET/POST/PATCH/DELETE /perimeters, /perimeters/:id/share` | Categories with sharing & budgets |
| Analytics | `GET /analytics/dashboard, /expenses-by-category, /trend, /cash-flow` | Dashboard & charts |
| Friends | `POST /friends/request, /friends/accept, GET /friends` | Friend requests & list |
| Notifications | `GET /notifications, PATCH /notifications/preferences` | Notifications + granular preferences |

Full API reference with request/response examples: [docs/API.md](docs/API.md)

## Documentation

| File | Description |
|------|-------------|
| [docs/API.md](docs/API.md) | API endpoints reference |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Dev setup, code style, project structure |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, encryption, RBAC, GDPR |
| [docs/MIGRATIONS.md](docs/MIGRATIONS.md) | Database migration procedures |
| [docs/ERROR_CODES.md](docs/ERROR_CODES.md) | API error codes & formats |
| [docs/OFFLINE_SYNC.md](docs/OFFLINE_SYNC.md) | Offline sync & LWW strategy |

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=...
DB_DATABASE=fintrack_pro

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ENCRYPTION_KEY=...          # 32-byte hex for AES-256-GCM

# Server
BACKEND_PORT=3001
BACKEND_HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
```

## License

MIT
