# API Documentation

## Base URL

```
Development: http://localhost:3001/api/v1
Production:  http://104.248.254.226/api/v1
Swagger UI:  http://104.248.254.226/api/docs
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### POST /auth/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "john_doe"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

#### POST /auth/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (2FA enabled):**
```json
{
  "success": true,
  "data": {
    "requires2FA": true
  }
}
```

**Response (2FA disabled or code provided):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

#### POST /auth/logout

Logout current user.

#### POST /auth/refresh

Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

#### POST /auth/2fa/generate

Generate a 2FA secret and QR code. Returns `{ secret, qrCode }`.

#### POST /auth/2fa/enable

Enable 2FA by verifying a TOTP code.

**Request:**
```json
{
  "code": "123456"
}
```

#### POST /auth/2fa/disable

Disable 2FA (requires valid TOTP code).

**Request:**
```json
{
  "code": "123456"
}
```

### Users

#### GET /users/me

Get current user profile.

#### PATCH /users/me

Update current user profile.

#### DELETE /users/me

Soft-delete account (30-day grace period before permanent deletion).

#### POST /users/me/cancel-deletion

Cancel a pending account deletion during the 30-day grace period.

#### GET /users/me/export?format=json|csv

Export all user data (profile, expenses, incomes, perimeters). GDPR data portability.

#### POST /users/me/import

Import user data (expenses and incomes).

**Request:**
```json
{
  "expenses": [{ "amount": 45.50, "description": "Groceries", "date": "2026-02-17" }],
  "incomes": [{ "amount": 5000.00, "description": "Salary", "date": "2026-02-01" }]
}
```

#### POST /users/me/consent

Record user consent for data processing.

### Expenses

#### GET /expenses

Get all expenses for current user.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `categoryId`: string (filter by category)
- `startDate`: ISO date
- `endDate`: ISO date

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "amount": 45.50,
        "currency": "USD",
        "description": "Groceries",
        "categoryId": "uuid",
        "date": "2026-02-17",
        "receiptUrl": "/uploads/receipts/userId/filename.jpg",
        "createdAt": "2026-02-17T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

#### POST /expenses

Create new expense.

**Headers (optional):**
- `X-Idempotency-Key`: string - prevents duplicate creation
- `X-Client-Timestamp`: number - epoch ms for offline LWW sync

**Request:**
```json
{
  "amount": 45.50,
  "currency": "USD",
  "description": "Groceries",
  "categoryId": "uuid",
  "date": "2026-02-17",
  "paymentMethod": "credit_card",
  "tags": ["food", "essentials"]
}
```

#### GET /expenses/:id

Get expense by ID.

#### PATCH /expenses/:id

Update expense. If `X-Client-Timestamp` header is provided and the server record is newer, returns `{ data: existingRecord, conflict: true }`.

#### DELETE /expenses/:id

Delete expense.

#### POST /expenses/batch

Batch create expenses (for offline sync).

#### POST /expenses/:id/receipt

Upload a receipt image for an expense.

**Content-Type:** `multipart/form-data`
**Field name:** `receipt`
**Accepted types:** image/jpeg, image/png, application/pdf
**Max size:** 5 MB

The uploaded file is virus-scanned (ClamAV) and optimized (sharp) before storage.

#### GET /expenses/:id/receipt

Download the receipt file for an expense.

### Income

#### GET /income

Get all income records. Same pagination and filtering as expenses.

#### POST /income

Create income record.

**Headers (optional):**
- `X-Idempotency-Key`: string
- `X-Client-Timestamp`: number

**Request:**
```json
{
  "amount": 5000.00,
  "currency": "USD",
  "description": "Monthly salary",
  "source": "Company Inc",
  "date": "2026-02-01",
  "isRecurring": true,
  "recurrenceRule": "monthly"
}
```

#### PATCH /income/:id

Update income record. Supports LWW conflict detection.

#### DELETE /income/:id

Delete income record.

### Perimeters (Categories)

#### GET /perimeters

Get all perimeters for current user (owned + shared).

#### POST /perimeters

Create new perimeter.

**Request:**
```json
{
  "name": "Food & Dining",
  "description": "All food-related expenses",
  "icon": "utensils",
  "color": "#FF6B6B",
  "budget": 500.00,
  "budgetPeriod": "monthly"
}
```

#### GET /perimeters/:id

Get perimeter by ID (respects permission matrix).

#### PATCH /perimeters/:id

Update perimeter (requires manager+ role).

#### DELETE /perimeters/:id

Soft delete perimeter (owner only).

#### POST /perimeters/:id/share

Share perimeter with another user.

**Request:**
```json
{
  "userId": "uuid",
  "role": "contributor"
}
```

Roles: `viewer`, `contributor`, `manager`.

#### DELETE /perimeters/:id/share/:userId

Revoke a user's access to a shared perimeter.

#### GET /perimeters/:id/shares

List all users a perimeter is shared with.

#### GET /perimeters/:id/budget-status

Get budget utilization for a perimeter.

### Friends

#### GET /friends

Get all friends.

#### GET /friends/requests

Get pending friend requests.

#### POST /friends/request

Send friend request.

**Request:**
```json
{
  "addresseeId": "uuid"
}
```

#### POST /friends/accept/:id

Accept friend request.

#### POST /friends/reject/:id

Reject friend request.

#### DELETE /friends/:id

Remove friend.

### Analytics

CQRS pattern: read-optimized queries via `AnalyticsReadService`, write operations via `AnalyticsWriteService`.

#### GET /analytics/dashboard

Get dashboard analytics.

**Query Parameters:**
- `startDate`: ISO date
- `endDate`: ISO date

**Response:**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 1250.50,
    "totalIncome": 5000.00,
    "balance": 3749.50,
    "expensesByCategory": [
      {
        "categoryId": "uuid",
        "categoryName": "Food",
        "amount": 450.00,
        "percentage": 36
      }
    ],
    "recentTransactions": []
  }
}
```

#### GET /analytics/expenses/by-category

Get expenses grouped by category.

#### GET /analytics/expenses/trend

Get expense trend over time.

#### GET /analytics/cash-flow

Get cash flow (income vs expenses) over time.

### Notifications

#### GET /notifications

Get all notifications for current user.

#### PATCH /notifications/:id/read

Mark notification as read.

#### DELETE /notifications/:id

Delete notification.

#### GET /notifications/preferences

Get notification preferences.

#### PATCH /notifications/preferences

Update notification preferences.

**Request:**
```json
{
  "budgetAlerts": true,
  "recurringReminders": false,
  "friendRequests": true,
  "perimeterShares": true,
  "preferredChannels": ["in-app"],
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}
```

### Admin

#### GET /admin/audit-logs

Get audit logs (admin only). Paginated, filterable by userId, method, entity.

## Error Responses

All endpoints return consistent error responses. See [ERROR_CODES.md](./ERROR_CODES.md) for the full reference.

```json
{
  "success": false,
  "code": "BAD_REQUEST",
  "message": "Validation failed",
  "details": ["amount must be a positive number"],
  "path": "/api/v1/expenses",
  "timestamp": "2026-02-20T12:00:00.000Z"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Invalid input |
| 401 | Missing or invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource or idempotency) |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Server error |

## WebSocket Events

Connect to: `ws://localhost:3001` (dev) or `ws://104.248.254.226` (prod, via `/socket.io/` path)

Authentication: pass JWT token in the `auth` object.

### Events

- `expense:created` - new expense created
- `expense:updated` - expense updated
- `expense:deleted` - expense deleted
- `friend:request` - friend request received
- `notification:new` - new notification

### Example

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3001', {
  auth: { token: accessToken }
});

socket.on('expense:created', (data) => {
  console.log('New expense:', data);
});
```
