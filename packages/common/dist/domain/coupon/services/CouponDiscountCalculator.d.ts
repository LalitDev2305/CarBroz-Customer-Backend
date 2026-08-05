import { Coupon } from '../Coupon.js';
import { ICouponUsageRepository } from '../repositories/ICouponUsageRepository.js';
import { Money } from '../../value-objects/Money.js';
export interface CalculateDiscountInput {
    coupon: Coupon;
    userId: number;
    bookingAmountPaise: number;
    now?: Date;
}
export interface CouponDiscountResult {
    isValid: boolean;
    reason?: string;
    discountMoney: Money;
    finalPriceMoney: Money;
}
export declare class CouponDiscountCalculator {
    private readonly couponUsageRepository;
    constructor(couponUsageRepository: ICouponUsageRepository);
    calculateDiscount(input: CalculateDiscountInput): Promise<CouponDiscountResult>;
}
