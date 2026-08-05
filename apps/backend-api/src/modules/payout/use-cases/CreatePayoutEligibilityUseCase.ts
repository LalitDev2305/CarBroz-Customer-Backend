import {
  IBookingRepository,
  IPartnerPayoutRepository,
  Money,
  PartnerPayout,
  PayoutCalculation,
  TaxCalculator,
} from '@carbroz/common';

export class CreatePayoutEligibilityUseCase {
  constructor(
    private readonly payoutRepository: IPartnerPayoutRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly taxCalculator = new TaxCalculator()
  ) {}

  async execute(bookingId: number): Promise<PartnerPayout> {
    const existing = await this.payoutRepository.findByBookingId(bookingId);
    if (existing) {
      return existing; // Idempotent
    }

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking || booking.status !== 'COMPLETED' || !booking.partnerId) {
      throw new Error('Payout eligibility requires a COMPLETED booking with an assigned partner');
    }

    const grossMoney = Money.fromPaise(booking.totalPricePaise, 'INR');
    const calculation = this.taxCalculator.calculatePartnerPayout(grossMoney);

    const calculationJson: PayoutCalculation = {
      grossAmountPaise: calculation.grossAmount.amountPaise,
      commissionPercentage: calculation.commissionPercentage,
      commissionPaise: calculation.commission.amountPaise,
      tdsPercentage: calculation.tdsPercentage,
      tdsPaise: calculation.tds.amountPaise,
      netPayoutPaise: calculation.netPayout.amountPaise,
      appliedRules: calculation.appliedRules,
    };

    const payout = new PartnerPayout({
      bookingId,
      partnerId: booking.partnerId,
      status: 'SCHEDULED',
      grossAmountPaise: calculation.grossAmount.amountPaise,
      commissionPaise: calculation.commission.amountPaise,
      tdsPaise: calculation.tds.amountPaise,
      netPayoutPaise: calculation.netPayout.amountPaise,
      calculationJson,
    });

    return await this.payoutRepository.create(payout);
  }
}
