import dotenv from 'dotenv';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../src/database/prisma';
import { createApp } from '../src/app';

dotenv.config();

const app = createApp();

const login = async (email: string, password: string) => {
  const response = await request(app).post('/api/v1/auth/login').send({ email, password });
  return response.body?.data?.accessToken as string;
};

describe('Phase-3 dashboard analytics', () => {
  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' }, select: { id: true } });

    if (!admin) {
      throw new Error('Missing seeded admin user');
    }

    await prisma.financialRecord.deleteMany({
      where: {
        notes: 'phase3 fixture income',
      },
    });

    await prisma.financialRecord.deleteMany({
      where: {
        notes: 'phase3 fixture expense',
      },
    });

    await prisma.financialRecord.createMany({
      data: [
        {
          amount: 3000,
          type: 'INCOME',
          category: 'Salary-2030',
          date: new Date('2030-01-05T10:00:00.000Z'),
          notes: 'phase3 fixture income',
          createdById: admin.id,
        },
        {
          amount: 500,
          type: 'EXPENSE',
          category: 'Rent-2030',
          date: new Date('2030-01-07T10:00:00.000Z'),
          notes: 'phase3 fixture expense',
          createdById: admin.id,
        },
        {
          amount: 250,
          type: 'EXPENSE',
          category: 'Food-2030',
          date: new Date('2030-02-01T10:00:00.000Z'),
          notes: 'phase3 fixture expense',
          createdById: admin.id,
        },
      ],
    });
  });

  it('viewer can access summary analytics', async () => {
    const viewerToken = await login('viewer@example.com', 'viewer123');

    const response = await request(app)
      .get('/api/v1/dashboard/summary?fromDate=2030-01-01&toDate=2030-12-31')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(200);
    expect(response.body?.data?.totalIncome).toBe(3000);
    expect(response.body?.data?.totalExpense).toBe(750);
    expect(response.body?.data?.netBalance).toBe(2250);
  });

  it('returns category breakdown for date range', async () => {
    const viewerToken = await login('viewer@example.com', 'viewer123');

    const response = await request(app)
      .get('/api/v1/dashboard/category-breakdown?fromDate=2030-01-01&toDate=2030-12-31')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body?.data)).toBe(true);
    expect(response.body.data.some((row: { category: string }) => row.category === 'Salary-2030')).toBe(true);
  });

  it('returns trends by monthly and weekly intervals', async () => {
    const viewerToken = await login('viewer@example.com', 'viewer123');

    const monthly = await request(app)
      .get('/api/v1/dashboard/trends?interval=monthly&fromDate=2030-01-01&toDate=2030-12-31')
      .set('Authorization', `Bearer ${viewerToken}`);

    const weekly = await request(app)
      .get('/api/v1/dashboard/trends?interval=weekly&fromDate=2030-01-01&toDate=2030-12-31')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(monthly.status).toBe(200);
    expect(weekly.status).toBe(200);
    expect(monthly.body.data.length).toBeGreaterThan(0);
    expect(weekly.body.data.length).toBeGreaterThan(0);
  });

  it('returns recent activity with limit', async () => {
    const viewerToken = await login('viewer@example.com', 'viewer123');

    const response = await request(app)
      .get('/api/v1/dashboard/recent-activity?limit=2')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body?.data)).toBe(true);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
  });
});
