# Security Documentation

## Authentication & Authorization

### JWT Tokens

- Access token: 15-minute expiry
- Refresh token: 7-day expiry
- Token rotation on refresh
- Tokens returned in response body (Bearer scheme)

### Password Security

- Bcrypt hashing (12 rounds)
- Minimum 8 characters
- Required: uppercase, lowercase, number, special character

### Two-Factor Authentication (2FA)

Implemented with `speakeasy` (TOTP) and `qrcode` for QR generation.

- `POST /auth/2fa/generate` - generates 32-char base32 secret, returns secret + QR code data URL
- `POST /auth/2fa/enable` - verifies TOTP code against stored secret, activates 2FA
- `POST /auth/2fa/disable` - requires valid TOTP code to disable
- Login flow: if 2FA enabled, returns `requires2FA: true` without tokens unless a valid code is provided
- Clock skew tolerance: 2-step window (60 seconds)
- `twoFaSecret` is excluded from all serialized responses

## API Security

### Rate Limiting

Redis-backed `ThrottlerGuard` applied globally via `APP_GUARD`. Per-endpoint overrides:

| Scope | Limit | Window |
|-------|-------|--------|
| Global default | 300 req | 60 sec |
| Auth controller baseline | 100 req | 60 sec |
| `POST /auth/register` | 10 req | 60 sec |
| `POST /auth/login` | 20 req | 60 sec |
| `POST /auth/change-password` | 5 req | 60 sec |
| `POST /auth/forgot-password` | 5 req | 60 sec |
| `POST /auth/reset-password` | 10 req | 60 sec |
| `PATCH /users/me`, `DELETE /users/me` | 5 req | 60 sec |
| `POST /users/me/import` | 5 req | 60 sec |
| `POST /expenses` (mutations) | 30 req | 60 sec |
| `POST /expenses/:id/receipt` | 10 req | 60 sec |

Global limits are configurable via `THROTTLE_TTL` and `THROTTLE_LIMIT_API` environment variables.

### Input Validation

- `class-validator` on all DTOs with `whitelist: true` and `forbidNonWhitelisted: true`
- Type transformation enabled (`enableImplicitConversion`)
- Parameterized queries via TypeORM (SQL injection prevention)

### Security Headers

Helmet.js configured with:

- Content-Security-Policy (self-only defaults, inline styles/scripts for Swagger UI)
- HSTS (max-age 31536000, includeSubDomains, preload)
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- `x-powered-by` header disabled

### CORS

Configured in `main.ts`. Origin read from `CORS_ORIGIN` env var (comma-separated for multiple origins). Allowed headers include `X-Idempotency-Key`, `X-Client-Timestamp`, and `X-Client-Id` for offline sync and idempotency support.

### Idempotency Middleware

Applied to `POST` and `PATCH` requests on `/expenses` and `/income` routes. Reads `X-Idempotency-Key` header. Cached responses are replayed within a 5-minute TTL. Concurrent duplicate requests return HTTP 409. In-process cache with 60-second cleanup interval.

## Data Security

### Encryption

- **AES-256-GCM encryption service** (`common/services/encryption.service.ts`): uses Node.js `crypto` module, 12-byte IV, 16-byte auth tag, output format `iv:authTag:ciphertext` (base64). Key loaded from `ENCRYPTION_KEY` env var (32-byte hex = 64 hex characters), validated at startup. Registered globally in `CommonModule`.
- **Passwords**: bcrypt (12 rounds)
- **2FA secrets**: stored in database, excluded from serialization via `@Exclude()`
- **Sensitive data**: passwords and 2FA secrets stripped from all API responses

### Database

- Parameterized queries (TypeORM)
- Foreign key constraints with cascading deletes where appropriate
- Indexes on frequently queried fields
- Soft delete for perimeters (data retention)

### File Uploads

Receipt upload pipeline (`POST /expenses/:id/receipt`):

1. Multer file interceptor, max 5 MB
2. MIME type check: `image/jpeg`, `image/png`, `application/pdf` only
3. Image optimization via `sharp` (max 1200px width, graceful fallback if sharp not installed)
4. Virus scanning via ClamAV (`clamscan --no-summary`); infected files deleted immediately. Graceful degradation if ClamAV is not installed (logs warning, passes files through)
5. Stored at `uploads/receipts/{userId}/{uuid}{ext}`
6. Path traversal protection via `path.resolve()` comparison

## Access Control

### Role-Based Access Control (RBAC)

- User roles: admin, user
- Perimeter (category) roles: owner, manager, contributor, viewer
- Permission matrix enforced on every service call via `checkPermission(userId, perimeterId, action, resource)`
- Owner bypasses permission matrix entirely
- Non-owners without a share record get HTTP 403

### Permission Matrix

```
Resource         | Owner | Manager | Contributor | Viewer
-----------------|-------|---------|-------------|-------
View summary     | Y     | Y       | Y           | Y
View totals      | Y     | Y       | Y           | Y
View own expenses| Y     | Y       | Y           | N
Write expenses   | Y     | Y       | Y           | N
Edit perimeter   | Y     | Y       | N           | N
Manage shares    | Y     | Y       | N           | N
Delete perimeter | Y     | N       | N           | N
Revoke shares    | Y     | Y       | N           | N
```

## GDPR Compliance

### Data Export

`GET /users/me/export?format=json|csv`

Exports: user profile (excluding password and 2FA secret), all expenses, all incomes, and perimeters. Supports JSON and CSV (multi-section CSV with section headers).

### Data Import

`POST /users/me/import`

Accepts JSON body with `expenses[]` and `incomes[]` arrays (validated via `ImportDataDto`). Rate-limited to 5 requests per minute.

### Account Deletion

`DELETE /users/me`

Soft-deletes the account: sets `isActive = false` and `scheduledForDeletionAt = now + 30 days`. The `AccountCleanupService` cron runs daily at 03:00 and hard-deletes accounts past the 30-day grace period.

`POST /users/me/cancel-deletion` allows reversal during the grace period.

### Consent

`POST /users/me/consent` - records user consent.

## Audit Logging

Global `AuditLogInterceptor` registered via `APP_INTERCEPTOR` in `CommonModule`. Fires on every request but only persists records for write methods (`POST`, `PUT`, `PATCH`, `DELETE`).

### Logged Fields

| Field | Description |
|-------|-------------|
| userId | Authenticated user ID |
| method | HTTP method |
| path | Request path |
| entity | Derived from path (e.g., "expenses") |
| entityId | From route params |
| statusCode | HTTP response status |
| ipAddress | Client IP |
| userAgent | Client user-agent |
| changes | Request body (JSONB, null on DELETE) |

### Storage

`audit_logs` table with indexes on `[userId, createdAt]` and `[entity, createdAt]`.

### Admin Access

`GET /api/v1/admin/audit-logs` - paginated, filterable by userId/method/entity. Protected by `JwtAuthGuard` + `AdminGuard`.

## Offline Sync

Last-Write-Wins (LWW) conflict resolution via `X-Client-Timestamp` header.

- On update: if `clientTimestamp` is provided and the server record's `updatedAt` is newer, the update is rejected with `{ data: existingRecord, conflict: true }` in the response
- On create: `clientTimestamp` field accepted but reserved (no conflict possible on new records)
- Applied to both expenses and income services

See [OFFLINE_SYNC.md](./OFFLINE_SYNC.md) for the full client-side sync architecture.

## Notification Preferences

Per-user notification preferences stored in `notification_preferences` table (one-to-one with users). Auto-created on first access.

| Preference | Type | Default |
|------------|------|---------|
| budgetAlerts | boolean | true |
| recurringReminders | boolean | true |
| friendRequests | boolean | true |
| perimeterShares | boolean | true |
| preferredChannels | string[] | ["in-app"] |
| quietHoursStart | string | null |
| quietHoursEnd | string | null |

The `shouldNotify()` method is checked before every notification creation. System notifications bypass preferences.

Endpoints: `GET /notifications/preferences`, `PATCH /notifications/preferences`.

## OWASP Top 10 Coverage

| Category | Status | Implementation |
|----------|--------|----------------|
| A01: Broken Access Control | Covered | RBAC with permission matrix, user isolation, guard-based protection |
| A02: Cryptographic Failures | Covered | Bcrypt passwords, AES-256-GCM encryption service, HTTPS in production |
| A03: Injection | Covered | Parameterized queries (TypeORM), class-validator input validation |
| A04: Insecure Design | Covered | Security by design, threat modeling |
| A05: Security Misconfiguration | Covered | Helmet.js, production config separate, DB_SYNCHRONIZE=false |
| A06: Vulnerable Components | Monitored | Lock files committed, regular dependency updates |
| A07: Authentication Failures | Covered | Strong password policy, 2FA, rate limiting, session management |
| A08: Software/Data Integrity | Covered | Idempotency middleware, input validation |
| A09: Logging Failures | Covered | Global audit log interceptor, admin query endpoint |
| A10: SSRF | Covered | Input validation, no user-controlled URLs |

## Production Hardening

- Nginx reverse proxy with security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy)
- Gzip compression at Nginx level
- `client_max_body_size 10M`
- WebSocket timeouts: 86400s read/send for long-lived connections
- PM2 process management with automatic restart
- Docker-isolated PostgreSQL and Redis
- Environment variables for all secrets (JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY)
- `DB_SYNCHRONIZE=false` in production
