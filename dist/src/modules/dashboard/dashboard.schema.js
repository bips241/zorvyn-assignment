"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recentActivitySchema = exports.trendsSchema = exports.categoryBreakdownSchema = exports.summarySchema = void 0;
// Dashboard query validation shared across summary/breakdown/trend endpoints.
const zod_1 = require("zod");
const baseDateQuery = {
    fromDate: zod_1.z.coerce.date().optional(),
    toDate: zod_1.z.coerce.date().optional(),
};
exports.summarySchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object(baseDateQuery),
});
exports.categoryBreakdownSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object(baseDateQuery),
});
exports.trendsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({
        ...baseDateQuery,
        interval: zod_1.z.enum(['monthly', 'weekly']).default('monthly'),
    }),
});
exports.recentActivitySchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({
        limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    }),
});
