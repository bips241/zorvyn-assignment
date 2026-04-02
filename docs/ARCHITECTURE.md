# Architecture

## Style
Modular monolith with clear boundaries by feature.

## Layers per Module
Each module follows:
- `controller`: HTTP request/response handling
- `service`: business logic
- `repository`: persistence access (Prisma)
- `schema`: input validation schema
- `types`: DTOs and domain types

## Core Modules
- `auth`: login/token/identity extraction
- `users`: user lifecycle + role assignment + status
- `records`: financial entries CRUD + filtering
- `dashboard`: aggregates/trends/recent activity
- `access-control`: role-permission mapping + policy checks

## Cross-Cutting Concerns
- Authentication middleware
- Authorization middleware
- Validation middleware
- Error normalization middleware
- Request logging and security headers

## Request Flow
1. Route receives request
2. Auth middleware validates token (if protected)
3. Authorization middleware checks permission
4. Validation middleware parses and validates payload
5. Controller delegates to service
6. Service executes business rules + repository calls
7. Controller returns standardized response

## Data Consistency Rules
- Amount always positive; sign inferred from record type
- `type` must be one of `INCOME | EXPENSE`
- Date stored in UTC ISO format
- Inactive users cannot access protected endpoints
- Soft delete (optional) should exclude deleted rows by default
