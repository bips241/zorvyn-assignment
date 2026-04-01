// Dashboard service computes on-demand aggregates for finance widgets (summary, trends, recent activity).
import { Prisma } from '@prisma/client';

import { prisma } from '../../database/prisma';

type DateRangeInput = {
  fromDate?: Date;
  toDate?: Date;
};

type TrendsInput = DateRangeInput & {
  interval: 'monthly' | 'weekly';
};

const buildDateWhere = ({ fromDate, toDate }: DateRangeInput): Prisma.FinancialRecordWhereInput => ({
  date:
    fromDate || toDate
      ? {
          gte: fromDate,
          lte: toDate,
        }
      : undefined,
});

const toNumber = (value: Prisma.Decimal | number): number => Number(value);

const toWeeklyKey = (date: Date): string => {
  // ISO week normalization keeps weekly trend buckets stable across timezones.
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const toMonthlyKey = (date: Date): string => {
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}`;
};

export const getSummary = async (input: DateRangeInput) => {
  const records = await prisma.financialRecord.findMany({
    where: buildDateWhere(input),
    select: { amount: true, type: true },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  for (const record of records) {
    const amount = toNumber(record.amount);
    if (record.type === 'INCOME') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }
  }

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
};

export const getCategoryBreakdown = async (input: DateRangeInput) => {
  const records = await prisma.financialRecord.findMany({
    where: buildDateWhere(input),
    select: { category: true, type: true, amount: true },
  });

  const bucket = new Map<string, { category: string; income: number; expense: number; net: number }>();

  for (const record of records) {
    const current = bucket.get(record.category) ?? {
      category: record.category,
      income: 0,
      expense: 0,
      net: 0,
    };

    const amount = toNumber(record.amount);

    if (record.type === 'INCOME') {
      current.income += amount;
      current.net += amount;
    } else {
      current.expense += amount;
      current.net -= amount;
    }

    bucket.set(record.category, current);
  }

  return Array.from(bucket.values()).sort((a, b) => b.net - a.net);
};

export const getTrends = async (input: TrendsInput) => {
  const records = await prisma.financialRecord.findMany({
    where: buildDateWhere(input),
    select: { date: true, type: true, amount: true },
  });

  const grouped = new Map<string, { period: string; income: number; expense: number; net: number }>();

  for (const record of records) {
    const period = input.interval === 'weekly' ? toWeeklyKey(record.date) : toMonthlyKey(record.date);

    const current = grouped.get(period) ?? {
      period,
      income: 0,
      expense: 0,
      net: 0,
    };

    const amount = toNumber(record.amount);

    if (record.type === 'INCOME') {
      current.income += amount;
      current.net += amount;
    } else {
      current.expense += amount;
      current.net -= amount;
    }

    grouped.set(period, current);
  }

  return Array.from(grouped.values()).sort((a, b) => a.period.localeCompare(b.period));
};

export const getRecentActivity = async (limit: number) => {
  const records = await prisma.financialRecord.findMany({
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      date: true,
      type: true,
      category: true,
      amount: true,
      notes: true,
      createdAt: true,
    },
  });

  return records.map((record) => ({
    ...record,
    amount: toNumber(record.amount),
  }));
};
