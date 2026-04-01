"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../database/prisma");
const jwt_1 = require("../../shared/auth/jwt");
const http_error_1 = require("../../shared/http/http-error");
const loginUser = async ({ email, password }) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new http_error_1.HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new http_error_1.HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }
    if (user.status !== 'ACTIVE') {
        throw new http_error_1.HttpError(403, 'USER_INACTIVE', 'User account is inactive');
    }
    const accessToken = (0, jwt_1.signAccessToken)({
        sub: user.id,
        email: user.email,
        role: user.role,
    });
    return {
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        },
    };
};
exports.loginUser = loginUser;
