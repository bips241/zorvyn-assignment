# Endpoint Testing Guide

## Seeded Accounts (planned)
- admin@example.com / admin123
- analyst@example.com / analyst123
- viewer@example.com / viewer123

## Core Test Scenarios
1. Viewer cannot create/update/delete records (`403`).
2. Analyst can read records and dashboard, cannot manage users (`403`).
3. Admin can manage users and records.
4. Inactive user token access denied (`401` or `403`, as defined).
5. Invalid payload returns `400` with details.
6. Summary totals align with created records.
