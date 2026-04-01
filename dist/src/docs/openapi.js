"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiSpec = void 0;
// This is the single OpenAPI source of truth used by both `/api-docs` and `/api-docs.json`.
const demoLink = process.env.DEMO_LINK?.trim();
const deployedBaseUrl = demoLink
    ? demoLink.replace(/\/api-docs(?:\.json)?\/?$/, '')
    : undefined;
const openApiServers = [
    { url: 'http://localhost:4000', description: 'Local development' },
    ...(deployedBaseUrl
        ? [{ url: deployedBaseUrl, description: 'Production (Render)' }]
        : []),
];
exports.openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Zorvyn Finance Backend API',
        version: '1.0.0',
        description: 'Finance data processing and role-based access control API for dashboard, users, and records.',
        contact: {
            name: 'Biplab Mal',
            email: 'biplabmal626@gmail.com',
        },
    },
    servers: openApiServers,
    tags: [
        { name: 'Health', description: 'Service status endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Records', description: 'Financial record endpoints' },
        { name: 'Dashboard', description: 'Dashboard analytics endpoints' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    error: {
                        type: 'object',
                        properties: {
                            code: { type: 'string', example: 'VALIDATION_ERROR' },
                            message: { type: 'string', example: 'Invalid request input' },
                            details: { type: 'array', items: { type: 'object' } },
                        },
                        required: ['code', 'message'],
                    },
                },
                required: ['error'],
            },
            Role: {
                type: 'string',
                enum: ['VIEWER', 'ANALYST', 'ADMIN'],
            },
            UserStatus: {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE'],
            },
            RecordType: {
                type: 'string',
                enum: ['INCOME', 'EXPENSE'],
            },
            AuthLoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                },
            },
            AuthUser: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { $ref: '#/components/schemas/Role' },
                    status: { $ref: '#/components/schemas/UserStatus' },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { $ref: '#/components/schemas/Role' },
                    status: { $ref: '#/components/schemas/UserStatus' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            CreateUserRequest: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                    name: { type: 'string', minLength: 2 },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    role: { $ref: '#/components/schemas/Role' },
                    status: { $ref: '#/components/schemas/UserStatus' },
                },
            },
            UpdateUserRequest: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 2 },
                    email: { type: 'string', format: 'email' },
                    role: { $ref: '#/components/schemas/Role' },
                    status: { $ref: '#/components/schemas/UserStatus' },
                },
            },
            UpdateUserStatusRequest: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { $ref: '#/components/schemas/UserStatus' },
                },
            },
            FinancialRecord: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    amount: { type: 'number', format: 'float' },
                    type: { $ref: '#/components/schemas/RecordType' },
                    category: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    notes: { type: 'string', nullable: true },
                    createdById: { type: 'string' },
                    updatedById: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            CreateRecordRequest: {
                type: 'object',
                required: ['amount', 'type', 'category', 'date'],
                properties: {
                    amount: { type: 'number', minimum: 0.01 },
                    type: { $ref: '#/components/schemas/RecordType' },
                    category: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    notes: { type: 'string', maxLength: 500 },
                },
            },
            UpdateRecordRequest: {
                type: 'object',
                properties: {
                    amount: { type: 'number', minimum: 0.01 },
                    type: { $ref: '#/components/schemas/RecordType' },
                    category: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    notes: { type: 'string', maxLength: 500 },
                },
            },
            DashboardSummary: {
                type: 'object',
                properties: {
                    totalIncome: { type: 'number' },
                    totalExpense: { type: 'number' },
                    netBalance: { type: 'number' },
                },
            },
            CategoryBreakdownItem: {
                type: 'object',
                properties: {
                    category: { type: 'string' },
                    income: { type: 'number' },
                    expense: { type: 'number' },
                    net: { type: 'number' },
                },
            },
            TrendItem: {
                type: 'object',
                properties: {
                    period: { type: 'string', example: '2030-01' },
                    income: { type: 'number' },
                    expense: { type: 'number' },
                    net: { type: 'number' },
                },
            },
            RecentActivityItem: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    type: { $ref: '#/components/schemas/RecordType' },
                    category: { type: 'string' },
                    amount: { type: 'number' },
                    notes: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    },
    paths: {
        '/api/v1/health': {
            get: {
                tags: ['Health'],
                summary: 'Health check',
                responses: {
                    '200': {
                        description: 'Service is healthy',
                    },
                },
            },
        },
        '/api/v1/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login and receive JWT token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthLoginRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Login success' },
                    '401': {
                        description: 'Invalid credentials',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get currently authenticated user',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Current user info' },
                    '401': {
                        description: 'Unauthenticated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/users': {
            post: {
                tags: ['Users'],
                summary: 'Create a user (Admin)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateUserRequest' },
                        },
                    },
                },
                responses: {
                    '201': { description: 'User created' },
                    '400': { description: 'Validation error' },
                    '403': { description: 'Forbidden' },
                    '409': { description: 'Email already exists' },
                },
            },
            get: {
                tags: ['Users'],
                summary: 'List users (Admin)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'query', name: 'status', schema: { $ref: '#/components/schemas/UserStatus' } },
                    { in: 'query', name: 'role', schema: { $ref: '#/components/schemas/Role' } },
                    { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
                    { in: 'query', name: 'pageSize', schema: { type: 'integer', default: 20 } },
                ],
                responses: {
                    '200': { description: 'Users list' },
                    '403': { description: 'Forbidden' },
                },
            },
        },
        '/api/v1/users/{id}': {
            patch: {
                tags: ['Users'],
                summary: 'Update user (Admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateUserRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'User updated' },
                    '404': { description: 'User not found' },
                },
            },
        },
        '/api/v1/users/{id}/status': {
            patch: {
                tags: ['Users'],
                summary: 'Update user status (Admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateUserStatusRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'User status updated' },
                    '404': { description: 'User not found' },
                },
            },
        },
        '/api/v1/records': {
            post: {
                tags: ['Records'],
                summary: 'Create a financial record (Admin)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateRecordRequest' },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Record created' },
                    '403': { description: 'Forbidden' },
                },
            },
            get: {
                tags: ['Records'],
                summary: 'List records with filters',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'query', name: 'type', schema: { $ref: '#/components/schemas/RecordType' } },
                    { in: 'query', name: 'category', schema: { type: 'string' } },
                    { in: 'query', name: 'fromDate', schema: { type: 'string', format: 'date-time' } },
                    { in: 'query', name: 'toDate', schema: { type: 'string', format: 'date-time' } },
                    { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
                    { in: 'query', name: 'pageSize', schema: { type: 'integer', default: 20 } },
                ],
                responses: {
                    '200': { description: 'Records list' },
                },
            },
        },
        '/api/v1/records/{id}': {
            get: {
                tags: ['Records'],
                summary: 'Get one record by id',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Record detail' },
                    '404': { description: 'Record not found' },
                },
            },
            patch: {
                tags: ['Records'],
                summary: 'Update record (Admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateRecordRequest' },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Record updated' },
                    '404': { description: 'Record not found' },
                },
            },
            delete: {
                tags: ['Records'],
                summary: 'Delete record (Admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Record deleted' },
                    '404': { description: 'Record not found' },
                },
            },
        },
        '/api/v1/dashboard/summary': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get summary totals',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'query', name: 'fromDate', schema: { type: 'string', format: 'date-time' } },
                    { in: 'query', name: 'toDate', schema: { type: 'string', format: 'date-time' } },
                ],
                responses: {
                    '200': { description: 'Summary result' },
                },
            },
        },
        '/api/v1/dashboard/category-breakdown': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get category-wise totals',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'query', name: 'fromDate', schema: { type: 'string', format: 'date-time' } },
                    { in: 'query', name: 'toDate', schema: { type: 'string', format: 'date-time' } },
                ],
                responses: {
                    '200': { description: 'Category breakdown result' },
                },
            },
        },
        '/api/v1/dashboard/trends': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get trend data by monthly or weekly interval',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'query',
                        name: 'interval',
                        schema: { type: 'string', enum: ['monthly', 'weekly'], default: 'monthly' },
                    },
                    { in: 'query', name: 'fromDate', schema: { type: 'string', format: 'date-time' } },
                    { in: 'query', name: 'toDate', schema: { type: 'string', format: 'date-time' } },
                ],
                responses: {
                    '200': { description: 'Trend result' },
                },
            },
        },
        '/api/v1/dashboard/recent-activity': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get recent financial activity',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } }],
                responses: {
                    '200': { description: 'Recent activity result' },
                },
            },
        },
    },
};
