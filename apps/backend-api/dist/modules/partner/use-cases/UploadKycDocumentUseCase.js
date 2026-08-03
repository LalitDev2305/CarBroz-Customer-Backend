import { KycDocumentStatus } from '@carbroz/common';
import crypto from 'crypto';
export class UploadKycDocumentUseCase {
    storageProvider;
    kycDocumentRepository;
    partnerMemberRepository;
    constructor(storageProvider, kycDocumentRepository, partnerMemberRepository) {
        this.storageProvider = storageProvider;
        this.kycDocumentRepository = kycDocumentRepository;
        this.partnerMemberRepository = partnerMemberRepository;
    }
    async execute(request) {
        const userId = request.context.authenticatedUser?.id;
        if (!userId) {
            throw new Error('UNAUTHORIZED: User must be logged in');
        }
        // Verify user is a member of the partner (OWNER or MANAGER)
        const membership = await this.partnerMemberRepository.findByUserIdAndPartnerId(userId, request.data.partnerId);
        if (!membership || !['OWNER', 'MANAGER'].includes(membership.role)) {
            throw new Error('FORBIDDEN: Only owners or managers can upload KYC documents');
        }
        // Generate unique object name
        const fileId = crypto.randomUUID();
        const extension = request.data.mimeType === 'application/pdf' ? 'pdf' : (request.data.mimeType.split('/')[1] || 'bin');
        const objectName = `partner-${request.data.partnerId}/${request.data.type.toLowerCase()}-${fileId}.${extension}`;
        // Upload via Storage Provider
        const fileUrl = await this.storageProvider.uploadFile('kyc-documents', objectName, request.data.fileBuffer, request.data.mimeType);
        // Save to Database
        await this.kycDocumentRepository.create({
            partnerId: request.data.partnerId,
            type: request.data.type,
            fileUrl,
            status: KycDocumentStatus.PENDING,
            uploadedById: userId,
        });
    }
}
//# sourceMappingURL=UploadKycDocumentUseCase.js.map