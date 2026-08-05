export class PartnerRatingCalculator {
    reviewRepository;
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async recalculatePartnerRating(partnerId) {
        const stats = await this.reviewRepository.calculatePartnerRatingStats(partnerId);
        await this.reviewRepository.updatePartnerProfileRatingStats(partnerId, stats);
        return stats;
    }
}
//# sourceMappingURL=PartnerRatingCalculator.js.map