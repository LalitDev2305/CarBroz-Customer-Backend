import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaProvider } from '../src/providers/PrismaProvider.js';
import { PrismaDatabaseProvider } from '../src/providers/PrismaDatabaseProvider.js';
import { PrismaTransactionProvider } from '../src/providers/PrismaTransactionProvider.js';

const mPrismaClient = {
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $queryRaw: vi.fn(),
  $transaction: vi.fn((callback) => callback('mocked-tx')),
};

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      $connect = mPrismaClient.$connect;
      $disconnect = mPrismaClient.$disconnect;
      $queryRaw = mPrismaClient.$queryRaw;
      $transaction = mPrismaClient.$transaction;
    }
  };
});

describe('Database Providers', () => {
  let prismaProvider: PrismaProvider;
  let dbProvider: PrismaDatabaseProvider;
  let txProvider: PrismaTransactionProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    (PrismaProvider as any).instance = undefined;
    prismaProvider = new PrismaProvider();
    dbProvider = new PrismaDatabaseProvider(prismaProvider);
    txProvider = new PrismaTransactionProvider(prismaProvider);
  });

  describe('PrismaProvider', () => {
    it('should connect to database', async () => {
      await prismaProvider.connect();
      expect(prismaProvider.getClient().$connect).toHaveBeenCalled();
    });

    it('should disconnect from database', async () => {
      await prismaProvider.disconnect();
      expect(prismaProvider.getClient().$disconnect).toHaveBeenCalled();
    });

    it('should return true for healthy database', async () => {
      mPrismaClient.$queryRaw.mockResolvedValueOnce([1]);
      const isHealthy = await prismaProvider.health();
      expect(isHealthy).toBe(true);
    });

    it('should return false for unhealthy database', async () => {
      mPrismaClient.$queryRaw.mockRejectedValueOnce(new Error('connection failed'));
      const isHealthy = await prismaProvider.health();
      expect(isHealthy).toBe(false);
    });
  });

  describe('PrismaDatabaseProvider', () => {
    it('should proxy connect', async () => {
      const connectSpy = vi.spyOn(prismaProvider, 'connect').mockResolvedValueOnce();
      await dbProvider.connect();
      expect(connectSpy).toHaveBeenCalled();
    });

    it('should proxy disconnect', async () => {
      const disconnectSpy = vi.spyOn(prismaProvider, 'disconnect').mockResolvedValueOnce();
      await dbProvider.disconnect();
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should proxy health', async () => {
      const healthSpy = vi.spyOn(prismaProvider, 'health').mockResolvedValueOnce(true);
      const isHealthy = await dbProvider.health();
      expect(isHealthy).toBe(true);
      expect(healthSpy).toHaveBeenCalled();
    });
  });

  describe('PrismaTransactionProvider', () => {
    it('should execute operation inside transaction', async () => {
      const operation = vi.fn().mockResolvedValue('result');
      const result = await txProvider.runInTransaction(operation);
      expect(result).toBe('result');
      expect(mPrismaClient.$transaction).toHaveBeenCalled();
      expect(operation).toHaveBeenCalledWith('mocked-tx');
    });
  });
});
