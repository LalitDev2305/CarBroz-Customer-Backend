import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { Partner } from '../../domain/Partner.js';
import type { PartnerMember } from '../../domain/PartnerMember.js';
import type { IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';
import type { IPartnerMemberRepository } from '../../domain/repositories/IPartnerMemberRepository.js';

export interface GetPartnerProfileInput { context: ExecutionContext }
export interface PartnerProfileResult { partner: Partner | null; membership: PartnerMember }

export class GetPartnerProfileUseCase implements IUseCase<GetPartnerProfileInput, PartnerProfileResult> {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
  ) {}

  async execute({ context }: GetPartnerProfileInput): Promise<PartnerProfileResult> {
    const userId = Number(context.actor?.id);
    if (!Number.isInteger(userId) || userId <= 0) throw new Error('Unauthorized');
    const memberships = await this.partnerMemberRepository.findByUserId(userId);
    const primaryMembership = memberships[0];
    if (!primaryMembership) throw new Error('Partner profile not found');
    const partner = await this.partnerRepository.findById(primaryMembership.partnerId);
    return { partner, membership: primaryMembership };
  }
}
