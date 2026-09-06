import { DomainError } from "@carbroz/foundation-kernel";
import { IPartnerRepository } from "@carbroz/domain-partner";
import { IReviewRepository } from "../../domain/repositories/IReviewRepository.js";
import { Review } from "../../domain/Review.js";
/** GetPartnerReviewsInput is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export interface GetPartnerReviewsInput {
  partnerPublicId: string;
  limit?: number;
  offset?: number;
}

/** GetPartnerReviewsUseCase is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export class GetPartnerReviewsUseCase {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly reviewRepository: IReviewRepository,
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(input: GetPartnerReviewsInput): Promise<Review[]> {
    const partner = await this.partnerRepository.findByPublicId(
      input.partnerPublicId,
    );
    if (!partner) {
      throw new DomainError(`Partner not found: ${input.partnerPublicId}`);
    }

    return await this.reviewRepository.listByPartnerId(
      partner.id!,
      input.limit ?? 50,
      input.offset ?? 0,
    );
  }
}
