"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const prisma_1 = require("../../database/prisma");
const jwt_1 = require("../auth/jwt");
const http_error_1 = require("../http/http-error");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const hasBearerToken = authHeader?.startsWith('Bearer ');
        if (!authHeader || !hasBearerToken) {
            return next(new http_error_1.HttpError(401, 'UNAUTHENTICATED', 'Missing bearer token'));
        }
        const token = authHeader.slice('Bearer '.length).trim();
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
            },
        });
        if (!user) {
            return next(new http_error_1.HttpError(401, 'UNAUTHENTICATED', 'Invalid token user'));
        }
        if (user.status !== 'ACTIVE') {
            return next(new http_error_1.HttpError(403, 'USER_INACTIVE', 'User account is inactive'));
        }
        req.authUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        };
        return next();
    }
    catch (error) {
        return next(error);
    }
};
exports.authenticate = authenticate;
