import { createContainer, asValue } from 'awilix';
import { describe, expect, it, vi } from 'vitest';
import { GetPartnerProfileUseCase } from '../application/use-cases/GetPartnerProfileUseCase.js';
import { GetPartnerKycStatusUseCase } from '../application/use-cases/GetPartnerKycStatusUseCase.js';
import { RegisterIndividualPartnerUseCase } from '../application/use-cases/RegisterIndividualPartnerUseCase.js';
import { RegisterOrganizationPartnerUseCase } from '../application/use-cases/RegisterOrganizationPartnerUseCase.js';
import { UploadKycDocumentUseCase } from '../application/use-cases/UploadKycDocumentUseCase.js';
import { VerifyPartnerUseCase } from '../application/use-cases/VerifyPartnerUseCase.js';
import { AdminReviewKycDocumentUseCase } from '../kyc/application/AdminReviewKycDocumentUseCase.js';
import { VerifyPartnerKycDocumentUseCase } from '../kyc/application/VerifyPartnerKycDocumentUseCase.js';
import { KycDocumentStatus } from '../kyc/domain/KycDocumentStatus.js';
import { PartnerStatus } from '../domain/PartnerStatus.js';
import { registerPartnerProfileModule } from '../partner-profile.module.js';
import { registerPartnerKycModule } from '../kyc/partner-kyc.module.js';

const context = (id: number | string, kind = 'PARTNER', roles = ['PARTNER']) => ({
  actor: { id, kind, roles },
  correlationId: 'corr-1',
  timestamp: new Date('2026-01-01T00:00:00.000Z'),
}) as any;

const partner = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  publicId: 'partner-7',
  status: PartnerStatus.PENDING,
  ...overrides,
}) as any;

const membership = (overrides: Record<string, unknown> = {}) => ({
  id: 3,
  userId: 11,
  partnerId: 7,
  role: 'OWNER',
  status: 'ACTIVE',
  ...overrides,
}) as any;

describe('Partner application closeout behavior', () => {
  it('covers GetPartnerProfile authorization, missing membership and success', async () => {
    const partnerRepository = { findById: vi.fn().mockResolvedValue(partner()) } as any;
    const memberRepository = { findByUserId: vi.fn() } as any;
    const useCase = new GetPartnerProfileUseCase(partnerRepository, memberRepository);

    await expect(useCase.execute({ context: context(0) })).rejects.toThrow('Unauthorized');
    memberRepository.findByUserId.mockResolvedValueOnce([]);
    await expect(useCase.execute({ context: context(11) })).rejects.toThrow('Partner profile not found');
    memberRepository.findByUserId.mockResolvedValueOnce([membership()]);
    await expect(useCase.execute({ context: context(11) })).resolves.toEqual({
      partner: expect.objectContaining({ id: 7 }),
      membership: expect.objectContaining({ partnerId: 7 }),
    });
    expect(partnerRepository.findById).toHaveBeenCalledWith(7);
  });

  it.each([
    ['individual', RegisterIndividualPartnerUseCase, 'INDIVIDUAL'],
    ['organization', RegisterOrganizationPartnerUseCase, 'ORGANIZATION'],
  ] as const)('covers %s registration authorization, duplicate membership and transaction success', async (_name, UseCase, expectedType) => {
    const createdPartner = partner();
    const createdMember = membership();
    const partnerRepository = {
      setUnitOfWork: vi.fn(),
      create: vi.fn().mockResolvedValue(createdPartner),
    } as any;
    const memberRepository = {
      findByUserId: vi.fn(),
      setUnitOfWork: vi.fn(),
      create: vi.fn().mockResolvedValue(createdMember),
    } as any;
    const transaction = { id: 'tx' };
    const transactionProvider = {
      runInTransaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(transaction)),
    } as any;
    const useCase = new UseCase(partnerRepository, memberRepository, transactionProvider);

    await expect(useCase.execute({ context: context(0), data: { businessName: 'CarBroz' } })).rejects.toThrow('Unauthorized');
    memberRepository.findByUserId.mockResolvedValueOnce([createdMember]);
    await expect(useCase.execute({ context: context(11), data: { businessName: 'CarBroz' } })).rejects.toThrow(
      'User is already associated with a partner',
    );

    memberRepository.findByUserId.mockResolvedValueOnce([]);
    const result = await useCase.execute({ context: context(11), data: { businessName: 'CarBroz' } });
    expect(result).toEqual({ partner: createdPartner, member: createdMember });
    expect(partnerRepository.setUnitOfWork).toHaveBeenCalledWith(transaction);
    expect(memberRepository.setUnitOfWork).toHaveBeenCalledWith(transaction);
    expect(partnerRepository.create).toHaveBeenCalledWith(expect.objectContaining({ businessName: 'CarBroz', type: expectedType, status: 'PENDING' }));
    expect(memberRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 11, partnerId: 7, role: 'OWNER', status: 'ACTIVE' }));
  });

  it('covers partner verification forbidden, missing and successful transitions', async () => {
    const existing = partner();
    const repository = {
      findByPublicId: vi.fn(),
      save: vi.fn(async (value) => value),
    } as any;
    const useCase = new VerifyPartnerUseCase(repository);

    await expect(useCase.execute({ context: context(11), data: { partnerId: 'partner-7', status: PartnerStatus.ACTIVE } })).rejects.toThrow('Forbidden');
    repository.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ context: context(1, 'ADMIN', ['ADMIN']), data: { partnerId: 'missing', status: PartnerStatus.ACTIVE } })).rejects.toThrow('Partner not found');
    repository.findByPublicId.mockResolvedValueOnce(existing);
    const result = await useCase.execute({ context: context(1, 'ADMIN', ['ADMIN']), data: { partnerId: 'partner-7', status: PartnerStatus.ACTIVE } });
    expect(result.status).toBe(PartnerStatus.ACTIVE);
    expect(repository.save).toHaveBeenCalledWith(existing);
  });

  it('covers KYC upload authorization, ownership, role and filename behavior', async () => {
    const uploader = { execute: vi.fn().mockResolvedValue(undefined) } as any;
    const memberRepository = { findByUserIdAndPartnerId: vi.fn() } as any;
    const partnerRepository = { findByPublicId: vi.fn() } as any;
    const useCase = new UploadKycDocumentUseCase(uploader, memberRepository, partnerRepository);
    const data = { partnerPublicId: 'partner-7', type: 'PAN' as any, fileBuffer: Buffer.from('x'), mimeType: 'image/png' };

    await expect(useCase.execute({ context: context(0), data })).rejects.toThrow('UNAUTHORIZED');
    partnerRepository.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ context: context(11), data })).rejects.toThrow('NOT_FOUND');

    partnerRepository.findByPublicId.mockResolvedValue(partner());
    memberRepository.findByUserIdAndPartnerId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ context: context(11), data })).rejects.toThrow('NOT_FOUND');
    memberRepository.findByUserIdAndPartnerId.mockResolvedValueOnce(membership({ status: 'SUSPENDED' }));
    await expect(useCase.execute({ context: context(11), data })).rejects.toThrow('NOT_FOUND');
    memberRepository.findByUserIdAndPartnerId.mockResolvedValueOnce(membership({ role: 'TECHNICIAN' }));
    await expect(useCase.execute({ context: context(11), data })).rejects.toThrow('FORBIDDEN');

    memberRepository.findByUserIdAndPartnerId.mockResolvedValueOnce(membership());
    await useCase.execute({ context: context(11), data });
    expect(uploader.execute).toHaveBeenLastCalledWith(expect.objectContaining({ partnerId: 7, uploadedById: 11, fileName: 'kyc-document' }));

    memberRepository.findByUserIdAndPartnerId.mockResolvedValueOnce(membership({ role: 'MANAGER' }));
    await useCase.execute({ context: context(11), data: { ...data, fileName: 'pan.png' } });
    expect(uploader.execute).toHaveBeenLastCalledWith(expect.objectContaining({ fileName: 'pan.png' }));
  });

  it('covers KYC status authorization, membership and success', async () => {
    const documents = [{ id: 1, status: KycDocumentStatus.PENDING }];
    const kycRepository = { findByPartnerId: vi.fn().mockResolvedValue(documents) } as any;
    const memberRepository = { findByUserIdAndPartnerId: vi.fn() } as any;
    const partnerRepository = { findByPublicId: vi.fn() } as any;
    const useCase = new GetPartnerKycStatusUseCase(kycRepository, memberRepository, partnerRepository);
    const data = { partnerPublicId: 'partner-7' };

    await expect(useCase.execute({ context: context(0), data })).rejects.toThrow('UNAUTHORIZED');
    partnerRepository.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ context: context(11), data })).rejects.toThrow('NOT_FOUND');
    partnerRepository.findByPublicId.mockResolvedValue(partner());
    memberRepository.findByUserIdAndPartnerId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ context: context(11), data })).rejects.toThrow('NOT_FOUND');
    memberRepository.findByUserIdAndPartnerId.mockResolvedValueOnce(membership({ status: 'SUSPENDED' }));
    await expect(useCase.execute({ context: context(11), data })).rejects.toThrow('NOT_FOUND');
    memberRepository.findByUserIdAndPartnerId.mockResolvedValueOnce(membership());
    await expect(useCase.execute({ context: context(11), data })).resolves.toBe(documents);
    expect(kycRepository.findByPartnerId).toHaveBeenCalledWith(7);
  });

  it('covers legacy KYC verification approval and rejection reason branches', async () => {
    const repository = {
      findById: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue({ id: 5 }),
    } as any;
    const useCase = new VerifyPartnerKycDocumentUseCase(repository);
    repository.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute({ documentId: 5, adminUserId: 1, approved: true })).rejects.toThrow('not found');

    repository.findById.mockResolvedValue({ id: 5 });
    await useCase.execute({ documentId: 5, adminUserId: 1, approved: true });
    expect(repository.updateStatus).toHaveBeenLastCalledWith(5, KycDocumentStatus.APPROVED, 1, null);
    await useCase.execute({ documentId: 5, adminUserId: 1, approved: false, rejectionReason: 'Blurred' });
    expect(repository.updateStatus).toHaveBeenLastCalledWith(5, KycDocumentStatus.REJECTED, 1, 'Blurred');
    await useCase.execute({ documentId: 5, adminUserId: 1, approved: false });
    expect(repository.updateStatus).toHaveBeenLastCalledWith(5, KycDocumentStatus.REJECTED, 1, 'Document verification failed');
  });

  it('covers admin approval when no pending docs remain and partner is absent', async () => {
    const document = { id: 9, partnerId: 7, status: KycDocumentStatus.PENDING } as any;
    const updated = { ...document, status: KycDocumentStatus.APPROVED } as any;
    const kycRepository = {
      findById: vi.fn().mockResolvedValue(document),
      updateStatus: vi.fn().mockResolvedValue(updated),
      findByPartnerId: vi.fn().mockResolvedValue([updated]),
    } as any;
    const partnerRepository = { findById: vi.fn().mockResolvedValue(null), save: vi.fn() } as any;
    const useCase = new AdminReviewKycDocumentUseCase(kycRepository, partnerRepository);

    await expect(useCase.execute({ context: context(1, 'ADMIN', ['ADMIN']), data: { documentId: 9, action: 'APPROVE' } })).resolves.toBe(updated);
    expect(partnerRepository.findById).toHaveBeenCalledWith(7);
    expect(partnerRepository.save).not.toHaveBeenCalled();
  });

  it('executes Partner profile and KYC DI factories against the canonical Prisma provider', () => {
    const prismaClient = {};
    const profileContainer = createContainer();
    profileContainer.register({ prismaProvider: asValue({ getClient: () => prismaClient }) });
    registerPartnerProfileModule(profileContainer as any);
    expect(profileContainer.resolve('partnerRepository')).toBeDefined();
    expect(profileContainer.resolve('partnerMemberRepository')).toBeDefined();
    expect(profileContainer.resolve('partnerProfileRepository')).toBeDefined();

    const kycContainer = createContainer();
    kycContainer.register({ prismaProvider: asValue({ getClient: () => prismaClient }) });
    registerPartnerKycModule(kycContainer as any);
    expect(kycContainer.resolve('kycDocumentRepository')).toBeDefined();
  });
});
