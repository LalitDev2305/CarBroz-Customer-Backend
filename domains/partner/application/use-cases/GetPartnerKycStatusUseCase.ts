import { DomainError } from "@carbroz/foundation-kernel";
import type { ExecutionContext, IUseCase } from "@carbroz/foundation-kernel";
import type { KycDocument } from "../../kyc/domain/KycDocument.js";
import type { IKycDocumentRepository } from "../../kyc/domain/repositories/IKycDocumentRepository.js";
import type { IPartnerMemberRepository } from "../../domain/repositories/IPartnerMemberRepository.js";

export interface GetPartnerKycStatusInput {
  context: ExecutionContext;
  data: { partnerId: number };
}

export class GetPartnerKycStatusUseCase implements IUseCase<
  GetPartnerKycStatusInput,
  KycDocument[]
> {
  constructor(
    private readonly kycDocumentRepository: IKycDocumentRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
  ) {}

  async execute({
    context,
    data,
  }: GetPartnerKycStatusInput): Promise<KycDocument[]> {
    const userId = Number(context.actor?.id);
    if (!Number.isInteger(userId) || userId <= 0)
      throw new DomainError("UNAUTHORIZED: User must be logged in");
    const membership =
      await this.partnerMemberRepository.findByUserIdAndPartnerId(
        userId,
        data.partnerId,
      );
    if (!membership)
      throw new DomainError(
        "FORBIDDEN: You do not have access to this partner profile",
      );
    return this.kycDocumentRepository.findByPartnerId(data.partnerId);
  }
}
