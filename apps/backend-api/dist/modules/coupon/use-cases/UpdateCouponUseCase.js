export class UpdateCouponUseCase {
    couponRepository;
    constructor(couponRepository) {
        this.couponRepository = couponRepository;
    }
    async execute(input) {
        const coupon = await this.couponRepository.findByPublicId(input.publicId);
        if (!coupon) {
            throw new Error(`Coupon not found: ${input.publicId}`);
        }
        if (input.description !== undefined)
            coupon.description = input.description;
        if (input.discountType !== undefined)
            coupon.discountType = input.discountType;
        if (input.discountValue !== undefined)
            coupon.discountValue = input.discountValue;
        if (input.maxDiscountPaise !== undefined)
            coupon.maxDiscountPaise = input.maxDiscountPaise;
        if (input.minBookingAmountPaise !== undefined)
            coupon.minBookingAmountPaise = input.minBookingAmountPaise;
        if (input.usageLimit !== undefined)
            coupon.usageLimit = input.usageLimit;
        if (input.perUserLimit !== undefined)
            coupon.perUserLimit = input.perUserLimit;
        if (input.validFrom !== undefined)
            coupon.validFrom = input.validFrom;
        if (input.validUntil !== undefined)
            coupon.validUntil = input.validUntil;
        if (input.isActive !== undefined)
            coupon.isActive = input.isActive;
        return await this.couponRepository.update(coupon);
    }
}
//# sourceMappingURL=UpdateCouponUseCase.js.map