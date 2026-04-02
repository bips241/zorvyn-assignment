# Tradeoffs

## Hosted PostgreSQL vs local SQLite
- PostgreSQL gives a production-like deployment path and shared hosted persistence.
- SQLite would be simpler for local-only setup, but it would not match the deployed environment as closely.
- Prisma keeps the switch between storage engines manageable.

## Single-role model
- Simpler for assignment clarity and authorization checks.
- Less flexible than a multi-role model if a user needs overlapping permissions later.

## On-demand dashboard aggregation
- Keeps architecture simple and avoids extra sync jobs.
- Can become slower as data grows, so a cache or pre-aggregation layer would be needed later.
