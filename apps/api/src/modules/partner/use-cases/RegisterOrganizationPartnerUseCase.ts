import { IUseCase, IRequestContext, IPartnerRepository, IPartnerMemberRepository, PartnerType, PartnerStatus, PartnerMemberRole, PartnerMemberStatus, ITransactionProvider } from '@carbroz/common';
import { RegisterOrganizationPartnerDto } from '../dtos/partner.dto.js';

export class RegisterOrganizationPartnerUseCase implements IUseCase<{ context: IRequestContext, data: RegisterOrganizationPartnerDto }, any> {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
    private readonly transactionProvider: ITransactionProvider
  ) {}

  public async execute({ context, data }: { context: IRequestContext, data: RegisterOrganizationPartnerDto }): Promise<any> {
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
        type: PartnerType.ORGANIZATION,
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
