# Assumptions

1. Single-tenant system.
2. Currency conversion is out of scope.
3. Only one role per user for assignment simplicity.
4. Record amounts are stored as positive numbers; `type` indicates direction.
5. Dashboard analytics computed on demand (no async aggregation pipeline).
6. JWT auth is acceptable for assignment-level security.
