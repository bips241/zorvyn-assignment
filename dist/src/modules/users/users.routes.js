"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../shared/middleware/authenticate");
const authorize_1 = require("../../shared/middleware/authorize");
const validate_1 = require("../../shared/validation/validate");
const users_schema_1 = require("./users.schema");
const users_service_1 = require("./users.service");
exports.usersRouter = (0, express_1.Router)();
exports.usersRouter.use(authenticate_1.authenticate);
exports.usersRouter.post('/', (0, authorize_1.authorize)('users.create'), (0, validate_1.validate)(users_schema_1.createUserSchema), async (req, res, next) => {
    try {
        const user = await (0, users_service_1.createUser)(req.body);
        res.status(201).json({ data: user });
    }
    catch (error) {
        next(error);
    }
});
exports.usersRouter.get('/', (0, authorize_1.authorize)('users.read'), (0, validate_1.validate)(users_schema_1.listUsersSchema), async (req, res, next) => {
    try {
        const result = await (0, users_service_1.listUsers)({
            role: req.query.role,
            status: req.query.status,
            page: Number(req.query.page ?? 1),
            pageSize: Number(req.query.pageSize ?? 20),
        });
        res.status(200).json({
            data: result.users,
            meta: result.meta,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.usersRouter.patch('/:id', (0, authorize_1.authorize)('users.update'), (0, validate_1.validate)(users_schema_1.updateUserSchema), async (req, res, next) => {
    try {
        const user = await (0, users_service_1.updateUser)({
            id: req.params.id,
            ...req.body,
        });
        res.status(200).json({ data: user });
    }
    catch (error) {
        next(error);
    }
});
exports.usersRouter.patch('/:id/status', (0, authorize_1.authorize)('users.status.update'), (0, validate_1.validate)(users_schema_1.updateUserStatusSchema), async (req, res, next) => {
    try {
        const user = await (0, users_service_1.updateUserStatus)(req.params.id, req.body.status);
        res.status(200).json({ data: user });
    }
    catch (error) {
        next(error);
    }
});
