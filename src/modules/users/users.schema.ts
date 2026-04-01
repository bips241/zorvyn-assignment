// User module validation contracts. I keep these strict to fail fast before business logic runs.
import { z } from 'zod';

const roleEnum = z.enum(['VIEWER', 'ANALYST', 'ADMIN']);
const statusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: z.string().min(6),
    role: roleEnum,
    status: statusEnum.optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listUsersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    status: statusEnum.optional(),
    role: roleEnum.optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).optional(),
      email: z.string().trim().email().optional(),
      role: roleEnum.optional(),
      status: statusEnum.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional(),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: statusEnum,
  }),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional(),
});
