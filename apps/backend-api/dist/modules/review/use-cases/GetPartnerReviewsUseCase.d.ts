import { IPartnerRepository, IReviewRepository, Review } from '@carbroz/common';
export interface GetPartnerReviewsInput {
    partnerPublicId: string;
    limit?: number;
    offset?: number;
}
export declare class GetPartnerReviewsUseCase {
    private readonly partnerRepository;
    private readonly reviewRepository;
    constructor(partnerRepository: IPartnerRepository, reviewRepository: IReviewRepository);
    execute(input: GetPartnerReviewsInput): Promise<Review[]>;
}
