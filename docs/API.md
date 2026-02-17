# API Documentation

## Base URL

```
Development: http://localhost:3001/api/v1
Production: https://api.fintrack.pro/api/v1
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

### Users

#### GET /users/me
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "john_doe",
    "fullName": "John Doe",
    "currency": "USD",
    "themeMode": "dark"
  }
}
```

#### PATCH /users/me
Update current user profile.

### Expenses

#### GET /expenses
Get all expenses for current user.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `categoryId`: string
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
Update expense.

#### DELETE /expenses/:id
Delete expense.

#### POST /expenses/batch
Batch create expenses (for offline sync).

### Income

#### GET /income
Get all income records.

#### POST /income
Create income record.

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

### Perimeters (Categories)

#### GET /perimeters
Get all perimeters for current user.

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
Get perimeter by ID.

#### PATCH /perimeters/:id
Update perimeter.

#### DELETE /perimeters/:id
Soft delete perimeter.

#### POST /perimeters/:id/share
Share perimeter with user.

**Request:**
```json
{
  "userId": "uuid",
  "role": "contributor"
}
```

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

### Notifications

#### GET /notifications
Get all notifications.

#### PATCH /notifications/:id/read
Mark notification as read.

#### DELETE /notifications/:id
Delete notification.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

- **Auth endpoints**: 100 requests per minute
- **API endpoints**: 300 requests per minute

Exceeded limits return `429 Too Many Requests`.

## WebSocket Events

Connect to: `ws://localhost:3001`

### Events

- `expense:created`: New expense created
- `expense:updated`: Expense updated
- `expense:deleted`: Expense deleted
- `friend:request`: Friend request received
- `notification:new`: New notification

### Example

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3001', {
  auth: {
    token: accessToken
  }
});

socket.on('expense:created', (data) => {
  console.log('New expense:', data);
});
```
