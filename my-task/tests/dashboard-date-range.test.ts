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

describe('Dashboard date range filtering', () => {
  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' }, select: { id: true } });

    if (!admin) {
      throw new Error('Missing seeded admin user');
    }

    await prisma.financialRecord.deleteMany({
      where: {
        notes: 'date-range-test',
      },
    });

    await prisma.financialRecord.createMany({
      data: [
        {
          amount: 1000,
          type: 'INCOME',
          category: 'Salary',
          date: new Date('2030-01-15T10:00:00.000Z'),
          notes: 'date-range-test',
          createdById: admin.id,
        },
        {
          amount: 500,
          type: 'EXPENSE',
          category: 'Utilities',
          date: new Date('2030-02-10T10:00:00.000Z'),
          notes: 'date-range-test',
          createdById: admin.id,
        },
        {
          amount: 800,
          type: 'INCOME',
          category: 'Bonus',
          date: new Date('2030-03-20T10:00:00.000Z'),
          notes: 'date-range-test',
          createdById: admin.id,
        },
      ],
    });
  });

  it('summary with only toDate filter should return records before or on that date', async () => {
    const token = await login('admin@example.com', 'admin123');

    const response = await request(app)
      .get('/api/v1/dashboard/summary?toDate=2030-02-15')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    // Should include Jan 15 (income 1000) and Feb 10 (expense 500), but not Mar 20
    expect(response.body?.data?.totalIncome).toBe(1000);
    expect(response.body?.data?.totalExpense).toBe(500);
    expect(response.body?.data?.netBalance).toBe(500);
  });

  it('summary with only fromDate filter should return records on or after that date', async () => {
    const token = await login('admin@example.com', 'admin123');

    const response = await request(app)
      .get('/api/v1/dashboard/summary?fromDate=2030-02-01')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    // Should include Feb 10 (expense 500) and Mar 20 (income 800), but not Jan 15
    expect(response.body?.data?.totalIncome).toBe(800);
    expect(response.body?.data?.totalExpense).toBe(500);
    expect(response.body?.data?.netBalance).toBe(300);
  });

  it('trends with only toDate filter should aggregate data correctly', async () => {
    const token = await login('admin@example.com', 'admin123');

    const response = await request(app)
      .get('/api/v1/dashboard/trends?interval=monthly&toDate=2030-02-28')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    // Should have 2 months: 2030-01 and 2030-02
    expect(response.body?.data).toHaveLength(2);
    expect(response.body?.data[0].period).toBe('2030-01');
    expect(response.body?.data[0].income).toBe(1000);
    expect(response.body?.data[1].period).toBe('2030-02');
    expect(response.body?.data[1].expense).toBe(500);
  });
});
