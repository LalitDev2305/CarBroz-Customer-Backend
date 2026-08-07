import { Money, } from '@carbroz/foundation-kernel';
export class ValidateCouponUseCase {
    couponRepository;
    discountCalculator;
    constructor(couponRepository, discountCalculator) {
        this.couponRepository = couponRepository;
        this.discountCalculator = discountCalculator;
    }
    async execute(input) {
        const coupon = await this.couponRepository.findByCode(input.code);
        if (!coupon) {
            return {
                isValid: false,
                reason: `Invalid coupon code: ${input.code.toUpperCase()}`,
                discountMoney: Money.zero(),
                finalPriceMoney: Money.fromPaise(input.bookingAmountPaise),
            };
        }
        return await this.discountCalculator.calculateDiscount({
            coupon,
            userId: input.userId,
            bookingAmountPaise: input.bookingAmountPaise,
        });
    }
}
//# sourceMappingURL=ValidateCouponUseCase.js.map