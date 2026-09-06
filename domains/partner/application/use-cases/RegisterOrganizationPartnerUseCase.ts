import type { ExecutionContext, ITransactionProvider, IUseCase } from '@carbroz/foundation-kernel';
import type { Partner } from '../../domain/Partner.js';
import type { PartnerMember } from '../../domain/PartnerMember.js';
import { PartnerType } from '../../domain/PartnerType.js';
import { PartnerStatus } from '../../domain/PartnerStatus.js';
import { PartnerMemberRole } from '../../domain/PartnerMemberRole.js';
import { PartnerMemberStatus } from '../../domain/PartnerMemberStatus.js';
import type { IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';
import type { IPartnerMemberRepository } from '../../domain/repositories/IPartnerMemberRepository.js';

export interface RegisterOrganizationPartnerInput {
  context: ExecutionContext;
  data: { businessName: string };
}
export interface RegisterOrganizationPartnerResult { partner: Partner; member: PartnerMember }

export class RegisterOrganizationPartnerUseCase implements IUseCase<RegisterOrganizationPartnerInput, RegisterOrganizationPartnerResult> {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
    private readonly transactionProvider: ITransactionProvider,
  ) {}

  async execute({ context, data }: RegisterOrganizationPartnerInput): Promise<RegisterOrganizationPartnerResult> {
    const userId = Number(context.actor?.id);
    if (!Number.isInteger(userId) || userId <= 0) throw new Error('Unauthorized');
    const existingMembership = await this.partnerMemberRepository.findByUserId(userId);
    if (existingMembership.length > 0) throw new Error('User is already associated with a partner');

    return this.transactionProvider.runInTransaction(async (transaction) => {
      this.partnerRepository.setUnitOfWork(transaction);
      this.partnerMemberRepository.setUnitOfWork(transaction);
      const partner = await this.partnerRepository.create({
        businessName: data.businessName,
        type: PartnerType.ORGANIZATION,
        status: PartnerStatus.PENDING,
      });
      const member = await this.partnerMemberRepository.create({
        userId,
        partnerId: partner.id,
        role: PartnerMemberRole.OWNER,
        status: PartnerMemberStatus.ACTIVE,
      });
      return { partner, member };
    });
  }
}
