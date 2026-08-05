import { CouponDiscountCalculator, CouponUsage, IBookingRepository, ICouponRepository, ICouponUsageRepository } from '@carbroz/common';
export interface ApplyCouponInput {
    code: string;
    userId: number;
    bookingPublicId: string;
}
export declare class ApplyCouponUseCase {
    private readonly couponRepository;
    private readonly couponUsageRepository;
    private readonly bookingRepository;
    private readonly discountCalculator;
    constructor(couponRepository: ICouponRepository, couponUsageRepository: ICouponUsageRepository, bookingRepository: IBookingRepository, discountCalculator: CouponDiscountCalculator);
    execute(input: ApplyCouponInput): Promise<CouponUsage>;
}
