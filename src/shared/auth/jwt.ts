// JWT helper utilities used by auth and middleware layers.
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import { HttpError } from '../http/http-error';

type TokenPayload = {
  sub: string;
  email: string;
  role: 'VIEWER' | 'ANALYST' | 'ADMIN';
};

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new HttpError(500, 'CONFIG_ERROR', 'JWT_SECRET is not configured');
  }

  return secret;
};

export const signAccessToken = (payload: TokenPayload): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'];
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as TokenPayload;
    return payload;
  } catch {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Invalid or expired token');
  }
};
