# API Spec (Draft)

Base URL: `/api/v1`

## Health
- `GET /health` -> service status

## Auth
- `POST /auth/login`
  - body: `{ email, password }`
  - returns: `{ accessToken, user }`

## Users (Admin)
- `POST /users` create user
- `GET /users` list users
- `PATCH /users/:id` update profile/role/status
- `PATCH /users/:id/status` activate/deactivate

## Financial Records
- `POST /records` create record (admin)
- `GET /records` list records (viewer/analyst/admin)
  - query: `type`, `category`, `fromDate`, `toDate`, `page`, `pageSize`
- `GET /records/:id` fetch by id
- `PATCH /records/:id` update record (admin)
- `DELETE /records/:id` delete record (admin)

## Dashboard
- `GET /dashboard/summary`
  - returns totals: income, expense, net
- `GET /dashboard/category-breakdown`
  - returns totals grouped by category
- `GET /dashboard/trends?interval=monthly|weekly`
- `GET /dashboard/recent-activity?limit=10`

## Response Contract
Success:
- `{ data, meta?, message? }`

Error:
- `{ error: { code, message, details? } }`

## Suggested HTTP Status Codes
- `200` ok
- `201` created
- `400` validation/parsing failure
- `401` unauthenticated
- `403` forbidden
- `404` not found
- `409` conflict
- `422` semantic invalid operation
- `500` internal server error
