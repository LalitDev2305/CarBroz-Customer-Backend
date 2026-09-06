import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExecutionContext } from '@carbroz/foundation-kernel';
import { PartnerStatus } from '../../domain/PartnerStatus.js';
import { PartnerType } from '../../domain/PartnerType.js';
import { KycDocumentStatus } from '../domain/KycDocumentStatus.js';
import { KycDocumentType } from '../domain/KycDocumentType.js';
import { AdminReviewKycDocumentUseCase } from './AdminReviewKycDocumentUseCase.js';

const context = (id: number | string, kind: ExecutionContext['actor']['kind'], roles: string[]): ExecutionContext => ({
  correlationId: 'kyc-review-test',
  timestamp: new Date('2026-01-01T00:00:00.000Z'),
  actor: { id, kind, roles },
});

const document = (status = KycDocumentStatus.PENDING) => ({
  id: 7,
  publicId: 'kyc-7',
  partnerId: 3,
  type: KycDocumentType.NATIONAL_ID,
  fileUrl: 's3://kyc/7',
  status,
  rejectionReason: null,
  uploadedById: 10,
  verifiedById: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

const partner = () => ({
  id: 3,
  publicId: 'partner-3',
  businessName: 'CarBroz Partner',
  type: PartnerType.INDIVIDUAL,
  status: PartnerStatus.PENDING,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
});

describe('AdminReviewKycDocumentUseCase', () => {
  let kycRepository: any;
  let partnerRepository: any;
  let useCase: AdminReviewKycDocumentUseCase;

  beforeEach(() => {
    kycRepository = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
      findByPartnerId: vi.fn(),
    };
    partnerRepository = { findById: vi.fn(), save: vi.fn() };
    useCase = new AdminReviewKycDocumentUseCase(kycRepository, partnerRepository);
  });

  it('rejects invalid actor ids and non-admin actors before repository access', async () => {
    for (const actorContext of [
      context(0, 'ADMIN', ['ADMIN']),
      context(-1, 'ADMIN', ['ADMIN']),
      context('not-a-number', 'ADMIN', ['ADMIN']),
      context(4, 'CUSTOMER', ['CUSTOMER']),
    ]) {
      await expect(useCase.execute({ context: actorContext, data: { documentId: 7, action: 'APPROVE' } })).rejects.toThrow('UNAUTHORIZED');
    }
    expect(kycRepository.findById).not.toHaveBeenCalled();
  });

  it('accepts ADMIN role even when actor kind is not ADMIN', async () => {
    const pending = document();
    const updated = { ...pending, status: KycDocumentStatus.REJECTED, rejectionReason: 'Unreadable' };
    kycRepository.findById.mockResolvedValue(pending);
    kycRepository.updateStatus.mockResolvedValue(updated);

    await expect(useCase.execute({
      context: context(5, 'CUSTOMER', ['ADMIN']),
      data: { documentId: 7, action: 'REJECT', reason: 'Unreadable' },
    })).resolves.toBe(updated);
    expect(kycRepository.updateStatus).toHaveBeenCalledWith(7, KycDocumentStatus.REJECTED, 5, 'Unreadable');
    expect(kycRepository.findByPartnerId).not.toHaveBeenCalled();
  });

  it('requires a rejection reason', async () => {
    await expect(useCase.execute({
      context: context(5, 'ADMIN', []),
      data: { documentId: 7, action: 'REJECT' },
    })).rejects.toThrow('Rejection reason is required');
  });

  it('fails when the document does not exist', async () => {
    kycRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({
      context: context(5, 'ADMIN', []),
      data: { documentId: 99, action: 'APPROVE' },
    })).rejects.toThrow('KYC document not found');
  });

  it('approves without activating partner while another document is pending', async () => {
    const pending = document();
    const updated = { ...pending, status: KycDocumentStatus.APPROVED };
    kycRepository.findById.mockResolvedValue(pending);
    kycRepository.updateStatus.mockResolvedValue(updated);
    kycRepository.findByPartnerId.mockResolvedValue([updated, document(KycDocumentStatus.PENDING)]);

    await expect(useCase.execute({
      context: context(5, 'ADMIN', []),
      data: { documentId: 7, action: 'APPROVE' },
    })).resolves.toBe(updated);
    expect(kycRepository.updateStatus).toHaveBeenCalledWith(7, KycDocumentStatus.APPROVED, 5, null);
    expect(partnerRepository.findById).not.toHaveBeenCalled();
  });

  it('keeps approval successful when all documents are reviewed but partner is absent', async () => {
    const pending = document();
    const updated = { ...pending, status: KycDocumentStatus.APPROVED };
    kycRepository.findById.mockResolvedValue(pending);
    kycRepository.updateStatus.mockResolvedValue(updated);
    kycRepository.findByPartnerId.mockResolvedValue([updated]);
    partnerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({
      context: context(5, 'ADMIN', []),
      data: { documentId: 7, action: 'APPROVE' },
    })).resolves.toBe(updated);
    expect(partnerRepository.save).not.toHaveBeenCalled();
  });

  it('activates and saves partner after the last pending KYC document is approved', async () => {
    const pending = document();
    const updated = { ...pending, status: KycDocumentStatus.APPROVED };
    const existingPartner = partner();
    kycRepository.findById.mockResolvedValue(pending);
    kycRepository.updateStatus.mockResolvedValue(updated);
    kycRepository.findByPartnerId.mockResolvedValue([updated, document(KycDocumentStatus.APPROVED)]);
    partnerRepository.findById.mockResolvedValue(existingPartner);
    partnerRepository.save.mockImplementation(async (value: any) => value);

    const result = await useCase.execute({
      context: context(5, 'ADMIN', []),
      data: { documentId: 7, action: 'APPROVE' },
    });

    expect(result).toBe(updated);
    expect(existingPartner.status).toBe(PartnerStatus.ACTIVE);
    expect(partnerRepository.save).toHaveBeenCalledWith(existingPartner);
  });
});
