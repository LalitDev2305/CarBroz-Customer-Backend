import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type IPartnerRepository } from '../../profile/domain/repositories/IPartnerRepository.js';
import { type IPartnerMemberRepository } from '../../profile/domain/repositories/IPartnerMemberRepository.js';

export class GetPartnerProfileUseCase implements IUseCase<{ context: IRequestContext }, any> {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository
  ) {}

  public async execute({ context }: { context: IRequestContext }): Promise<any> {
    if (!context.authenticatedUser) {
      throw new Error("Unauthorized");
    }

    const userId = (context.authenticatedUser as any).id;
    const memberships = await this.partnerMemberRepository.findByUserId(userId);
    if (memberships.length === 0) {
      throw new Error("Partner profile not found");
    }

    // For Phase 8, we assume the user belongs to only 1 partner.
    const primaryMembership = memberships[0];
    if (!primaryMembership) {
      throw new Error("Partner profile not found");
    }
    const partner = await this.partnerRepository.findById(primaryMembership.partnerId);

    return {
      partner,
      membership: primaryMembership
    };
  }
}
