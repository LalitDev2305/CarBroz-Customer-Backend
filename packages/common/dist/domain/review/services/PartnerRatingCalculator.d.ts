import { IReviewRepository, PartnerRatingStats } from '../repositories/IReviewRepository.js';
export declare class PartnerRatingCalculator {
    private readonly reviewRepository;
    constructor(reviewRepository: IReviewRepository);
    recalculatePartnerRating(partnerId: number): Promise<PartnerRatingStats>;
}
