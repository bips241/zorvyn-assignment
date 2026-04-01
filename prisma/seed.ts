import bcrypt from 'bcryptjs';

import { PrismaClient, Role, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const analystPassword = await bcrypt.hash('analyst123', 10);
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
    where: { email: 'analyst@example.com' },
    create: {
      name: 'Finance Analyst',
      email: 'analyst@example.com',
      passwordHash: analystPassword,
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
    },
    update: {
      passwordHash: analystPassword,
      role: Role.ANALYST,
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
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
