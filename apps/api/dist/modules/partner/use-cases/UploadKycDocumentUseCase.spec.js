import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadKycDocumentUseCase } from './UploadKycDocumentUseCase.js';
import { KycDocumentType, KycDocumentStatus, PartnerMemberRole, PartnerMemberStatus } from '@carbroz/foundation-kernel';
describe('UploadKycDocumentUseCase', () => {
    let useCase;
    let mockStorageProvider;
    let mockKycDocumentRepository;
    let mockPartnerMemberRepository;
    let context;
    beforeEach(() => {
        mockStorageProvider = {
            uploadFile: vi.fn(),
            getFileUrl: vi.fn(),
            deleteFile: vi.fn()
        };
        mockKycDocumentRepository = {
            create: vi.fn(),
            findById: vi.fn(),
            findByPartnerId: vi.fn(),
            findByPartnerIdAndStatus: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findAll: vi.fn(),
            save: vi.fn()
        };
        mockPartnerMemberRepository = {
            findByUserIdAndPartnerId: vi.fn()
        };
        useCase = new UploadKycDocumentUseCase(mockStorageProvider, mockKycDocumentRepository, mockPartnerMemberRepository);
        context = {
            traceId: 'test-trace',
            requestId: 'req-id',
            spanId: 'span-id',
            correlationId: 'corr-id',
            locale: 'en',
            timezone: 'UTC',
            authenticatedUser: { id: 1 },
        };
    });
    it('should upload a document successfully if user is OWNER', async () => {
        mockPartnerMemberRepository.findByUserIdAndPartnerId.mockResolvedValue({
            id: 1,
            publicId: 'uuid',
            userId: 1,
            partnerId: 10,
            role: PartnerMemberRole.OWNER,
            status: PartnerMemberStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        mockStorageProvider.uploadFile.mockResolvedValue('http://mock/doc.pdf');
        mockKycDocumentRepository.create.mockResolvedValue({});
        await useCase.execute({
            context,
            data: {
                partnerId: 10,
                type: KycDocumentType.NATIONAL_ID,
                fileBuffer: Buffer.from('test'),
                mimeType: 'application/pdf'
            }
        });
        expect(mockStorageProvider.uploadFile).toHaveBeenCalled();
        expect(mockKycDocumentRepository.create).toHaveBeenCalledWith({
            partnerId: 10,
            type: KycDocumentType.NATIONAL_ID,
            fileUrl: 'http://mock/doc.pdf',
            status: KycDocumentStatus.PENDING,
            uploadedById: 1
        });
    });
    it('should throw FORBIDDEN if user is not OWNER or MANAGER', async () => {
        mockPartnerMemberRepository.findByUserIdAndPartnerId.mockResolvedValue({
            id: 1,
            publicId: 'uuid',
            userId: 1,
            partnerId: 10,
            role: PartnerMemberRole.EMPLOYEE,
            status: PartnerMemberStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await expect(useCase.execute({
            context,
            data: {
                partnerId: 10,
                type: KycDocumentType.NATIONAL_ID,
                fileBuffer: Buffer.from('test'),
                mimeType: 'application/pdf'
            }
        })).rejects.toThrow('FORBIDDEN: Only owners or managers can upload KYC documents');
    });
});
//# sourceMappingURL=UploadKycDocumentUseCase.spec.js.map