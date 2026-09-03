import { describe, expect, it, vi } from 'vitest';
import { UploadPartnerKycDocumentUseCase } from '../application/UploadPartnerKycDocumentUseCase.js';
import { VerifyPartnerKycDocumentUseCase } from '../application/VerifyPartnerKycDocumentUseCase.js';
import { type KycStoragePort } from '../application/ports/KycStoragePort.js';
import { type IKycDocumentRepository } from '../domain/repositories/IKycDocumentRepository.js';
import { KycDocumentStatus } from '../domain/KycDocumentStatus.js';
import { KycDocumentType } from '../domain/KycDocumentType.js';
import { type KycDocument } from '../domain/KycDocument.js';

function document(overrides: Partial<KycDocument> = {}): KycDocument {
  return {
    id: 1,
    publicId: 'kyc-public-1',
    partnerId: 10,
    type: KycDocumentType.NATIONAL_ID,
    fileUrl: 'storage://kyc/file',
    status: KycDocumentStatus.PENDING,
    rejectionReason: null,
    uploadedById: 20,
    verifiedById: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function repository(): IKycDocumentRepository {
  return {
    findById: vi.fn(),
    findByPartnerId: vi.fn(),
    findByPartnerIdAndStatus: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
  };
}

function storage(): KycStoragePort {
  return {
    validateFile: vi.fn().mockResolvedValue(true),
    uploadFile: vi.fn().mockResolvedValue('storage://kyc/file'),
    getPresignedDownloadUrl: vi.fn().mockResolvedValue('https://signed.example/kyc/file'),
  };
}

describe('partner KYC application boundary', () => {
  it('uploads through storage port and persists through repository port', async () => {
    const repo = repository();
    const store = storage();
    vi.mocked(repo.create).mockResolvedValue(document());

    const useCase = new UploadPartnerKycDocumentUseCase(repo, store, () => 1234567890);
    const result = await useCase.execute({
      partnerId: 10,
      uploadedById: 20,
      type: KycDocumentType.NATIONAL_ID,
      fileName: 'my id.pdf',
      fileBuffer: Buffer.from('test'),
      mimeType: 'application/pdf',
    });

    expect(store.validateFile).toHaveBeenCalledOnce();
    expect(store.uploadFile).toHaveBeenCalledWith(
      'partner-kyc-docs',
      'kyc/10/NATIONAL_ID_1234567890_my_id.pdf',
      expect.any(Buffer),
      'application/pdf',
    );
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
      partnerId: 10,
      status: KycDocumentStatus.PENDING,
      fileUrl: 'storage://kyc/file',
    }));
    expect(result.presignedUrl).toBe('https://signed.example/kyc/file');
  });

  it('verifies through repository port without concrete infrastructure', async () => {
    const repo = repository();
    vi.mocked(repo.findById).mockResolvedValue(document());
    vi.mocked(repo.updateStatus).mockResolvedValue(document({ status: KycDocumentStatus.APPROVED, verifiedById: 99 }));

    const useCase = new VerifyPartnerKycDocumentUseCase(repo);
    const result = await useCase.execute({ documentId: 1, adminUserId: 99, approved: true });

    expect(repo.updateStatus).toHaveBeenCalledWith(1, KycDocumentStatus.APPROVED, 99, null);
    expect(result.status).toBe(KycDocumentStatus.APPROVED);
  });

  it('rejects verification of a missing document', async () => {
    const repo = repository();
    vi.mocked(repo.findById).mockResolvedValue(null);

    const useCase = new VerifyPartnerKycDocumentUseCase(repo);

    await expect(useCase.execute({ documentId: 404, adminUserId: 99, approved: true }))
      .rejects.toThrow('KYC Document with ID 404 not found');
  });
});
