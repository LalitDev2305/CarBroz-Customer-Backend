import { IReviewRepository, PartnerRatingStats } from '../repositories/IReviewRepository.js';

export class PartnerRatingCalculator {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async recalculatePartnerRating(partnerId: number): Promise<PartnerRatingStats> {
    const stats = await this.reviewRepository.calculatePartnerRatingStats(partnerId);
    await this.reviewRepository.updatePartnerProfileRatingStats(partnerId, stats);
    return stats;
  }
}
