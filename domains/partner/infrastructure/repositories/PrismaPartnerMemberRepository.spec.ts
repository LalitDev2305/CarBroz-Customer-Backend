import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import type { PartnerMember } from '../../domain/PartnerMember.js';
import { PartnerMemberRole } from '../../domain/PartnerMemberRole.js';
import { PartnerMemberStatus } from '../../domain/PartnerMemberStatus.js';
import { PrismaPartnerMemberRepository } from './PrismaPartnerMemberRepository.js';

const memberRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  publicId: 'member_1',
  userId: 7,
  partnerId: 9,
  role: PartnerMemberRole.OWNER,
  status: PartnerMemberStatus.ACTIVE,
  createdAt: new Date('2026-09-01T00:00:00.000Z'),
  updatedAt: new Date('2026-09-06T00:00:00.000Z'),
  ...overrides,
});

function client() {
  const partnerMember = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { prisma: { partnerMember } as unknown as PrismaClient, partnerMember };
}

describe('PrismaPartnerMemberRepository', () => {
  it('maps all single-member lookup success and missing variants', async () => {
    const { prisma, partnerMember } = client();
    const repository = new PrismaPartnerMemberRepository(prisma);
    partnerMember.findUnique
      .mockResolvedValueOnce(memberRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(memberRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(memberRecord())
      .mockResolvedValueOnce(null);

    await expect(repository.findByPublicId('member_1')).resolves.toMatchObject({ publicId: 'member_1' });
    await expect(repository.findByPublicId('missing')).resolves.toBeNull();
    await expect(repository.findByUserIdAndPartnerId(7, 9)).resolves.toMatchObject({ userId: 7, partnerId: 9 });
    await expect(repository.findByUserIdAndPartnerId(8, 9)).resolves.toBeNull();
    await expect(repository.findById(1)).resolves.toMatchObject({ id: 1 });
    await expect(repository.findById(999)).resolves.toBeNull();
  });

  it('maps user, partner and complete member lists', async () => {
    const { prisma, partnerMember } = client();
    const repository = new PrismaPartnerMemberRepository(prisma);
    partnerMember.findMany.mockResolvedValue([memberRecord(), memberRecord({ id: 2, publicId: 'member_2' })]);

    await expect(repository.findByUserId(7)).resolves.toHaveLength(2);
    await expect(repository.findByPartnerId(9)).resolves.toHaveLength(2);
    await expect(repository.findAll()).resolves.toHaveLength(2);
  });

  it('uses the unit-of-work client after it is installed', async () => {
    const primary = client();
    const transaction = client();
    transaction.partnerMember.findUnique.mockResolvedValue(memberRecord());
    const repository = new PrismaPartnerMemberRepository(primary.prisma);

    repository.setUnitOfWork(transaction.prisma);
    await expect(repository.findById(1)).resolves.toMatchObject({ id: 1 });

    expect(transaction.partnerMember.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(primary.partnerMember.findUnique).not.toHaveBeenCalled();
  });

  it('creates members with default status and without an invented public id', async () => {
    const { prisma, partnerMember } = client();
    const repository = new PrismaPartnerMemberRepository(prisma);
    partnerMember.create.mockResolvedValue(memberRecord());

    await repository.create({ userId: 7, partnerId: 9, role: PartnerMemberRole.OWNER });

    expect(partnerMember.create).toHaveBeenCalledWith({
      data: { userId: 7, partnerId: 9, role: PartnerMemberRole.OWNER, status: PartnerMemberStatus.ACTIVE },
    });
  });

  it('preserves explicitly supplied status and public id during creation', async () => {
    const { prisma, partnerMember } = client();
    const repository = new PrismaPartnerMemberRepository(prisma);
    partnerMember.create.mockResolvedValue(memberRecord({ publicId: 'explicit', status: PartnerMemberStatus.SUSPENDED }));

    await repository.create({
      userId: 7,
      partnerId: 9,
      role: PartnerMemberRole.OWNER,
      status: PartnerMemberStatus.SUSPENDED,
      publicId: 'explicit',
    });

    expect(partnerMember.create).toHaveBeenCalledWith({
      data: {
        userId: 7,
        partnerId: 9,
        role: PartnerMemberRole.OWNER,
        status: PartnerMemberStatus.SUSPENDED,
        publicId: 'explicit',
      },
    });
  });

  it('rejects incomplete creation data', async () => {
    const incomplete: Partial<PartnerMember>[] = [
      { partnerId: 9, role: PartnerMemberRole.OWNER },
      { userId: 7, role: PartnerMemberRole.OWNER },
      { userId: 7, partnerId: 9 },
    ];

    for (const data of incomplete) {
      const { prisma, partnerMember } = client();
      const repository = new PrismaPartnerMemberRepository(prisma);
      await expect(repository.create(data)).rejects.toThrow('Partner member userId, partnerId and role are required');
      expect(partnerMember.create).not.toHaveBeenCalled();
    }
  });

  it('creates through save when no persisted id exists and updates when it does', async () => {
    const { prisma, partnerMember } = client();
    const repository = new PrismaPartnerMemberRepository(prisma);
    partnerMember.create.mockResolvedValue(memberRecord());
    partnerMember.update.mockResolvedValue(memberRecord({ role: PartnerMemberRole.MANAGER }));

    await repository.save({ userId: 7, partnerId: 9, role: PartnerMemberRole.OWNER } as PartnerMember);
    expect(partnerMember.create).toHaveBeenCalled();

    await expect(repository.save(memberRecord({ role: PartnerMemberRole.MANAGER }) as PartnerMember))
      .resolves.toMatchObject({ role: PartnerMemberRole.MANAGER });
    expect(partnerMember.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }));
  });

  it('reports delete success and persistence failure', async () => {
    const { prisma, partnerMember } = client();
    const repository = new PrismaPartnerMemberRepository(prisma);
    partnerMember.delete.mockResolvedValueOnce(memberRecord()).mockRejectedValueOnce(new Error('missing'));

    await expect(repository.delete(1)).resolves.toBe(true);
    await expect(repository.delete(999)).resolves.toBe(false);
  });
});
