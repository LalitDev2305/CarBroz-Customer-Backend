import { IPartnerPayoutRepository, PartnerPayout, PayoutStatus } from '@carbroz/common';

export class ListPartnerPayoutsUseCase {
  constructor(private readonly payoutRepository: IPartnerPayoutRepository) {}

  async execute(partnerId: number, status?: PayoutStatus): Promise<PartnerPayout[]> {
    return await this.payoutRepository.listByPartnerId(partnerId, status);
  }
}
