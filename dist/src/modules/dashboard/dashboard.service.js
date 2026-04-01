"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getTrends = exports.getCategoryBreakdown = exports.getSummary = void 0;
const prisma_1 = require("../../database/prisma");
const buildDateWhere = ({ fromDate, toDate }) => ({
    date: fromDate || toDate
        ? {
            gte: fromDate,
            lte: toDate,
        }
        : undefined,
});
const toNumber = (value) => Number(value);
const toWeeklyKey = (date) => {
    const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};
const toMonthlyKey = (date) => {
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${date.getUTCFullYear()}-${month}`;
};
const getSummary = async (input) => {
    const records = await prisma_1.prisma.financialRecord.findMany({
        where: buildDateWhere(input),
        select: { amount: true, type: true },
    });
    let totalIncome = 0;
    let totalExpense = 0;
    for (const record of records) {
        const amount = toNumber(record.amount);
        if (record.type === 'INCOME') {
            totalIncome += amount;
        }
        else {
            totalExpense += amount;
        }
    }
    return {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
    };
};
exports.getSummary = getSummary;
const getCategoryBreakdown = async (input) => {
    const records = await prisma_1.prisma.financialRecord.findMany({
        where: buildDateWhere(input),
        select: { category: true, type: true, amount: true },
    });
    const bucket = new Map();
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
        }
        else {
            current.expense += amount;
            current.net -= amount;
        }
        bucket.set(record.category, current);
    }
    return Array.from(bucket.values()).sort((a, b) => b.net - a.net);
};
exports.getCategoryBreakdown = getCategoryBreakdown;
const getTrends = async (input) => {
    const records = await prisma_1.prisma.financialRecord.findMany({
        where: buildDateWhere(input),
        select: { date: true, type: true, amount: true },
    });
    const grouped = new Map();
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
        }
        else {
            current.expense += amount;
            current.net -= amount;
        }
        grouped.set(period, current);
    }
    return Array.from(grouped.values()).sort((a, b) => a.period.localeCompare(b.period));
};
exports.getTrends = getTrends;
const getRecentActivity = async (limit) => {
    const records = await prisma_1.prisma.financialRecord.findMany({
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
exports.getRecentActivity = getRecentActivity;
