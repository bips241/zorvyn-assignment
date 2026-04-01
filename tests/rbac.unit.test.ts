import { describe, expect, it } from 'vitest';

import { hasPermission } from '../src/modules/access-control/rbac';

describe('RBAC permission matrix', () => {
  it('viewer can read records and dashboard only', () => {
    expect(hasPermission('VIEWER', 'records.read')).toBe(true);
    expect(hasPermission('VIEWER', 'dashboard.read')).toBe(true);
    expect(hasPermission('VIEWER', 'records.create')).toBe(false);
    expect(hasPermission('VIEWER', 'users.update')).toBe(false);
  });

  it('admin has full control permissions', () => {
    expect(hasPermission('ADMIN', 'users.create')).toBe(true);
    expect(hasPermission('ADMIN', 'users.status.update')).toBe(true);
    expect(hasPermission('ADMIN', 'records.delete')).toBe(true);
  });
});
