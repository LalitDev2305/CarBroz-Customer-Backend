import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterIndividualPartnerUseCase } from './RegisterIndividualPartnerUseCase.js';
import { type IPartnerRepository } from '../../profile/domain/repositories/IPartnerRepository.js';
import { type IPartnerMemberRepository } from '../../profile/domain/repositories/IPartnerMemberRepository.js';
import { PartnerType } from '../../profile/domain/PartnerType.js';
import { PartnerStatus } from '../../profile/domain/PartnerStatus.js';
import { PartnerMemberRole } from '../../profile/domain/PartnerMemberRole.js';
import { PartnerMemberStatus } from '../../profile/domain/PartnerMemberStatus.js';
import { type ITransactionProvider } from '@carbroz/foundation-kernel';

describe('RegisterIndividualPartnerUseCase', () => {
  let partnerRepo: any;
  let partnerMemberRepo: any;
  let transactionProvider: any;
  let useCase: RegisterIndividualPartnerUseCase;

  beforeEach(() => {
    partnerRepo = {
      create: vi.fn(),
      setUnitOfWork: vi.fn()
    };

    partnerMemberRepo = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      setUnitOfWork: vi.fn()
    };

    transactionProvider = {
      runInTransaction: vi.fn((cb) => cb({}))
    };

    useCase = new RegisterIndividualPartnerUseCase(
      partnerRepo as unknown as IPartnerRepository,
      partnerMemberRepo as unknown as IPartnerMemberRepository,
      transactionProvider as unknown as ITransactionProvider
    );
  });

  it('should throw Unauthorized if no user in context', async () => {
    await expect(useCase.execute({ context: {} as any, data: { businessName: 'Test' } })).rejects.toThrow("Unauthorized");
  });

  it('should throw if user already has a partner', async () => {
    partnerMemberRepo.findByUserId.mockResolvedValue([{ id: 1 }]);
    await expect(useCase.execute({ context: { authenticatedUser: { id: 1 } } as any, data: { businessName: 'Test' } })).rejects.toThrow("User is already associated with a partner");
  });

  it('should create partner and member successfully', async () => {
    partnerMemberRepo.findByUserId.mockResolvedValue([]);
    partnerRepo.create.mockResolvedValue({ id: 10, businessName: 'Test', type: PartnerType.INDIVIDUAL, status: PartnerStatus.PENDING });
    partnerMemberRepo.create.mockResolvedValue({ id: 20, partnerId: 10, userId: 1, role: PartnerMemberRole.OWNER, status: PartnerMemberStatus.ACTIVE });

    const result = await useCase.execute({ context: { authenticatedUser: { id: 1 } } as any, data: { businessName: 'Test' } });

    expect(result.partner.id).toBe(10);
    expect(result.member.id).toBe(20);
    expect(partnerRepo.create).toHaveBeenCalledWith({
      businessName: 'Test',
      type: PartnerType.INDIVIDUAL,
      status: PartnerStatus.PENDING
    });
    expect(partnerMemberRepo.create).toHaveBeenCalledWith({
      userId: 1,
      partnerId: 10,
      role: PartnerMemberRole.OWNER,
      status: PartnerMemberStatus.ACTIVE
    });
  });
});
