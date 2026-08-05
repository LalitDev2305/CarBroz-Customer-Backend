import { Coupon } from '@carbroz/common';
export class CreateCouponUseCase {
    couponRepository;
    constructor(couponRepository) {
        this.couponRepository = couponRepository;
    }
    async execute(input) {
        const formattedCode = input.code.trim().toUpperCase();
        const existing = await this.couponRepository.findByCode(formattedCode);
        if (existing) {
            throw new Error(`Coupon with code ${formattedCode} already exists`);
        }
        const coupon = new Coupon({
            code: formattedCode,
            description: input.description,
            discountType: input.discountType,
            discountValue: input.discountValue,
            maxDiscountPaise: input.maxDiscountPaise,
            minBookingAmountPaise: input.minBookingAmountPaise,
            usageLimit: input.usageLimit,
            perUserLimit: input.perUserLimit,
            validFrom: input.validFrom,
            validUntil: input.validUntil,
            isActive: true,
        });
        return await this.couponRepository.create(coupon);
    }
}
//# sourceMappingURL=CreateCouponUseCase.js.map