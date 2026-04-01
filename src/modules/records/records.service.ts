// Records service encapsulates CRUD + filtering while keeping money-safe values as Prisma Decimal in storage.
import { Prisma } from '@prisma/client';

import { prisma } from '../../database/prisma';
import { HttpError } from '../../shared/http/http-error';

type CreateRecordInput = {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: Date;
  notes?: string;
  actorId: string;
};

type ListRecordsInput = {
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  pageSize: number;
};

type UpdateRecordInput = {
  id: string;
  amount?: number;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  date?: Date;
  notes?: string;
  actorId: string;
};

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

export const createRecord = async (input: CreateRecordInput) => {
  const record = await prisma.financialRecord.create({
    data: {
      amount: new Prisma.Decimal(input.amount),
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

export const listRecords = async (input: ListRecordsInput) => {
  // Date filters are optional and can be combined with type/category for dashboard-friendly querying.
  const where: Prisma.FinancialRecordWhereInput = {
    type: input.type,
    category: input.category,
    date:
      input.fromDate || input.toDate
        ? {
            gte: input.fromDate,
            lte: input.toDate,
          }
        : undefined,
  };

  const [total, records] = await Promise.all([
    prisma.financialRecord.count({ where }),
    prisma.financialRecord.findMany({
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

export const getRecordById = async (id: string) => {
  const record = await prisma.financialRecord.findUnique({
    where: { id },
    select: recordSelect,
  });

  if (!record) {
    throw new HttpError(404, 'RECORD_NOT_FOUND', 'Financial record not found');
  }

  return record;
};

export const updateRecord = async ({ id, actorId, ...input }: UpdateRecordInput) => {
  const existing = await prisma.financialRecord.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw new HttpError(404, 'RECORD_NOT_FOUND', 'Financial record not found');
  }

  const record = await prisma.financialRecord.update({
    where: { id },
    data: {
      amount: input.amount !== undefined ? new Prisma.Decimal(input.amount) : undefined,
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

export const deleteRecord = async (id: string) => {
  const existing = await prisma.financialRecord.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw new HttpError(404, 'RECORD_NOT_FOUND', 'Financial record not found');
  }

  await prisma.financialRecord.delete({ where: { id } });
};
