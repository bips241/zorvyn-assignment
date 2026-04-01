"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
// Auth routes are intentionally small: validate input, call service, return normalized response.
const express_1 = require("express");
const validate_1 = require("../../shared/validation/validate");
const authenticate_1 = require("../../shared/middleware/authenticate");
const auth_schema_1 = require("./auth.schema");
const auth_service_1 = require("./auth.service");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/login', (0, validate_1.validate)(auth_schema_1.loginSchema), async (req, res, next) => {
    try {
        const result = await (0, auth_service_1.loginUser)({
            email: req.body.email,
            password: req.body.password,
        });
        res.status(200).json({
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.authRouter.get('/me', authenticate_1.authenticate, (req, res) => {
    // `authenticate` already resolves and verifies the user, so we only echo that context back.
    res.status(200).json({
        data: {
            user: req.authUser,
        },
    });
});
