export class ModerateReviewUseCase {
    reviewRepository;
    partnerRatingCalculator;
    constructor(reviewRepository, partnerRatingCalculator) {
        this.reviewRepository = reviewRepository;
        this.partnerRatingCalculator = partnerRatingCalculator;
    }
    async execute(input) {
        const review = await this.reviewRepository.findByPublicId(input.reviewPublicId);
        if (!review) {
            throw new Error(`Review not found: ${input.reviewPublicId}`);
        }
        review.moderate(input.status, input.moderationReason);
        const updatedReview = await this.reviewRepository.update(review);
        // Atomically recalculate partner rating statistics
        await this.partnerRatingCalculator.recalculatePartnerRating(review.partnerId);
        return updatedReview;
    }
}
//# sourceMappingURL=ModerateReviewUseCase.js.map