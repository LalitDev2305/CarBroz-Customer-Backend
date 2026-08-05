import { Money } from '../../value-objects/Money.js';
export class CouponDiscountCalculator {
    couponUsageRepository;
    constructor(couponUsageRepository) {
        this.couponUsageRepository = couponUsageRepository;
    }
    async calculateDiscount(input) {
        const { coupon, userId, bookingAmountPaise, now = new Date() } = input;
        const bookingMoney = Money.fromPaise(bookingAmountPaise);
        if (!coupon.isActive) {
            return {
                isValid: false,
                reason: 'Coupon is inactive',
                discountMoney: Money.zero(),
                finalPriceMoney: bookingMoney,
            };
        }
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return {
                isValid: false,
                reason: 'Coupon is expired or not yet valid',
                discountMoney: Money.zero(),
                finalPriceMoney: bookingMoney,
            };
        }
        if (bookingAmountPaise < coupon.minBookingAmountPaise) {
            return {
                isValid: false,
                reason: `Minimum booking amount required is ₹${coupon.minBookingAmountPaise / 100}`,
                discountMoney: Money.zero(),
                finalPriceMoney: bookingMoney,
            };
        }
        if (coupon.usageLimit !== null && coupon.currentUsageCount >= coupon.usageLimit) {
            return {
                isValid: false,
                reason: 'Coupon total usage limit reached',
                discountMoney: Money.zero(),
                finalPriceMoney: bookingMoney,
            };
        }
        const userUsageCount = await this.couponUsageRepository.countByUserAndCoupon(userId, coupon.id);
        if (userUsageCount >= coupon.perUserLimit) {
            return {
                isValid: false,
                reason: 'Per-user coupon usage limit exceeded',
                discountMoney: Money.zero(),
                finalPriceMoney: bookingMoney,
            };
        }
        let rawDiscountPaise = 0;
        if (coupon.discountType === 'FIXED_AMOUNT') {
            rawDiscountPaise = coupon.discountValue;
        }
        else if (coupon.discountType === 'PERCENTAGE') {
            rawDiscountPaise = Math.floor((bookingAmountPaise * coupon.discountValue) / 100);
        }
        if (coupon.maxDiscountPaise !== null && rawDiscountPaise > coupon.maxDiscountPaise) {
            rawDiscountPaise = coupon.maxDiscountPaise;
        }
        if (rawDiscountPaise > bookingAmountPaise) {
            rawDiscountPaise = bookingAmountPaise;
        }
        const discountMoney = Money.fromPaise(rawDiscountPaise);
        const finalPriceMoney = bookingMoney.subtract(discountMoney);
        return {
            isValid: true,
            discountMoney,
            finalPriceMoney,
        };
    }
}
//# sourceMappingURL=CouponDiscountCalculator.js.map