import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
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

describe('Phase-2 users and records', () => {
  beforeAll(async () => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const viewerPassword = await bcrypt.hash('viewer123', 10);

    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      create: {
        name: 'System Admin',
        email: 'admin@example.com',
        passwordHash: adminPassword,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
      update: {
        passwordHash: adminPassword,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    await prisma.user.upsert({
      where: { email: 'viewer@example.com' },
      create: {
        name: 'Read Only Viewer',
        email: 'viewer@example.com',
        passwordHash: viewerPassword,
        role: Role.VIEWER,
        status: UserStatus.ACTIVE,
      },
      update: {
        passwordHash: viewerPassword,
        role: Role.VIEWER,
        status: UserStatus.ACTIVE,
      },
    });
  });

  it('admin can create user', async () => {
    const adminToken = await login('admin@example.com', 'admin123');

    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Created User',
        email: `created-${Date.now()}@example.com`,
        password: 'sample123',
        role: 'ANALYST',
      });

    expect(response.status).toBe(201);
    expect(response.body?.data?.email).toContain('@example.com');
  });

  it('viewer cannot list users', async () => {
    const viewerToken = await login('viewer@example.com', 'viewer123');

    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(403);
  });

  it('admin can create record and viewer can read records', async () => {
    const adminToken = await login('admin@example.com', 'admin123');
    const viewerToken = await login('viewer@example.com', 'viewer123');

    const createResponse = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 2500,
        type: 'INCOME',
        category: 'Salary',
        date: new Date().toISOString(),
        notes: 'Monthly payment',
      });

    expect(createResponse.status).toBe(201);

    const listResponse = await request(app)
      .get('/api/v1/records?page=1&pageSize=10')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body?.data)).toBe(true);
  });

  it('viewer cannot create record', async () => {
    const viewerToken = await login('viewer@example.com', 'viewer123');

    const response = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        amount: 100,
        type: 'EXPENSE',
        category: 'Food',
        date: new Date().toISOString(),
      });

    expect(response.status).toBe(403);
  });
});
