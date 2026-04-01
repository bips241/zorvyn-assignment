// Authorization middleware factory used by routes to enforce role-permission checks.
import { RequestHandler } from 'express';

import { Permission } from '../../modules/access-control/access-control.types';
import { hasPermission } from '../../modules/access-control/rbac';
import { HttpError } from '../http/http-error';

export const authorize = (permission: Permission): RequestHandler => {
  return (req, _res, next) => {
    const authUser = req.authUser;

    if (!authUser) {
      return next(new HttpError(401, 'UNAUTHENTICATED', 'Authentication required'));
    }

    if (!hasPermission(authUser.role, permission)) {
      return next(new HttpError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }

    return next();
  };
};
