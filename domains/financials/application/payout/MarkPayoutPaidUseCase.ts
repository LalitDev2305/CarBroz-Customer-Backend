import { type IPartnerPayoutRepository } from '../../payout/domain/repositories/IPartnerPayoutRepository.js';
import { PartnerPayout } from '../../payout/domain/PartnerPayout.js';

export interface MarkPayoutPaidInput {
  publicId: string;
  externalReference: string;
}

export class MarkPayoutPaidUseCase {
  constructor(private readonly payoutRepository: IPartnerPayoutRepository) {}

  async execute(input: MarkPayoutPaidInput): Promise<PartnerPayout> {
    if (!input.externalReference || input.externalReference.trim().length === 0) {
      throw new Error('External reference is required to mark payout as paid');
    }

    const payout = await this.payoutRepository.findByPublicId(input.publicId);
    if (!payout) {
      throw new Error('Partner payout record not found');
    }

    payout.markPaid(input.externalReference);
    return await this.payoutRepository.update(payout);
  }
}
