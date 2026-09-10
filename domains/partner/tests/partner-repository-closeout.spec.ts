import { describe, expect, it, vi } from 'vitest';
import { PrismaPartnerRepository } from '../infrastructure/repositories/PrismaPartnerRepository.js';
import { PrismaPartnerProfileRepository } from '../infrastructure/repositories/PrismaPartnerProfileRepository.js';
import { PrismaKycDocumentRepository } from '../kyc/infrastructure/repositories/PrismaKycDocumentRepository.js';
import { PartnerStatus } from '../domain/PartnerStatus.js';
import { PartnerType } from '../domain/PartnerType.js';
import { KycDocumentStatus } from '../kyc/domain/KycDocumentStatus.js';

const dates = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

const partnerRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  publicId: 'partner-1',
  businessName: 'CarBroz',
  type: PartnerType.INDIVIDUAL,
  status: PartnerStatus.PENDING,
  deletedAt: null,
  ...dates,
  ...overrides,
});

const profileRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 2,
  publicId: 'profile-2',
  partnerId: 1,
  description: 'Doorstep wash',
  logoUrl: null,
  supportEmail: 'support@example.com',
  supportPhone: '9999999999',
  ...dates,
  ...overrides,
});

const kycRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 3,
  publicId: 'kyc-3',
  partnerId: 1,
  type: 'PAN',
  fileUrl: 's3://kyc/pan.png',
  status: KycDocumentStatus.PENDING,
  rejectionReason: null,
  uploadedById: 11,
  verifiedById: null,
  ...dates,
  ...overrides,
});

describe('Partner repository closeout behavior', () => {
  it('covers Partner repository lookup, mapping, create, save, status, delete and unit-of-work paths', async () => {
    const model = {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    const client = { partner: model } as any;
    const repository = new PrismaPartnerRepository(client);

    model.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(partnerRecord());
    await expect(repository.findById(1)).resolves.toBeNull();
    await expect(repository.findByPublicId('partner-1')).resolves.toMatchObject({ id: 1, publicId: 'partner-1' });

    model.findMany.mockResolvedValue([partnerRecord()]);
    await expect(repository.findAll()).resolves.toHaveLength(1);
    await expect(repository.findByType(PartnerType.INDIVIDUAL)).resolves.toHaveLength(1);
    await expect(repository.findByStatus(PartnerStatus.PENDING)).resolves.toHaveLength(1);

    await expect(repository.create({ type: PartnerType.INDIVIDUAL })).rejects.toThrow('businessName and type are required');
    model.create.mockResolvedValue(partnerRecord());
    await repository.create({ businessName: 'CarBroz', type: PartnerType.INDIVIDUAL });
    expect(model.create).toHaveBeenLastCalledWith({ data: { businessName: 'CarBroz', type: PartnerType.INDIVIDUAL, status: PartnerStatus.PENDING } });
    model.create.mockResolvedValue(partnerRecord({ publicId: 'explicit' }));
    await repository.create({ businessName: 'CarBroz', type: PartnerType.INDIVIDUAL, status: PartnerStatus.ACTIVE, publicId: 'explicit' });
    expect(model.create).toHaveBeenLastCalledWith({ data: expect.objectContaining({ publicId: 'explicit', status: PartnerStatus.ACTIVE }) });

    model.create.mockResolvedValue(partnerRecord());
    await repository.save({ ...partnerRecord(), id: 0 } as any);
    model.update.mockResolvedValue(partnerRecord({ status: PartnerStatus.ACTIVE }));
    await repository.save(partnerRecord({ status: PartnerStatus.ACTIVE }) as any);
    await repository.updateStatus(1, PartnerStatus.ACTIVE);

    model.update.mockResolvedValueOnce(partnerRecord({ deletedAt: new Date() }));
    await expect(repository.delete(1)).resolves.toBe(true);
    model.update.mockRejectedValueOnce(new Error('missing'));
    await expect(repository.delete(1)).resolves.toBe(false);

    const uowModel = { ...model, findFirst: vi.fn().mockResolvedValue(partnerRecord()) };
    repository.setUnitOfWork({ partner: uowModel } as any);
    await repository.findById(1);
    expect(uowModel.findFirst).toHaveBeenCalled();
  });

  it('covers Partner profile repository lookup, persistence, delete and unit-of-work paths', async () => {
    const model = {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const repository = new PrismaPartnerProfileRepository({ partnerProfile: model } as any);

    model.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(profileRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(profileRecord());
    await expect(repository.findById(2)).resolves.toBeNull();
    await expect(repository.findByPartnerId(1)).resolves.toMatchObject({ partnerId: 1 });
    await expect(repository.findByPublicId('missing')).resolves.toBeNull();
    await expect(repository.findByPublicId('profile-2')).resolves.toMatchObject({ publicId: 'profile-2' });

    model.findMany.mockResolvedValue([profileRecord()]);
    await expect(repository.findAll()).resolves.toHaveLength(1);

    model.create.mockResolvedValue(profileRecord());
    await repository.create({ partnerId: 1, description: null, logoUrl: null, supportEmail: null, supportPhone: null });
    model.upsert.mockResolvedValue(profileRecord());
    await repository.save(profileRecord({ publicId: '' }) as any);
    await repository.save(profileRecord({ publicId: 'profile-explicit' }) as any);
    model.update.mockResolvedValue(profileRecord({ description: 'Updated' }));
    await repository.update(2, { description: 'Updated' });

    model.delete.mockResolvedValueOnce(profileRecord());
    await expect(repository.delete(2)).resolves.toBe(true);
    model.delete.mockRejectedValueOnce(new Error('missing'));
    await expect(repository.delete(2)).resolves.toBe(false);

    const uow = { partnerProfile: { ...model, findUnique: vi.fn().mockResolvedValue(profileRecord()) } } as any;
    repository.setUnitOfWork(uow);
    await repository.findById(2);
    expect(uow.partnerProfile.findUnique).toHaveBeenCalled();
  });

  it('covers KYC repository CRUD, status filtering and delete error semantics', async () => {
    const model = {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const repository = new PrismaKycDocumentRepository({ kycDocument: model } as any);

    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(kycRecord());
    await expect(repository.findById(3)).resolves.toBeNull();
    await expect(repository.findById(3)).resolves.toMatchObject({ id: 3, partnerId: 1 });

    model.findMany.mockResolvedValue([kycRecord()]);
    await expect(repository.findByPartnerId(1)).resolves.toHaveLength(1);
    await expect(repository.findByPartnerIdAndStatus(1, KycDocumentStatus.PENDING)).resolves.toHaveLength(1);
    await expect(repository.findAll()).resolves.toHaveLength(1);

    model.create.mockResolvedValue(kycRecord());
    await repository.create({
      partnerId: 1,
      type: 'PAN' as any,
      fileUrl: 's3://kyc/pan.png',
      status: KycDocumentStatus.PENDING,
      rejectionReason: null,
      uploadedById: 11,
      verifiedById: null,
    });
    model.update.mockResolvedValue(kycRecord({ status: KycDocumentStatus.APPROVED, verifiedById: 1 }));
    await repository.update(3, { fileUrl: 's3://kyc/new.png' });
    await repository.updateStatus(3, KycDocumentStatus.APPROVED, 1, null);
    await repository.save(kycRecord() as any);

    model.delete.mockResolvedValueOnce(kycRecord());
    await expect(repository.delete(3)).resolves.toBe(true);
    model.delete.mockRejectedValueOnce({ code: 'P2025' });
    await expect(repository.delete(3)).resolves.toBe(false);
    const fatal = new Error('database unavailable');
    model.delete.mockRejectedValueOnce(fatal);
    await expect(repository.delete(3)).rejects.toBe(fatal);
  });
});
