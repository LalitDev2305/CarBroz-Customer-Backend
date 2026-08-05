import { IBookingRepository, IPartnerPayoutRepository, PartnerPayout, TaxCalculator } from '@carbroz/common';
export declare class CreatePayoutEligibilityUseCase {
    private readonly payoutRepository;
    private readonly bookingRepository;
    private readonly taxCalculator;
    constructor(payoutRepository: IPartnerPayoutRepository, bookingRepository: IBookingRepository, taxCalculator?: TaxCalculator);
    execute(bookingId: number): Promise<PartnerPayout>;
}
