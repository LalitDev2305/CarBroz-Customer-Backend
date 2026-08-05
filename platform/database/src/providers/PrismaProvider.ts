import { PrismaClient } from '@prisma/client';

export class PrismaProvider {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaProvider.instance) {
      PrismaProvider.instance = new PrismaClient();
    }
    return PrismaProvider.instance;
  }

  public async connect(): Promise<void> {
    await PrismaProvider.getInstance().$connect();
  }

  public async disconnect(): Promise<void> {
    await PrismaProvider.getInstance().$disconnect();
  }

  public async health(): Promise<boolean> {
    try {
      await PrismaProvider.getInstance().$queryRaw`SELECT 1`;
      return true;
    } catch (e) {
      return false;
    }
  }

  public getClient(): PrismaClient {
    return PrismaProvider.getInstance();
  }
}
