# Fix Dashboard Date Range Filtering Bug

## Problem Description

The dashboard summary, trends, and category breakdown endpoints support optional date range filtering with `fromDate` and `toDate` query parameters. However, when only one of these parameters is provided (e.g., only `toDate` without `fromDate`), the query fails to filter records correctly.

## Expected Behavior

- When only `toDate` is provided, return all records up to and including that date
- When only `fromDate` is provided, return all records from that date onwards  
- When both are provided, return records within the inclusive range
- When neither is provided, return all records

## Actual Behavior

When only `toDate` is provided without `fromDate`, the query includes an undefined `gte` constraint, which causes Prisma to malfunction or return incorrect results. The same issue occurs when only `fromDate` is provided without `toDate`.

## Test Cases

1. Calling `GET /api/v1/dashboard/summary?toDate=2030-02-15` with records dated Jan 15, Feb 10, and Mar 20 should return only Jan 15 and Feb 10 records.
2. Calling `GET /api/v1/dashboard/summary?fromDate=2030-02-01` with the same records should return only Feb 10 and Mar 20 records.
3. The trends endpoint should correctly aggregate data when using partial date ranges.

## Files Involved

- `src/modules/dashboard/dashboard.service.ts` - The service layer computes aggregates using date filtering

## Constraints

- Fix must handle all three dashboard endpoints: summary, category breakdown, and trends
- Filtering logic must work with optional start/end dates
- All existing tests must continue to pass
