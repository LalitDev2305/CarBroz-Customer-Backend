import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaProvider } from '../../../platform/database/src/providers/PrismaProvider.js';
import { PrismaTransactionProvider } from '../../../platform/database/src/providers/PrismaTransactionProvider.js';
import { PrismaPartnerRepository } from '../../../domains/partner/infrastructure/repositories/PrismaPartnerRepository.js';
import { PartnerStatus } from '../../../domains/partner/domain/PartnerStatus.js';
import { PartnerType } from '../../../domains/partner/domain/PartnerType.js';

/**
 * Real PostgreSQL evidence for the Constitution transaction law.
 * The suite proves both sides of transaction propagation: committed work is visible through the
 * root client, while work performed through the same supplied transaction client is rolled back
 * when the unit of work fails.
 */
describe('real PostgreSQL transaction propagation', () => {
  const prismaProvider = new PrismaProvider();
  const transactionProvider = new PrismaTransactionProvider(prismaProvider);
  const rootClient = prismaProvider.getClient();

  beforeAll(async () => {
    await prismaProvider.connect();
  });

  afterAll(async () => {
    await prismaProvider.disconnect();
  });

  it('commits a Partner repository write performed through the supplied transaction client', async () => {
    const repository = new PrismaPartnerRepository(rootClient);
    const created = await transactionProvider.runInTransaction(async (transaction) => {
      repository.setUnitOfWork(transaction as PrismaClient);
      return repository.create({
        businessName: `Commit Probe ${Date.now()}`,
        type: PartnerType.INDIVIDUAL,
        status: PartnerStatus.PENDING,
      });
    });

    repository.setUnitOfWork(rootClient);
    const persisted = await repository.findByPublicId(created.publicId);
    expect(persisted).not.toBeNull();
    expect(persisted?.id).toBe(created.id);
    expect(persisted?.status).toBe(PartnerStatus.PENDING);

    expect(await repository.delete(created.id)).toBe(true);
    expect(await repository.findByPublicId(created.publicId)).toBeNull();
  });

  it('rolls back a Partner repository write performed through the supplied transaction client', async () => {
    const repository = new PrismaPartnerRepository(rootClient);
    let createdPublicId: string | undefined;

    await expect(
      transactionProvider.runInTransaction(async (transaction) => {
        repository.setUnitOfWork(transaction as PrismaClient);
        const created = await repository.create({
          businessName: `Rollback Probe ${Date.now()}`,
          type: PartnerType.INDIVIDUAL,
          status: PartnerStatus.PENDING,
        });
        createdPublicId = created.publicId;
        throw new Error('FORCED_ROLLBACK_PROBE');
      }),
    ).rejects.toThrow('FORCED_ROLLBACK_PROBE');

    expect(createdPublicId).toBeTruthy();
    repository.setUnitOfWork(rootClient);
    expect(await repository.findByPublicId(createdPublicId!)).toBeNull();
  });
});
