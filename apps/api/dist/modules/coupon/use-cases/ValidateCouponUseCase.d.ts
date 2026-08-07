import { CouponDiscountCalculator, CouponDiscountResult, ICouponRepository } from '@carbroz/foundation-kernel';
export interface ValidateCouponInput {
    code: string;
    userId: number;
    bookingAmountPaise: number;
}
export declare class ValidateCouponUseCase {
    private readonly couponRepository;
    private readonly discountCalculator;
    constructor(couponRepository: ICouponRepository, discountCalculator: CouponDiscountCalculator);
    execute(input: ValidateCouponInput): Promise<CouponDiscountResult>;
}
