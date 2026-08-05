import { IPartnerRepository, IReviewRepository, Review } from '@carbroz/common';

export interface GetPartnerReviewsInput {
  partnerPublicId: string;
  limit?: number;
  offset?: number;
}

export class GetPartnerReviewsUseCase {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly reviewRepository: IReviewRepository
  ) {}

  async execute(input: GetPartnerReviewsInput): Promise<Review[]> {
    const partner = await this.partnerRepository.findByPublicId(input.partnerPublicId);
    if (!partner) {
      throw new Error(`Partner not found: ${input.partnerPublicId}`);
    }

    return await this.reviewRepository.listByPartnerId(partner.id!, input.limit ?? 50, input.offset ?? 0);
  }
}
