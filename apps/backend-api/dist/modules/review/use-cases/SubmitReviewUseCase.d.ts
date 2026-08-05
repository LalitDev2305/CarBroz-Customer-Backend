import { IBookingRepository, IReviewRepository, PartnerRatingCalculator, Review } from '@carbroz/common';
export interface SubmitReviewInput {
    bookingPublicId: string;
    customerUserId: number;
    rating: number;
    comment?: string;
}
export declare class SubmitReviewUseCase {
    private readonly reviewRepository;
    private readonly bookingRepository;
    private readonly partnerRatingCalculator;
    constructor(reviewRepository: IReviewRepository, bookingRepository: IBookingRepository, partnerRatingCalculator: PartnerRatingCalculator);
    execute(input: SubmitReviewInput): Promise<Review>;
}
