// Central RBAC vocabulary. Keeping these literals in one place avoids role/permission drift across modules.
export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN';

export type Permission =
  | 'records.read'
  | 'records.create'
  | 'records.update'
  | 'records.delete'
  | 'dashboard.read'
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.status.update';
