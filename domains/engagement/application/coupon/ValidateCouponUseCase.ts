import { CouponDiscountCalculator, type CouponDiscountResult } from '../../coupon/domain/services/CouponDiscountCalculator.js';
import { type ICouponRepository } from '../../coupon/domain/repositories/ICouponRepository.js';
import { Money } from '@carbroz/foundation-kernel';

export interface ValidateCouponInput {
  code: string;
  userId: number;
  bookingAmountPaise: number;
}

export class ValidateCouponUseCase {
  constructor(
    private readonly couponRepository: ICouponRepository,
    private readonly discountCalculator: CouponDiscountCalculator
  ) {}

  async execute(input: ValidateCouponInput): Promise<CouponDiscountResult> {
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
