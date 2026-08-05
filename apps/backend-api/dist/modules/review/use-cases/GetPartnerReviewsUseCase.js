export class GetPartnerReviewsUseCase {
    partnerRepository;
    reviewRepository;
    constructor(partnerRepository, reviewRepository) {
        this.partnerRepository = partnerRepository;
        this.reviewRepository = reviewRepository;
    }
    async execute(input) {
        const partner = await this.partnerRepository.findByPublicId(input.partnerPublicId);
        if (!partner) {
            throw new Error(`Partner not found: ${input.partnerPublicId}`);
        }
        return await this.reviewRepository.listByPartnerId(partner.id, input.limit ?? 50, input.offset ?? 0);
    }
}
//# sourceMappingURL=GetPartnerReviewsUseCase.js.map