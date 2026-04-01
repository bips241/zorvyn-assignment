"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const client_1 = require("@prisma/client");
const app_1 = require("../src/app");
const prisma_1 = require("../src/database/prisma");
dotenv_1.default.config();
const app = (0, app_1.createApp)();
const login = async (email, password) => {
    const response = await (0, supertest_1.default)(app).post('/api/v1/auth/login').send({ email, password });
    return response.body?.data?.accessToken;
};
(0, vitest_1.describe)('Phase-2 users and records', () => {
    (0, vitest_1.beforeAll)(async () => {
        const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
        const viewerPassword = await bcryptjs_1.default.hash('viewer123', 10);
        await prisma_1.prisma.user.upsert({
            where: { email: 'admin@example.com' },
            create: {
                name: 'System Admin',
                email: 'admin@example.com',
                passwordHash: adminPassword,
                role: client_1.Role.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
            update: {
                passwordHash: adminPassword,
                role: client_1.Role.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        await prisma_1.prisma.user.upsert({
            where: { email: 'viewer@example.com' },
            create: {
                name: 'Read Only Viewer',
                email: 'viewer@example.com',
                passwordHash: viewerPassword,
                role: client_1.Role.VIEWER,
                status: client_1.UserStatus.ACTIVE,
            },
            update: {
                passwordHash: viewerPassword,
                role: client_1.Role.VIEWER,
                status: client_1.UserStatus.ACTIVE,
            },
        });
    });
    (0, vitest_1.it)('admin can create user', async () => {
        const adminToken = await login('admin@example.com', 'admin123');
        const response = await (0, supertest_1.default)(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            name: 'Created User',
            email: `created-${Date.now()}@example.com`,
            password: 'sample123',
            role: 'ANALYST',
        });
        (0, vitest_1.expect)(response.status).toBe(201);
        (0, vitest_1.expect)(response.body?.data?.email).toContain('@example.com');
    });
    (0, vitest_1.it)('viewer cannot list users', async () => {
        const viewerToken = await login('viewer@example.com', 'viewer123');
        const response = await (0, supertest_1.default)(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${viewerToken}`);
        (0, vitest_1.expect)(response.status).toBe(403);
    });
    (0, vitest_1.it)('admin can create record and viewer can read records', async () => {
        const adminToken = await login('admin@example.com', 'admin123');
        const viewerToken = await login('viewer@example.com', 'viewer123');
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/v1/records')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            amount: 2500,
            type: 'INCOME',
            category: 'Salary',
            date: new Date().toISOString(),
            notes: 'Monthly payment',
        });
        (0, vitest_1.expect)(createResponse.status).toBe(201);
        const listResponse = await (0, supertest_1.default)(app)
            .get('/api/v1/records?page=1&pageSize=10')
            .set('Authorization', `Bearer ${viewerToken}`);
        (0, vitest_1.expect)(listResponse.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(listResponse.body?.data)).toBe(true);
    });
    (0, vitest_1.it)('viewer cannot create record', async () => {
        const viewerToken = await login('viewer@example.com', 'viewer123');
        const response = await (0, supertest_1.default)(app)
            .post('/api/v1/records')
            .set('Authorization', `Bearer ${viewerToken}`)
            .send({
            amount: 100,
            type: 'EXPENSE',
            category: 'Food',
            date: new Date().toISOString(),
        });
        (0, vitest_1.expect)(response.status).toBe(403);
    });
});
