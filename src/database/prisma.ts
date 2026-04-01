// Shared Prisma client instance used across services to keep DB access consistent.
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
