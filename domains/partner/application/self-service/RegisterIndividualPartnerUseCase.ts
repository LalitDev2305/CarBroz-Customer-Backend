import { type IUseCase, type IRequestContext, type ITransactionProvider } from '@carbroz/foundation-kernel';
import { type IPartnerRepository } from '../../profile/domain/repositories/IPartnerRepository.js';
import { type IPartnerMemberRepository } from '../../profile/domain/repositories/IPartnerMemberRepository.js';
import { PartnerType } from '../../profile/domain/PartnerType.js';
import { PartnerStatus } from '../../profile/domain/PartnerStatus.js';
import { PartnerMemberRole } from '../../profile/domain/PartnerMemberRole.js';
import { PartnerMemberStatus } from '../../profile/domain/PartnerMemberStatus.js';

export interface RegisterIndividualPartnerDto {
  businessName: string;
}

export class RegisterIndividualPartnerUseCase implements IUseCase<{ context: IRequestContext, data: RegisterIndividualPartnerDto }, any> {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
    private readonly transactionProvider: ITransactionProvider
  ) {}

  public async execute({ context, data }: { context: IRequestContext, data: RegisterIndividualPartnerDto }): Promise<any> {
    if (!context.authenticatedUser) {
      throw new Error("Unauthorized");
    }

    const userId = (context.authenticatedUser as any).id;
    const existingMembership = await this.partnerMemberRepository.findByUserId(userId);
    if (existingMembership.length > 0) {
      throw new Error("User is already associated with a partner");
    }

    return this.transactionProvider.runInTransaction(async (uow: any) => {
      this.partnerRepository.setUnitOfWork(uow);
      this.partnerMemberRepository.setUnitOfWork(uow);

      const partner = await this.partnerRepository.create({
        businessName: data.businessName,
        type: PartnerType.INDIVIDUAL,
        status: PartnerStatus.PENDING
      });

      const partnerMember = await this.partnerMemberRepository.create({
        userId,
        partnerId: partner.id,
        role: PartnerMemberRole.OWNER,
        status: PartnerMemberStatus.ACTIVE
      });

      return { partner, member: partnerMember };
    });
  }
}
