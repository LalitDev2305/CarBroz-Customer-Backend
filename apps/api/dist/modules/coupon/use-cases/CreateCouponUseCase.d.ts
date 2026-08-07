import { Coupon, DiscountType, ICouponRepository } from '@carbroz/foundation-kernel';
export interface CreateCouponInput {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    maxDiscountPaise?: number;
    minBookingAmountPaise?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom: Date;
    validUntil: Date;
}
export declare class CreateCouponUseCase {
    private readonly couponRepository;
    constructor(couponRepository: ICouponRepository);
    execute(input: CreateCouponInput): Promise<Coupon>;
}
