import {
  CouponDiscountCalculator,
  CouponDiscountResult,
  ICouponRepository,
  Money,
} from '@carbroz/common';

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
        finalPriceMoney: Money.fromMinor(input.bookingAmountPaise),
      };
    }

    return await this.discountCalculator.calculateDiscount({
      coupon,
      userId: input.userId,
      bookingAmountPaise: input.bookingAmountPaise,
    });
  }
}
