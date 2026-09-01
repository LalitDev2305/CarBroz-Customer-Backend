import { IReviewRepository, PartnerRatingCalculator, Review, ReviewStatus } from '@carbroz/common';

export interface ModerateReviewInput {
  reviewPublicId: string;
  status: ReviewStatus;
  moderationReason?: string;
}

export class ModerateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly partnerRatingCalculator: PartnerRatingCalculator
  ) {}

  async execute(input: ModerateReviewInput): Promise<Review> {
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
