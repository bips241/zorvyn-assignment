"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const client_1 = require("@prisma/client");
const app_1 = require("../src/app");
const prisma_1 = require("../src/database/prisma");
(0, vitest_1.describe)('Auth endpoints', () => {
    (0, vitest_1.beforeAll)(async () => {
        const passwordHash = await bcryptjs_1.default.hash('admin123', 10);
        await prisma_1.prisma.user.upsert({
            where: { email: 'admin@example.com' },
            create: {
                name: 'System Admin',
                email: 'admin@example.com',
                passwordHash,
                role: client_1.Role.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
            update: {
                passwordHash,
                role: client_1.Role.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
    });
    (0, vitest_1.it)('logs in with valid credentials', async () => {
        const app = (0, app_1.createApp)();
        const response = await (0, supertest_1.default)(app).post('/api/v1/auth/login').send({
            email: 'admin@example.com',
            password: 'admin123',
        });
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body?.data?.accessToken).toBeTypeOf('string');
        (0, vitest_1.expect)(response.body?.data?.user?.email).toBe('admin@example.com');
    });
    (0, vitest_1.it)('returns current user from token', async () => {
        const app = (0, app_1.createApp)();
        const login = await (0, supertest_1.default)(app).post('/api/v1/auth/login').send({
            email: 'admin@example.com',
            password: 'admin123',
        });
        const token = login.body?.data?.accessToken;
        const me = await (0, supertest_1.default)(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
        (0, vitest_1.expect)(me.status).toBe(200);
        (0, vitest_1.expect)(me.body?.data?.user?.email).toBe('admin@example.com');
    });
    (0, vitest_1.it)('rejects invalid credentials', async () => {
        const app = (0, app_1.createApp)();
        const response = await (0, supertest_1.default)(app).post('/api/v1/auth/login').send({
            email: 'admin@example.com',
            password: 'wrong-password',
        });
        (0, vitest_1.expect)(response.status).toBe(401);
    });
});
