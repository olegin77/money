# API Error Codes Reference

## Error Response Format

All API errors follow a standard JSON format:

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

## Error Codes

| Code                  | HTTP Status | Description                                    |
|-----------------------|-------------|------------------------------------------------|
| `BAD_REQUEST`         | 400         | Invalid request format or missing required fields |
| `UNAUTHORIZED`        | 401         | Missing or invalid authentication token        |
| `FORBIDDEN`           | 403         | Authenticated but insufficient permissions     |
| `NOT_FOUND`           | 404         | Requested resource does not exist              |
| `CONFLICT`            | 409         | Resource conflict (e.g., duplicate email)      |
| `UNPROCESSABLE_ENTITY`| 422         | Request body failed validation                 |
| `TOO_MANY_REQUESTS`   | 429         | Rate limit exceeded                            |
| `INTERNAL_ERROR`      | 500         | Unexpected server error                        |

## Common Scenarios

### Authentication Errors (401)

```json
{ "code": "UNAUTHORIZED", "message": "Invalid or expired token" }
```

**Causes:**
- Missing `Authorization: Bearer <token>` header
- Token has expired (15-minute access token lifetime)
- Token was issued for a deleted account

**Resolution:** Re-authenticate via `POST /api/v1/auth/login`

### Validation Errors (422)

```json
{
  "code": "UNPROCESSABLE_ENTITY",
  "message": "Validation failed",
  "details": [
    "amount must be a positive number",
    "date must be a valid ISO 8601 date string"
  ]
}
```

**Causes:**
- Missing required fields (amount, date)
- Invalid field formats (non-numeric amount, invalid date)
- Field value out of range (amount <= 0)

### Permission Errors (403)

```json
{ "code": "FORBIDDEN", "message": "Permission denied" }
```

**Causes:**
- Accessing another user's resources
- Shared perimeter role insufficient for the action (e.g., viewer trying to write)
- Non-admin user accessing admin endpoints

### Rate Limiting (429)

```json
{ "code": "TOO_MANY_REQUESTS", "message": "Too many requests" }
```

**Limits:**
- General API: 300 requests per minute
- Authentication: 10 requests per minute
- Data import: 5 requests per minute
- Data export: 10 requests per minute

### Conflict Errors (409)

```json
{ "code": "CONFLICT", "message": "Email already registered" }
```

**Causes:**
- Duplicate email during registration
- Duplicate username during registration
- Friend request already sent

## Handling Errors in Frontend

```typescript
try {
  const response = await api.post('/expenses', data);
} catch (error) {
  if (error.response?.status === 422) {
    // Show validation errors to user
    const details = error.response.data.details;
    showFieldErrors(details);
  } else if (error.response?.status === 401) {
    // Redirect to login
    router.push('/login');
  } else if (error.response?.status === 429) {
    // Show rate limit message, retry after delay
    toast.error('Too many requests. Please wait a moment.');
  } else {
    // Generic error
    toast.error('Something went wrong');
  }
}
```
