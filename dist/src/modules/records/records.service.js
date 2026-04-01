"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecord = exports.updateRecord = exports.getRecordById = exports.listRecords = exports.createRecord = void 0;
// Records service encapsulates CRUD + filtering while keeping money-safe values as Prisma Decimal in storage.
const client_1 = require("@prisma/client");
const prisma_1 = require("../../database/prisma");
const http_error_1 = require("../../shared/http/http-error");
const recordSelect = {
    id: true,
    amount: true,
    type: true,
    category: true,
    date: true,
    notes: true,
    createdById: true,
    updatedById: true,
    createdAt: true,
    updatedAt: true,
};
const createRecord = async (input) => {
    const record = await prisma_1.prisma.financialRecord.create({
        data: {
            amount: new client_1.Prisma.Decimal(input.amount),
            type: input.type,
            category: input.category,
            date: input.date,
            notes: input.notes,
            createdById: input.actorId,
        },
        select: recordSelect,
    });
    return record;
};
exports.createRecord = createRecord;
const listRecords = async (input) => {
    // Date filters are optional and can be combined with type/category for dashboard-friendly querying.
    const where = {
        type: input.type,
        category: input.category,
        date: input.fromDate || input.toDate
            ? {
                gte: input.fromDate,
                lte: input.toDate,
            }
            : undefined,
    };
    const [total, records] = await Promise.all([
        prisma_1.prisma.financialRecord.count({ where }),
        prisma_1.prisma.financialRecord.findMany({
            where,
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize,
            orderBy: { date: 'desc' },
            select: recordSelect,
        }),
    ]);
    return {
        records,
        meta: {
            total,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil(total / input.pageSize),
        },
    };
};
exports.listRecords = listRecords;
const getRecordById = async (id) => {
    const record = await prisma_1.prisma.financialRecord.findUnique({
        where: { id },
        select: recordSelect,
    });
    if (!record) {
        throw new http_error_1.HttpError(404, 'RECORD_NOT_FOUND', 'Financial record not found');
    }
    return record;
};
exports.getRecordById = getRecordById;
const updateRecord = async ({ id, actorId, ...input }) => {
    const existing = await prisma_1.prisma.financialRecord.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
        throw new http_error_1.HttpError(404, 'RECORD_NOT_FOUND', 'Financial record not found');
    }
    const record = await prisma_1.prisma.financialRecord.update({
        where: { id },
        data: {
            amount: input.amount !== undefined ? new client_1.Prisma.Decimal(input.amount) : undefined,
            type: input.type,
            category: input.category,
            date: input.date,
            notes: input.notes,
            updatedById: actorId,
        },
        select: recordSelect,
    });
    return record;
};
exports.updateRecord = updateRecord;
const deleteRecord = async (id) => {
    const existing = await prisma_1.prisma.financialRecord.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
        throw new http_error_1.HttpError(404, 'RECORD_NOT_FOUND', 'Financial record not found');
    }
    await prisma_1.prisma.financialRecord.delete({ where: { id } });
};
exports.deleteRecord = deleteRecord;
