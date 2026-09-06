import { IReviewRepository } from '../../domain/repositories/IReviewRepository.js';
import { PartnerRatingCalculator } from '../../domain/services/PartnerRatingCalculator.js';
import { Review } from '../../domain/Review.js';
import { ReviewStatus } from '../../domain/ReviewStatus.js';
/** ModerateReviewInput is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ModerateReviewInput {
  reviewPublicId: string;
  status: ReviewStatus;
  moderationReason?: string;
}

/** ModerateReviewUseCase is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export class ModerateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly partnerRatingCalculator: PartnerRatingCalculator
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
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
