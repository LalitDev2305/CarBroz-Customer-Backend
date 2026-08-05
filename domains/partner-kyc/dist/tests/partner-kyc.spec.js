import { describe, it, expect, vi } from 'vitest';
import { UploadPartnerKycDocumentUseCase } from '../application/UploadPartnerKycDocumentUseCase.js';
import { VerifyPartnerKycDocumentUseCase } from '../application/VerifyPartnerKycDocumentUseCase.js';
import { SupabaseStorageProvider } from '@carbroz/platform-storage';
describe('Partner KYC Domain Use Cases', () => {
    const mockRepository = {
        create: vi.fn().mockImplementation(async (doc) => ({
            id: 1,
            publicId: 'DOC_123',
            ...doc,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
        findById: vi.fn().mockImplementation(async (id) => ({
            id,
            publicId: 'DOC_123',
            partnerId: 10,
            type: 'AADHAR',
            fileUrl: 'http://test.com/doc.pdf',
            status: 'PENDING',
            rejectionReason: null,
            uploadedById: 10,
            verifiedById: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
        updateStatus: vi.fn().mockImplementation(async (id, status, verifiedById, rejectionReason) => ({
            id,
            publicId: 'DOC_123',
            partnerId: 10,
            type: 'AADHAR',
            fileUrl: 'http://test.com/doc.pdf',
            status,
            rejectionReason,
            uploadedById: 10,
            verifiedById,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
    };
    const storageProvider = new SupabaseStorageProvider({
        baseUrl: 'https://test-supabase.co/storage/v1',
    });
    it('UploadPartnerKycDocumentUseCase should process upload and return presigned URL', async () => {
        const useCase = new UploadPartnerKycDocumentUseCase(mockRepository, storageProvider);
        const result = await useCase.execute({
            partnerId: 10,
            uploadedById: 10,
            type: 'PAN',
            fileName: 'pan_card.pdf',
            fileBuffer: Buffer.from('dummy pdf'),
            mimeType: 'application/pdf',
        });
        expect(result.document.status).toBe('PENDING');
        expect(result.document.partnerId).toBe(10);
        expect(result.presignedUrl).toContain('sign/partner-kyc-docs');
    });
    it('VerifyPartnerKycDocumentUseCase should approve KYC document', async () => {
        const useCase = new VerifyPartnerKycDocumentUseCase(mockRepository);
        const result = await useCase.execute({
            documentId: 1,
            adminUserId: 99,
            approved: true,
        });
        expect(result.status).toBe('APPROVED');
        expect(result.verifiedById).toBe(99);
    });
    it('VerifyPartnerKycDocumentUseCase should reject KYC document with reason', async () => {
        const useCase = new VerifyPartnerKycDocumentUseCase(mockRepository);
        const result = await useCase.execute({
            documentId: 1,
            adminUserId: 99,
            approved: false,
            rejectionReason: 'Blurred Image',
        });
        expect(result.status).toBe('REJECTED');
        expect(result.rejectionReason).toBe('Blurred Image');
    });
});
//# sourceMappingURL=partner-kyc.spec.js.map