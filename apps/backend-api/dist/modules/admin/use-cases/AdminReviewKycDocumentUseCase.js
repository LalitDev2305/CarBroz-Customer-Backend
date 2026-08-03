import { KycDocumentStatus, PartnerStatus } from '@carbroz/common';
export class AdminReviewKycDocumentUseCase {
    kycDocumentRepository;
    partnerRepository;
    constructor(kycDocumentRepository, partnerRepository) {
        this.kycDocumentRepository = kycDocumentRepository;
        this.partnerRepository = partnerRepository;
    }
    async execute(request) {
        const adminUserId = request.context.authenticatedUser?.id;
        if (!adminUserId) {
            throw new Error('UNAUTHORIZED: Admin must be logged in');
        }
        const status = request.data.action === 'APPROVE' ? KycDocumentStatus.APPROVED : KycDocumentStatus.REJECTED;
        if (status === KycDocumentStatus.REJECTED && !request.data.reason) {
            throw new Error('BAD_REQUEST: Rejection reason is required');
        }
        const document = await this.kycDocumentRepository.findById(request.data.documentId);
        if (!document) {
            throw new Error('NOT_FOUND: KYC document not found');
        }
        document.status = status;
        document.rejectionReason = request.data.reason || null;
        document.verifiedById = adminUserId;
        document.updatedAt = new Date();
        const updated = await this.kycDocumentRepository.save(document);
        if (request.data.action === 'APPROVE') {
            const allDocs = await this.kycDocumentRepository.findByPartnerId(document.partnerId);
            const hasPending = allDocs.some(d => d.status === KycDocumentStatus.PENDING);
            if (!hasPending) {
                const partner = await this.partnerRepository.findById(document.partnerId);
                if (partner) {
                    partner.status = PartnerStatus.ACTIVE;
                    await this.partnerRepository.save(partner);
                }
            }
        }
        return updated;
    }
}
//# sourceMappingURL=AdminReviewKycDocumentUseCase.js.map