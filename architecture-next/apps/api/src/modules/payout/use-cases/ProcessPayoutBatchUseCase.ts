import { IPartnerPayoutRepository } from '@carbroz/common';

export class ProcessPayoutBatchUseCase {
  constructor(private readonly payoutRepository: IPartnerPayoutRepository) {}

  async execute(): Promise<number> {
    const scheduledPayouts = await this.payoutRepository.listByStatus('SCHEDULED', 100);

    let count = 0;
    for (const payout of scheduledPayouts) {
      payout.approve();
      payout.markProcessing();
      await this.payoutRepository.update(payout);
      count++;
    }

    return count;
  }
}
