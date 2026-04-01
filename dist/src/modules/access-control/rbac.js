"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = void 0;
const rolePermissions = {
    VIEWER: new Set(['records.read', 'dashboard.read']),
    ANALYST: new Set(['records.read', 'dashboard.read']),
    ADMIN: new Set([
        'records.read',
        'records.create',
        'records.update',
        'records.delete',
        'dashboard.read',
        'users.read',
        'users.create',
        'users.update',
        'users.status.update',
    ]),
};
const hasPermission = (role, permission) => {
    return rolePermissions[role].has(permission);
};
exports.hasPermission = hasPermission;
