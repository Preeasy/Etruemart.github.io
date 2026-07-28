import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

try {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
  
  prisma = global.prisma || new PrismaClient(
    databaseUrl ? { datasourceUrl: databaseUrl } : undefined
  );

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
  }
} catch (error) {
  console.warn('Prisma client initialization failed (database not available)', error);
  
  prisma = {} as PrismaClient;
}

export { prisma };
