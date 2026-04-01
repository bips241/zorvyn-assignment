"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecordSchema = exports.recordByIdSchema = exports.listRecordsSchema = exports.createRecordSchema = void 0;
const zod_1 = require("zod");
const recordTypeEnum = zod_1.z.enum(['INCOME', 'EXPENSE']);
exports.createRecordSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.coerce.number().positive(),
        type: recordTypeEnum,
        category: zod_1.z.string().trim().min(1),
        date: zod_1.z.coerce.date(),
        notes: zod_1.z.string().trim().max(500).optional(),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.listRecordsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({
        type: recordTypeEnum.optional(),
        category: zod_1.z.string().trim().min(1).optional(),
        fromDate: zod_1.z.coerce.date().optional(),
        toDate: zod_1.z.coerce.date().optional(),
        page: zod_1.z.coerce.number().int().min(1).default(1),
        pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    }),
});
exports.recordByIdSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    query: zod_1.z.object({}).optional(),
});
exports.updateRecordSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        amount: zod_1.z.coerce.number().positive().optional(),
        type: recordTypeEnum.optional(),
        category: zod_1.z.string().trim().min(1).optional(),
        date: zod_1.z.coerce.date().optional(),
        notes: zod_1.z.string().trim().max(500).optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field is required',
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    query: zod_1.z.object({}).optional(),
});
