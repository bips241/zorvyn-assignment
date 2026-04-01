import dotenv from 'dotenv';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';

dotenv.config();

import { Role, UserStatus } from '@prisma/client';

import { createApp } from '../src/app';
import { prisma } from '../src/database/prisma';

describe('Auth endpoints', () => {
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      create: {
        name: 'System Admin',
        email: 'admin@example.com',
        passwordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
      update: {
        passwordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
  });

  it('logs in with valid credentials', async () => {
    const app = createApp();

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'admin123',
    });

    expect(response.status).toBe(200);
    expect(response.body?.data?.accessToken).toBeTypeOf('string');
    expect(response.body?.data?.user?.email).toBe('admin@example.com');
  });

  it('returns current user from token', async () => {
    const app = createApp();

    const login = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'admin123',
    });

    const token = login.body?.data?.accessToken;

    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);

    expect(me.status).toBe(200);
    expect(me.body?.data?.user?.email).toBe('admin@example.com');
  });

  it('rejects invalid credentials', async () => {
    const app = createApp();

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
  });
});
