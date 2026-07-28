import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

export const prisma = global.prisma || new PrismaClient({
  datasourceUrl: databaseUrl,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  errorFormat: 'minimal',
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
