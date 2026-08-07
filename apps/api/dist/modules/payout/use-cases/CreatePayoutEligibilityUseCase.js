import { Money, PartnerPayout, TaxCalculator, } from '@carbroz/foundation-kernel';
export class CreatePayoutEligibilityUseCase {
    payoutRepository;
    bookingRepository;
    taxCalculator;
    constructor(payoutRepository, bookingRepository, taxCalculator = new TaxCalculator()) {
        this.payoutRepository = payoutRepository;
        this.bookingRepository = bookingRepository;
        this.taxCalculator = taxCalculator;
    }
    async execute(bookingId) {
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
        const calculationJson = {
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
//# sourceMappingURL=CreatePayoutEligibilityUseCase.js.map