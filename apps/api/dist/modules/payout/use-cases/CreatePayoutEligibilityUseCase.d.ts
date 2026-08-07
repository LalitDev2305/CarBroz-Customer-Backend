import { IBookingRepository, IPartnerPayoutRepository, PartnerPayout } from '@carbroz/foundation-kernel';
export declare class CreatePayoutEligibilityUseCase {
    private readonly payoutRepository;
    private readonly bookingRepository;
    private readonly taxCalculator;
    constructor(payoutRepository: IPartnerPayoutRepository, bookingRepository: IBookingRepository, taxCalculator?: any);
    execute(bookingId: number): Promise<PartnerPayout>;
}
