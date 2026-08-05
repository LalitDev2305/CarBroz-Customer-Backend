import { IReviewRepository, PartnerRatingCalculator, Review, ReviewStatus } from '@carbroz/common';
export interface ModerateReviewInput {
    reviewPublicId: string;
    status: ReviewStatus;
    moderationReason?: string;
}
export declare class ModerateReviewUseCase {
    private readonly reviewRepository;
    private readonly partnerRatingCalculator;
    constructor(reviewRepository: IReviewRepository, partnerRatingCalculator: PartnerRatingCalculator);
    execute(input: ModerateReviewInput): Promise<Review>;
}
