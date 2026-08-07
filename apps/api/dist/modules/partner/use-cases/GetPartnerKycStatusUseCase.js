export class GetPartnerKycStatusUseCase {
    kycDocumentRepository;
    partnerMemberRepository;
    constructor(kycDocumentRepository, partnerMemberRepository) {
        this.kycDocumentRepository = kycDocumentRepository;
        this.partnerMemberRepository = partnerMemberRepository;
    }
    async execute(request) {
        const userId = request.context.authenticatedUser?.id;
        if (!userId) {
            throw new Error('UNAUTHORIZED: User must be logged in');
        }
        // Verify user is a member of the partner
        const membership = await this.partnerMemberRepository.findByUserIdAndPartnerId(userId, request.data.partnerId);
        if (!membership) {
            throw new Error('FORBIDDEN: You do not have access to this partner profile');
        }
        return await this.kycDocumentRepository.findByPartnerId(request.data.partnerId);
    }
}
//# sourceMappingURL=GetPartnerKycStatusUseCase.js.map