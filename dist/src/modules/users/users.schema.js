"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatusSchema = exports.updateUserSchema = exports.listUsersSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const roleEnum = zod_1.z.enum(['VIEWER', 'ANALYST', 'ADMIN']);
const statusEnum = zod_1.z.enum(['ACTIVE', 'INACTIVE']);
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(2),
        email: zod_1.z.string().trim().email(),
        password: zod_1.z.string().min(6),
        role: roleEnum,
        status: statusEnum.optional(),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.listUsersSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({
        status: statusEnum.optional(),
        role: roleEnum.optional(),
        page: zod_1.z.coerce.number().int().min(1).default(1),
        pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().trim().min(2).optional(),
        email: zod_1.z.string().trim().email().optional(),
        role: roleEnum.optional(),
        status: statusEnum.optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field is required',
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    query: zod_1.z.object({}).optional(),
});
exports.updateUserStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: statusEnum,
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    query: zod_1.z.object({}).optional(),
});
