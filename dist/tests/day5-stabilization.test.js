"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
(0, vitest_1.describe)('Day-5 stabilization checks', () => {
    (0, vitest_1.beforeAll)(async () => {
        const passwordHash = await bcryptjs_1.default.hash('active123', 10);
        await prisma_1.prisma.user.upsert({
            where: { email: 'stabilize-active@example.com' },
            create: {
                name: 'Stabilize Active',
                email: 'stabilize-active@example.com',
                passwordHash,
                role: client_1.Role.ANALYST,
                status: client_1.UserStatus.ACTIVE,
            },
            update: {
                passwordHash,
                role: client_1.Role.ANALYST,
                status: client_1.UserStatus.ACTIVE,
            },
        });
    });
    (0, vitest_1.it)('returns 400 for invalid user creation payload', async () => {
        const adminToken = await login('admin@example.com', 'admin123');
        const response = await (0, supertest_1.default)(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            name: 'x',
            email: 'invalid-email',
            password: '123',
            role: 'INVALID_ROLE',
        });
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body?.error?.code).toBe('VALIDATION_ERROR');
    });
    (0, vitest_1.it)('blocks protected access for user becoming inactive after token issuance', async () => {
        const token = await login('stabilize-active@example.com', 'active123');
        await prisma_1.prisma.user.update({
            where: { email: 'stabilize-active@example.com' },
            data: { status: client_1.UserStatus.INACTIVE },
        });
        const response = await (0, supertest_1.default)(app)
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token}`);
        (0, vitest_1.expect)(response.status).toBe(403);
        (0, vitest_1.expect)(response.body?.error?.code).toBe('USER_INACTIVE');
        await prisma_1.prisma.user.update({
            where: { email: 'stabilize-active@example.com' },
            data: { status: client_1.UserStatus.ACTIVE },
        });
    });
    (0, vitest_1.it)('returns 401 for malformed bearer token', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/api/v1/records')
            .set('Authorization', 'Bearer not-a-valid-token');
        (0, vitest_1.expect)(response.status).toBe(401);
        (0, vitest_1.expect)(response.body?.error?.code).toBe('UNAUTHENTICATED');
    });
    (0, vitest_1.it)('returns 401 when token is signed with wrong secret', async () => {
        const forged = jsonwebtoken_1.default.sign({
            sub: 'non-existing-user',
            email: 'fake@example.com',
            role: 'ADMIN',
        }, 'wrong-secret', { expiresIn: '1h' });
        const response = await (0, supertest_1.default)(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${forged}`);
        (0, vitest_1.expect)(response.status).toBe(401);
        (0, vitest_1.expect)(response.body?.error?.code).toBe('UNAUTHENTICATED');
    });
});
