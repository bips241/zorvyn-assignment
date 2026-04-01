"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const rbac_1 = require("../src/modules/access-control/rbac");
(0, vitest_1.describe)('RBAC permission matrix', () => {
    (0, vitest_1.it)('viewer can read records and dashboard only', () => {
        (0, vitest_1.expect)((0, rbac_1.hasPermission)('VIEWER', 'records.read')).toBe(true);
        (0, vitest_1.expect)((0, rbac_1.hasPermission)('VIEWER', 'dashboard.read')).toBe(true);
        (0, vitest_1.expect)((0, rbac_1.hasPermission)('VIEWER', 'records.create')).toBe(false);
        (0, vitest_1.expect)((0, rbac_1.hasPermission)('VIEWER', 'users.update')).toBe(false);
    });
    (0, vitest_1.it)('admin has full control permissions', () => {
        (0, vitest_1.expect)((0, rbac_1.hasPermission)('ADMIN', 'users.create')).toBe(true);
        (0, vitest_1.expect)((0, rbac_1.hasPermission)('ADMIN', 'users.status.update')).toBe(true);
        (0, vitest_1.expect)((0, rbac_1.hasPermission)('ADMIN', 'records.delete')).toBe(true);
    });
});
