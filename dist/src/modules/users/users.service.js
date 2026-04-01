"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.updateUser = exports.listUsers = exports.createUser = void 0;
// Users service handles admin-facing user lifecycle operations with explicit conflict/not-found checks.
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../database/prisma");
const http_error_1 = require("../../shared/http/http-error");
const createUser = async (input) => {
    const existing = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new http_error_1.HttpError(409, 'EMAIL_ALREADY_EXISTS', 'A user with this email already exists');
    }
    const passwordHash = await bcryptjs_1.default.hash(input.password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
            role: input.role,
            status: input.status ?? 'ACTIVE',
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};
exports.createUser = createUser;
const listUsers = async (input) => {
    // Pagination and lightweight filtering are built in so admin dashboards can scale without extra endpoints.
    const where = {
        role: input.role,
        status: input.status,
    };
    const [total, users] = await Promise.all([
        prisma_1.prisma.user.count({ where }),
        prisma_1.prisma.user.findMany({
            where,
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
    ]);
    return {
        users,
        meta: {
            total,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil(total / input.pageSize),
        },
    };
};
exports.listUsers = listUsers;
const updateUser = async ({ id, ...input }) => {
    const existing = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!existing) {
        throw new http_error_1.HttpError(404, 'USER_NOT_FOUND', 'User not found');
    }
    if (input.email && input.email !== existing.email) {
        const duplicate = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
        if (duplicate) {
            throw new http_error_1.HttpError(409, 'EMAIL_ALREADY_EXISTS', 'A user with this email already exists');
        }
    }
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: input,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};
exports.updateUser = updateUser;
const updateUserStatus = async (id, status) => {
    const existing = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!existing) {
        throw new http_error_1.HttpError(404, 'USER_NOT_FOUND', 'User not found');
    }
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: { status },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};
exports.updateUserStatus = updateUserStatus;
