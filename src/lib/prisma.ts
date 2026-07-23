import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// 兼容 Vercel Neon 集成：优先使用 DATABASE_URL，否则使用 POSTGRES_PRISMA_URL
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

export const prisma = global.prisma || new PrismaClient(
  databaseUrl ? { datasourceUrl: databaseUrl } : undefined
);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
