import { IUseCase, IRequestContext, IPartnerRepository, PartnerStatus } from '@carbroz/common';
import { VerifyPartnerDto } from '../dtos/partner.dto.js';

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
