# Zorvyn Finance Data Processing and Access Control Backend

Author: Biplab Mal  
Email: biplabmal626@gmail.com

Backend assignment submission for finance data processing, role-based access control, and dashboard analytics.

## Stack
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL (Supabase in production, local env configurable)
- Zod validation
- JWT auth
- Vitest + Supertest

## Architecture
Feature-first modular monolith:
- `auth` (login + identity)
- `users` (admin user management)
- `records` (financial records CRUD + filtering)
- `dashboard` (summary analytics)
- `access-control` (role/permission matrix)

Cross-cutting:
- auth middleware (`authenticate`)
- RBAC middleware (`authorize`)
- request validation middleware (`validate`)
- global error normalization

## Local Setup
1. Install dependencies
	- `npm install`
2. Create environment file
	- `cp .env.example .env`
3. Generate Prisma client
	- `npm run prisma:generate`
4. Run DB migration
	- `npm run prisma:migrate`
5. Seed demo users
	- `npm run seed`
6. Start API
	- `npm run dev`

Default server: `http://localhost:4000`

## API Documentation (Swagger)
- Swagger UI (local): `http://localhost:4000/api-docs`
- OpenAPI JSON (local): `http://localhost:4000/api-docs.json`
- Swagger UI (deployed): `https://zorvyn-assignment-kysl.onrender.com/api-docs`
- OpenAPI JSON (deployed): `https://zorvyn-assignment-kysl.onrender.com/api-docs.json`
- Hosted API base URL: `https://zorvyn-assignment-kysl.onrender.com/api/v1`

### Quick test link for reviewers:  `https://zorvyn-assignment-kysl.onrender.com/api-docs`

Documentation includes request/response contracts, auth requirements, query params, and status code behavior.

### Authenticate in Swagger (deployed)
1. Open `https://zorvyn-assignment-kysl.onrender.com/api-docs`
2. Call `POST /api/v1/auth/login` with one of the credentials listed below.
3. Copy `data.accessToken` from response.
4. Click **Authorize** and paste: `Bearer <accessToken>`
5. Call protected endpoints (`/auth/me`, `/users`, `/records`, `/dashboard`).

## Seeded Users
- `admin@example.com` / `admin123`
- `analyst@example.com` / `analyst123`
- `viewer@example.com` / `viewer123`

## Implemented APIs
Base prefix: `/api/v1`

### Health
- `GET /health`

### Auth
- `POST /auth/login`
- `GET /auth/me`

### Users (Admin only)
- `POST /users`
- `GET /users`
- `PATCH /users/:id`
- `PATCH /users/:id/status`

### Records
- `POST /records` (Admin)
- `GET /records` (Viewer, Analyst, Admin)
- `GET /records/:id` (Viewer, Analyst, Admin)
- `PATCH /records/:id` (Admin)
- `DELETE /records/:id` (Admin)

### Dashboard
- `GET /dashboard/summary`
- `GET /dashboard/category-breakdown`
- `GET /dashboard/trends?interval=monthly|weekly`
- `GET /dashboard/recent-activity?limit=10`

## RBAC Snapshot
- `VIEWER`: read records + read dashboard
- `ANALYST`: read records + read dashboard
- `ADMIN`: full access (users, records, dashboard)

## Validation & Errors
- Zod-based validation for body/params/query
- Consistent error shape:
  - `{ error: { code, message, details? } }`
- Common status codes: `400`, `401`, `403`, `404`, `409`, `500`

## Quality Checks
- Lint: `npm run lint`
- Tests: `npm test`
- Build: `npm run build`
- Full smoke verification: `npm run verify`

## Notes / Tradeoffs
- PostgreSQL is used through Prisma with a pooled runtime connection and a direct migration connection.
- Single-role-per-user model keeps authorization explicit and simple.
- Dashboard analytics are computed on-demand for clarity.

## Supporting Documents
- [Architecture](docs/ARCHITECTURE.md)
- [API Spec](docs/API_SPEC.md)
- [RBAC Matrix](docs/RBAC_MATRIX.md)
- [Data Model](docs/DATA_MODEL.md)
- [Validation and Errors](docs/VALIDATION_AND_ERRORS.md)
