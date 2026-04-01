// Users service handles admin-facing user lifecycle operations with explicit conflict/not-found checks.
import bcrypt from 'bcryptjs';

import { prisma } from '../../database/prisma';
import { HttpError } from '../../shared/http/http-error';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: 'VIEWER' | 'ANALYST' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE';
};

type ListUsersInput = {
  role?: 'VIEWER' | 'ANALYST' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE';
  page: number;
  pageSize: number;
};

type UpdateUserInput = {
  id: string;
  name?: string;
  email?: string;
  role?: 'VIEWER' | 'ANALYST' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE';
};

export const createUser = async (input: CreateUserInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, 'EMAIL_ALREADY_EXISTS', 'A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      status: input.status ?? 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const listUsers = async (input: ListUsersInput) => {
  // Pagination and lightweight filtering are built in so admin dashboards can scale without extra endpoints.
  const where = {
    role: input.role,
    status: input.status,
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    users,
    meta: {
      total,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: Math.ceil(total / input.pageSize),
    },
  };
};

export const updateUser = async ({ id, ...input }: UpdateUserInput) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  }

  if (input.email && input.email !== existing.email) {
    const duplicate = await prisma.user.findUnique({ where: { email: input.email } });
    if (duplicate) {
      throw new HttpError(409, 'EMAIL_ALREADY_EXISTS', 'A user with this email already exists');
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const updateUserStatus = async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};
