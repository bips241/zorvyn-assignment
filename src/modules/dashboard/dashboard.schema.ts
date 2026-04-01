// Dashboard query validation shared across summary/breakdown/trend endpoints.
import { z } from 'zod';

const baseDateQuery = {
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
};

export const summarySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object(baseDateQuery),
});

export const categoryBreakdownSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object(baseDateQuery),
});

export const trendsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    ...baseDateQuery,
    interval: z.enum(['monthly', 'weekly']).default('monthly'),
  }),
});

export const recentActivitySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});
