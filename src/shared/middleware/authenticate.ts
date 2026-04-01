// Authentication middleware: validates bearer token and resolves active user context onto `req.authUser`.
import { RequestHandler } from 'express';

import { prisma } from '../../database/prisma';
import { verifyAccessToken } from '../auth/jwt';
import { HttpError } from '../http/http-error';

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const hasBearerToken = authHeader?.startsWith('Bearer ');

    if (!authHeader || !hasBearerToken) {
      return next(new HttpError(401, 'UNAUTHENTICATED', 'Missing bearer token'));
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return next(new HttpError(401, 'UNAUTHENTICATED', 'Invalid token user'));
    }

    if (user.status !== 'ACTIVE') {
      return next(new HttpError(403, 'USER_INACTIVE', 'User account is inactive'));
    }

    req.authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
