import { DomainError } from "@carbroz/foundation-kernel";
import type { ExecutionContext, IUseCase } from "@carbroz/foundation-kernel";
import type { Partner } from "../../domain/Partner.js";
import { PartnerStatus } from "../../domain/PartnerStatus.js";
import type { IPartnerRepository } from "../../domain/repositories/IPartnerRepository.js";

export interface VerifyPartnerInput {
  context: ExecutionContext;
  data: { partnerId: string; status: PartnerStatus };
}

export class VerifyPartnerUseCase implements IUseCase<
  VerifyPartnerInput,
  Partner
> {
  constructor(private readonly partnerRepository: IPartnerRepository) {}

  async execute({ context, data }: VerifyPartnerInput): Promise<Partner> {
    if (
      context.actor?.kind !== "ADMIN" &&
      !context.actor?.roles.includes("ADMIN")
    )
      throw new DomainError("Forbidden");
    const partner = await this.partnerRepository.findByPublicId(data.partnerId);
    if (!partner) throw new DomainError("Partner not found");
    partner.status = data.status;
    return this.partnerRepository.save(partner);
  }
}
