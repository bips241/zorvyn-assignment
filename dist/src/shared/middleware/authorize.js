"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const rbac_1 = require("../../modules/access-control/rbac");
const http_error_1 = require("../http/http-error");
const authorize = (permission) => {
    return (req, _res, next) => {
        const authUser = req.authUser;
        if (!authUser) {
            return next(new http_error_1.HttpError(401, 'UNAUTHENTICATED', 'Authentication required'));
        }
        if (!(0, rbac_1.hasPermission)(authUser.role, permission)) {
            return next(new http_error_1.HttpError(403, 'FORBIDDEN', 'Insufficient permissions'));
        }
        return next();
    };
};
exports.authorize = authorize;
