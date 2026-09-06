import { DomainError } from "@carbroz/foundation-kernel";
import type {
  ExecutionContext,
  ITransactionProvider,
  IUseCase,
} from "@carbroz/foundation-kernel";
import type { Partner } from "../../domain/Partner.js";
import type { PartnerMember } from "../../domain/PartnerMember.js";
import { PartnerType } from "../../domain/PartnerType.js";
import { PartnerStatus } from "../../domain/PartnerStatus.js";
import { PartnerMemberRole } from "../../domain/PartnerMemberRole.js";
import { PartnerMemberStatus } from "../../domain/PartnerMemberStatus.js";
import type { IPartnerRepository } from "../../domain/repositories/IPartnerRepository.js";
import type { IPartnerMemberRepository } from "../../domain/repositories/IPartnerMemberRepository.js";

export interface RegisterIndividualPartnerInput {
  context: ExecutionContext;
  data: { businessName: string };
}
export interface RegisterPartnerResult {
  partner: Partner;
  member: PartnerMember;
}

function actorUserId(context: ExecutionContext): number {
  const id = Number(context.actor?.id);
  if (!Number.isInteger(id) || id <= 0) throw new DomainError("Unauthorized");
  return id;
}

export class RegisterIndividualPartnerUseCase implements IUseCase<
  RegisterIndividualPartnerInput,
  RegisterPartnerResult
> {
  constructor(
    private readonly partnerRepository: IPartnerRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
    private readonly transactionProvider: ITransactionProvider,
  ) {}

  async execute({
    context,
    data,
  }: RegisterIndividualPartnerInput): Promise<RegisterPartnerResult> {
    const userId = actorUserId(context);
    const existingMembership =
      await this.partnerMemberRepository.findByUserId(userId);
    if (existingMembership.length > 0)
      throw new DomainError("User is already associated with a partner");

    return this.transactionProvider.runInTransaction(async (transaction) => {
      this.partnerRepository.setUnitOfWork(transaction);
      this.partnerMemberRepository.setUnitOfWork(transaction);
      const partner = await this.partnerRepository.create({
        businessName: data.businessName,
        type: PartnerType.INDIVIDUAL,
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
