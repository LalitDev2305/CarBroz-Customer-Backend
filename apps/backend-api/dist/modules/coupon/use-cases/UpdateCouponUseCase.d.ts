import { Coupon, DiscountType, ICouponRepository } from '@carbroz/common';
export interface UpdateCouponInput {
    publicId: string;
    description?: string;
    discountType?: DiscountType;
    discountValue?: number;
    maxDiscountPaise?: number | null;
    minBookingAmountPaise?: number;
    usageLimit?: number | null;
    perUserLimit?: number;
    validFrom?: Date;
    validUntil?: Date;
    isActive?: boolean;
}
export declare class UpdateCouponUseCase {
    private readonly couponRepository;
    constructor(couponRepository: ICouponRepository);
    execute(input: UpdateCouponInput): Promise<Coupon>;
}
