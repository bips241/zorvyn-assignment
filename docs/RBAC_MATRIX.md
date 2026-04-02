# RBAC Matrix

## Roles
- `VIEWER`
- `ANALYST`
- `ADMIN`

## Permissions
- `records.read`
- `records.create`
- `records.update`
- `records.delete`
- `dashboard.read`
- `users.read`
- `users.create`
- `users.update`
- `users.status.update`

## Mapping

### VIEWER
- ✅ `records.read`
- ✅ `dashboard.read`
- ❌ all write/manage permissions

### ANALYST
- ✅ `records.read`
- ✅ `dashboard.read`
- ❌ records write/delete
- ❌ user management

### ADMIN
- ✅ all permissions

## Enforcement
Authorization middleware reads required permission per route and checks current user's role against permission matrix. Deny by default.
