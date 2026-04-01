"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
    const analystPassword = await bcryptjs_1.default.hash('analyst123', 10);
    const viewerPassword = await bcryptjs_1.default.hash('viewer123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        create: {
            name: 'System Admin',
            email: 'admin@example.com',
            passwordHash: adminPassword,
            role: client_1.Role.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
        update: {
            passwordHash: adminPassword,
            role: client_1.Role.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    await prisma.user.upsert({
        where: { email: 'analyst@example.com' },
        create: {
            name: 'Finance Analyst',
            email: 'analyst@example.com',
            passwordHash: analystPassword,
            role: client_1.Role.ANALYST,
            status: client_1.UserStatus.ACTIVE,
        },
        update: {
            passwordHash: analystPassword,
            role: client_1.Role.ANALYST,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    await prisma.user.upsert({
        where: { email: 'viewer@example.com' },
        create: {
            name: 'Read Only Viewer',
            email: 'viewer@example.com',
            passwordHash: viewerPassword,
            role: client_1.Role.VIEWER,
            status: client_1.UserStatus.ACTIVE,
        },
        update: {
            passwordHash: viewerPassword,
            role: client_1.Role.VIEWER,
            status: client_1.UserStatus.ACTIVE,
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
