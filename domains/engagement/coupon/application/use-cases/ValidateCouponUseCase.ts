import { CouponDiscountCalculator, CouponDiscountResult } from '../../domain/services/CouponDiscountCalculator.js';
import { ICouponRepository } from '../../domain/repositories/ICouponRepository.js';
import { Money } from '@carbroz/foundation-kernel';
/** ValidateCouponInput is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ValidateCouponInput {
  code: string;
  userId: number;
  bookingAmountPaise: number;
}

/** ValidateCouponUseCase is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export class ValidateCouponUseCase {
  constructor(
    private readonly couponRepository: ICouponRepository,
    private readonly discountCalculator: CouponDiscountCalculator
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
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
