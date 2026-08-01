# Reference Plan: Dashboard Date Range Filtering

## Root Cause

In `src/modules/dashboard/dashboard.service.ts`, the `buildDateWhere` function constructs a Prisma date filter:

```typescript
const buildDateWhere = ({ fromDate, toDate }: DateRangeInput) => ({
  date:
    fromDate || toDate
      ? {
          gte: fromDate,    // PROBLEM: undefined when fromDate is not provided
          lte: toDate,      // PROBLEM: undefined when toDate is not provided
        }
      : undefined,
});
```

When `fromDate` is undefined but `toDate` is provided, the object becomes `{ gte: undefined, lte: toDate }`. Prisma cannot handle `undefined` values in where clauses—it treats them as missing constraints and either ignores them or throws an error.

## Fix Strategy

Use conditional object spreading to include only non-undefined date constraints:

```typescript
const buildDateWhere = ({ fromDate, toDate }: DateRangeInput) => ({
  date:
    fromDate || toDate
      ? {
          ...(fromDate && { gte: fromDate }),
          ...(toDate && { lte: toDate }),
        }
      : undefined,
});
```

This way:
- If only `toDate` is provided: `{ date: { lte: toDate } }`
- If only `fromDate` is provided: `{ date: { gte: fromDate } }`
- If both are provided: `{ date: { gte: fromDate, lte: toDate } }`
- If neither is provided: `{ date: undefined }`

## Test Plan

The test file `dashboard-date-range.test.ts` exercises three scenarios:

1. **Only toDate filter** - Creates records at Jan 15, Feb 10, Mar 20; queries with `toDate=2030-02-15`; expects only Jan 15 and Feb 10 totals (1000 income, 500 expense).

2. **Only fromDate filter** - Same records; queries with `fromDate=2030-02-01`; expects only Feb 10 and Mar 20 totals (800 income, 500 expense).

3. **Trends with partial range** - Tests that the trends endpoint correctly aggregates when using `toDate=2030-02-28`; expects 2 periods with correct per-period totals.

All tests call real HTTP endpoints, verify HTTP status codes, and assert on actual numeric results from the API response, ensuring behavioral correctness rather than implementation details.

## Why This Is Fair and Hard

- **Non-obvious root cause**: The bug is in date filter construction logic, not in the endpoint handlers themselves. The agent must trace from endpoint to service layer.
- **Subtle edge case**: The issue only manifests when one parameter is absent—passing both works fine. This requires careful testing and understanding of optional parameters.
- **Multiple functions affected**: All three dashboard aggregation functions (`getSummary`, `getCategoryBreakdown`, `getTrends`) use the same buggy `buildDateWhere` helper.
- **Requires understanding Prisma**: The fix requires knowing that Prisma where clauses cannot include undefined values and that object spreading is the right pattern.
