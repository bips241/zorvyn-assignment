// Auth service: validates credentials, enforces active status, then issues JWT.
import bcrypt from 'bcryptjs';

import { prisma } from '../../database/prisma';
import { signAccessToken } from '../../shared/auth/jwt';
import { HttpError } from '../../shared/http/http-error';

type LoginInput = {
  email: string;
  password: string;
};

export const loginUser = async ({ email, password }: LoginInput) => {
  // I intentionally return the same message for email/password mismatch to avoid user-enumeration clues.
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw new HttpError(403, 'USER_INACTIVE', 'User account is inactive');
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};
