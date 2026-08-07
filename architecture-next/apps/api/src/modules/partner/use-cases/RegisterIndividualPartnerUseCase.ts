import { IUseCase, IRequestContext, IPartnerRepository, IPartnerMemberRepository, PartnerType, PartnerStatus, PartnerMemberRole, PartnerMemberStatus, ITransactionProvider } from '@carbroz/common';
import { RegisterIndividualPartnerDto } from '../dtos/partner.dto.js';

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
