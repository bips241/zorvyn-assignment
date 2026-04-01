"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Shared Prisma client instance used across services to keep DB access consistent.
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
