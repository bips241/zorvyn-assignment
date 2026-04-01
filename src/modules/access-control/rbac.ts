// Simple deny-by-default RBAC map. Route middleware asks this table for final permission decisions.
import { Permission, Role } from './access-control.types';

const rolePermissions: Record<Role, Set<Permission>> = {
  VIEWER: new Set<Permission>(['records.read', 'dashboard.read']),
  ANALYST: new Set<Permission>(['records.read', 'dashboard.read']),
  ADMIN: new Set<Permission>([
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

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return rolePermissions[role].has(permission);
};
