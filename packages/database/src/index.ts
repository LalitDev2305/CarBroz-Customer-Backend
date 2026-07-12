import { PrismaClient } from '@prisma/client';
import { DatabaseConfig } from '@carbroz/config';

let prismaInstance: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: DatabaseConfig.url,
        },
      },
    });
  }
  return prismaInstance;
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
};

export { PrismaClient } from '@prisma/client';
