"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const app_1 = require("../src/app");
(0, vitest_1.describe)('Swagger documentation', () => {
    (0, vitest_1.it)('serves OpenAPI JSON', async () => {
        const app = (0, app_1.createApp)();
        const response = await (0, supertest_1.default)(app).get('/api-docs.json');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body?.openapi).toBe('3.0.3');
        (0, vitest_1.expect)(response.body?.paths?.['/api/v1/auth/login']).toBeDefined();
    });
    (0, vitest_1.it)('serves Swagger UI', async () => {
        const app = (0, app_1.createApp)();
        const response = await (0, supertest_1.default)(app).get('/api-docs');
        (0, vitest_1.expect)(response.status).toBe(301);
    });
});
