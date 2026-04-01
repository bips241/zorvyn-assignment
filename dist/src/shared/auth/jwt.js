"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.signAccessToken = void 0;
// JWT helper utilities used by auth and middleware layers.
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_error_1 = require("../http/http-error");
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new http_error_1.HttpError(500, 'CONFIG_ERROR', 'JWT_SECRET is not configured');
    }
    return secret;
};
const signAccessToken = (payload) => {
    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '1d');
    return jsonwebtoken_1.default.sign(payload, getJwtSecret(), { expiresIn });
};
exports.signAccessToken = signAccessToken;
const verifyAccessToken = (token) => {
    try {
        const payload = jsonwebtoken_1.default.verify(token, getJwtSecret());
        return payload;
    }
    catch {
        throw new http_error_1.HttpError(401, 'UNAUTHENTICATED', 'Invalid or expired token');
    }
};
exports.verifyAccessToken = verifyAccessToken;
