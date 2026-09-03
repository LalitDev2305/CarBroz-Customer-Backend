import { type IPartnerPayoutRepository } from '../../payout/domain/repositories/IPartnerPayoutRepository.js';
import { PartnerPayout } from '../../payout/domain/PartnerPayout.js';
import { type PayoutStatus } from '../../payout/domain/PayoutStatus.js';

export class ListPartnerPayoutsUseCase {
  constructor(private readonly payoutRepository: IPartnerPayoutRepository) {}

  async execute(partnerId: number, status?: PayoutStatus): Promise<PartnerPayout[]> {
    return await this.payoutRepository.listByPartnerId(partnerId, status);
  }
}
