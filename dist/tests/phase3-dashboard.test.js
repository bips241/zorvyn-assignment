"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const prisma_1 = require("../src/database/prisma");
const app_1 = require("../src/app");
dotenv_1.default.config();
const app = (0, app_1.createApp)();
const login = async (email, password) => {
    const response = await (0, supertest_1.default)(app).post('/api/v1/auth/login').send({ email, password });
    return response.body?.data?.accessToken;
};
(0, vitest_1.describe)('Phase-3 dashboard analytics', () => {
    (0, vitest_1.beforeAll)(async () => {
        const admin = await prisma_1.prisma.user.findUnique({ where: { email: 'admin@example.com' }, select: { id: true } });
        if (!admin) {
            throw new Error('Missing seeded admin user');
        }
        await prisma_1.prisma.financialRecord.deleteMany({
            where: {
                notes: 'phase3 fixture income',
            },
        });
        await prisma_1.prisma.financialRecord.deleteMany({
            where: {
                notes: 'phase3 fixture expense',
            },
        });
        await prisma_1.prisma.financialRecord.createMany({
            data: [
                {
                    amount: 3000,
                    type: 'INCOME',
                    category: 'Salary-2030',
                    date: new Date('2030-01-05T10:00:00.000Z'),
                    notes: 'phase3 fixture income',
                    createdById: admin.id,
                },
                {
                    amount: 500,
                    type: 'EXPENSE',
                    category: 'Rent-2030',
                    date: new Date('2030-01-07T10:00:00.000Z'),
                    notes: 'phase3 fixture expense',
                    createdById: admin.id,
                },
                {
                    amount: 250,
                    type: 'EXPENSE',
                    category: 'Food-2030',
                    date: new Date('2030-02-01T10:00:00.000Z'),
                    notes: 'phase3 fixture expense',
                    createdById: admin.id,
                },
            ],
        });
    });
    (0, vitest_1.it)('viewer can access summary analytics', async () => {
        const viewerToken = await login('viewer@example.com', 'viewer123');
        const response = await (0, supertest_1.default)(app)
            .get('/api/v1/dashboard/summary?fromDate=2030-01-01&toDate=2030-12-31')
            .set('Authorization', `Bearer ${viewerToken}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body?.data?.totalIncome).toBe(3000);
        (0, vitest_1.expect)(response.body?.data?.totalExpense).toBe(750);
        (0, vitest_1.expect)(response.body?.data?.netBalance).toBe(2250);
    });
    (0, vitest_1.it)('returns category breakdown for date range', async () => {
        const viewerToken = await login('viewer@example.com', 'viewer123');
        const response = await (0, supertest_1.default)(app)
            .get('/api/v1/dashboard/category-breakdown?fromDate=2030-01-01&toDate=2030-12-31')
            .set('Authorization', `Bearer ${viewerToken}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(response.body?.data)).toBe(true);
        (0, vitest_1.expect)(response.body.data.some((row) => row.category === 'Salary-2030')).toBe(true);
    });
    (0, vitest_1.it)('returns trends by monthly and weekly intervals', async () => {
        const viewerToken = await login('viewer@example.com', 'viewer123');
        const monthly = await (0, supertest_1.default)(app)
            .get('/api/v1/dashboard/trends?interval=monthly&fromDate=2030-01-01&toDate=2030-12-31')
            .set('Authorization', `Bearer ${viewerToken}`);
        const weekly = await (0, supertest_1.default)(app)
            .get('/api/v1/dashboard/trends?interval=weekly&fromDate=2030-01-01&toDate=2030-12-31')
            .set('Authorization', `Bearer ${viewerToken}`);
        (0, vitest_1.expect)(monthly.status).toBe(200);
        (0, vitest_1.expect)(weekly.status).toBe(200);
        (0, vitest_1.expect)(monthly.body.data.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(weekly.body.data.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('returns recent activity with limit', async () => {
        const viewerToken = await login('viewer@example.com', 'viewer123');
        const response = await (0, supertest_1.default)(app)
            .get('/api/v1/dashboard/recent-activity?limit=2')
            .set('Authorization', `Bearer ${viewerToken}`);
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(response.body?.data)).toBe(true);
        (0, vitest_1.expect)(response.body.data.length).toBeLessThanOrEqual(2);
    });
});
