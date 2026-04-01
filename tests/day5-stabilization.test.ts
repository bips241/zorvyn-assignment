import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { Role, UserStatus } from '@prisma/client';

import { createApp } from '../src/app';
import { prisma } from '../src/database/prisma';

dotenv.config();

const app = createApp();

const login = async (email: string, password: string) => {
  const response = await request(app).post('/api/v1/auth/login').send({ email, password });
  return response.body?.data?.accessToken as string;
};

describe('Day-5 stabilization checks', () => {
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('active123', 10);

    await prisma.user.upsert({
      where: { email: 'stabilize-active@example.com' },
      create: {
        name: 'Stabilize Active',
        email: 'stabilize-active@example.com',
        passwordHash,
        role: Role.ANALYST,
        status: UserStatus.ACTIVE,
      },
      update: {
        passwordHash,
        role: Role.ANALYST,
        status: UserStatus.ACTIVE,
      },
    });
  });

  it('returns 400 for invalid user creation payload', async () => {
    const adminToken = await login('admin@example.com', 'admin123');

    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'x',
        email: 'invalid-email',
        password: '123',
        role: 'INVALID_ROLE',
      });

    expect(response.status).toBe(400);
    expect(response.body?.error?.code).toBe('VALIDATION_ERROR');
  });

  it('blocks protected access for user becoming inactive after token issuance', async () => {
    const token = await login('stabilize-active@example.com', 'active123');

    await prisma.user.update({
      where: { email: 'stabilize-active@example.com' },
      data: { status: UserStatus.INACTIVE },
    });

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body?.error?.code).toBe('USER_INACTIVE');

    await prisma.user.update({
      where: { email: 'stabilize-active@example.com' },
      data: { status: UserStatus.ACTIVE },
    });
  });

  it('returns 401 for malformed bearer token', async () => {
    const response = await request(app)
      .get('/api/v1/records')
      .set('Authorization', 'Bearer not-a-valid-token');

    expect(response.status).toBe(401);
    expect(response.body?.error?.code).toBe('UNAUTHENTICATED');
  });

  it('returns 401 when token is signed with wrong secret', async () => {
    const forged = jwt.sign(
      {
        sub: 'non-existing-user',
        email: 'fake@example.com',
        role: 'ADMIN',
      },
      'wrong-secret',
      { expiresIn: '1h' },
    );

    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${forged}`);

    expect(response.status).toBe(401);
    expect(response.body?.error?.code).toBe('UNAUTHENTICATED');
  });
});
