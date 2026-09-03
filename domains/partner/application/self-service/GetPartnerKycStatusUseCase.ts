import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type IKycDocumentRepository } from '../../kyc/domain/repositories/IKycDocumentRepository.js';
import { type IPartnerMemberRepository } from '../../profile/domain/repositories/IPartnerMemberRepository.js';
import { type KycDocument } from '../../kyc/domain/KycDocument.js';

export interface GetPartnerKycStatusInput {
  context: IRequestContext;
  data: {
    partnerId: number;
  }
}

export class GetPartnerKycStatusUseCase implements IUseCase<GetPartnerKycStatusInput, KycDocument[]> {
  constructor(
    private readonly kycDocumentRepository: IKycDocumentRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository
  ) {}

  async execute(request: GetPartnerKycStatusInput): Promise<KycDocument[]> {
    const userId = request.context.authenticatedUser?.id as number;
    if (!userId) {
      throw new Error('UNAUTHORIZED: User must be logged in');
    }

    // Verify user is a member of the partner
    const membership = await this.partnerMemberRepository.findByUserIdAndPartnerId(userId, request.data.partnerId);
    if (!membership) {
      throw new Error('FORBIDDEN: You do not have access to this partner profile');
    }

    return await this.kycDocumentRepository.findByPartnerId(request.data.partnerId);
  }
}
