# Data Model (Prisma Draft)

## User
- `id`: string (uuid)
- `name`: string
- `email`: string (unique)
- `passwordHash`: string
- `role`: enum (`VIEWER`, `ANALYST`, `ADMIN`)
- `status`: enum (`ACTIVE`, `INACTIVE`)
- `createdAt`, `updatedAt`

## FinancialRecord
- `id`: string (uuid)
- `amount`: decimal
- `type`: enum (`INCOME`, `EXPENSE`)
- `category`: string
- `date`: datetime
- `notes`: string?
- `createdById`: string (FK -> User)
- `updatedById`: string?
- `createdAt`, `updatedAt`

## Notes
- Use decimal for financial precision
- Add indexes on `date`, `category`, `type`
- Optional: `deletedAt` for soft delete
