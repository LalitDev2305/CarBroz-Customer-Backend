import { DomainError } from "@carbroz/foundation-kernel";
import type { ExecutionContext, IUseCase } from "@carbroz/foundation-kernel";
import type { KycDocument } from "../../kyc/domain/KycDocument.js";
import type { IKycDocumentRepository } from "../../kyc/domain/repositories/IKycDocumentRepository.js";
import type { IPartnerMemberRepository } from "../../domain/repositories/IPartnerMemberRepository.js";
import type { IPartnerRepository } from "../../domain/repositories/IPartnerRepository.js";

export interface GetPartnerKycStatusInput {
  context: ExecutionContext;
  data: { partnerPublicId: string };
}

export class GetPartnerKycStatusUseCase implements IUseCase<
  GetPartnerKycStatusInput,
  KycDocument[]
> {
  constructor(
    private readonly kycDocumentRepository: IKycDocumentRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute({
    context,
    data,
  }: GetPartnerKycStatusInput): Promise<KycDocument[]> {
    const userId = Number(context.actor?.id);
    if (!Number.isInteger(userId) || userId <= 0)
      throw new DomainError("UNAUTHORIZED: User must be logged in");

    const partner = await this.partnerRepository.findByPublicId(
      data.partnerPublicId,
    );
    if (!partner)
      throw new DomainError("NOT_FOUND: Partner not found or unauthorized");

    const membership =
      await this.partnerMemberRepository.findByUserIdAndPartnerId(
        userId,
        partner.id,
      );
    if (!membership || membership.status !== "ACTIVE")
      throw new DomainError("NOT_FOUND: Partner not found or unauthorized");

    return this.kycDocumentRepository.findByPartnerId(partner.id);
  }
}
