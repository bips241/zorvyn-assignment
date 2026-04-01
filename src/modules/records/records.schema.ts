// Record request validation schemas. Amount stays positive and transaction direction comes from `type`.
import { z } from 'zod';

const recordTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive(),
    type: recordTypeEnum,
    category: z.string().trim().min(1),
    date: z.coerce.date(),
    notes: z.string().trim().max(500).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listRecordsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    type: recordTypeEnum.optional(),
    category: z.string().trim().min(1).optional(),
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const recordByIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional(),
});

export const updateRecordSchema = z.object({
  body: z
    .object({
      amount: z.coerce.number().positive().optional(),
      type: recordTypeEnum.optional(),
      category: z.string().trim().min(1).optional(),
      date: z.coerce.date().optional(),
      notes: z.string().trim().max(500).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional(),
});
