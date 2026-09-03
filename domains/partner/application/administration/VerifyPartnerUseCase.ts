import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type IPartnerRepository } from '../../profile/domain/repositories/IPartnerRepository.js';
import { PartnerStatus } from '../../profile/domain/PartnerStatus.js';

export interface VerifyPartnerDto {
  status: 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
}

export class VerifyPartnerUseCase implements IUseCase<{ context: IRequestContext, data: VerifyPartnerDto & { partnerId: string } }, any> {
  constructor(
    private readonly partnerRepository: IPartnerRepository
  ) {}

  public async execute({ data }: { context: IRequestContext, data: VerifyPartnerDto & { partnerId: string } }): Promise<any> {
    const partner = await this.partnerRepository.findByPublicId(data.partnerId);
    if (!partner) {
      throw new Error("Partner not found");
    }

    partner.status = data.status as PartnerStatus;
    const updated = await this.partnerRepository.save(partner);

    return updated;
  }
}
