export class VerifyPartnerKycDocumentCommandHandler {
    kycRepository;
    constructor(kycRepository) {
        this.kycRepository = kycRepository;
    }
    async execute(input) {
        const document = await this.kycRepository.findById(input.documentId);
        if (!document) {
            throw new Error(`KYC Document with ID ${input.documentId} not found`);
        }
        const newStatus = input.approved
            ? 'APPROVED'
            : 'REJECTED';
        return this.kycRepository.updateStatus(input.documentId, newStatus, input.adminUserId, input.approved ? null : input.rejectionReason || 'Document verification failed');
    }
}
//# sourceMappingURL=VerifyPartnerKycDocumentCommandHandler.js.map