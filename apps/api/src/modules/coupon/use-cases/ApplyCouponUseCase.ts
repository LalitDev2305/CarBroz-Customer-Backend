import {
  CouponDiscountCalculator,
  CouponUsage,
  IBookingRepository,
  ICouponRepository,
  ICouponUsageRepository,
} from '@carbroz/common';

export interface ApplyCouponInput {
  code: string;
  userId: number;
  bookingPublicId: string;
}

export class ApplyCouponUseCase {
  constructor(
    private readonly couponRepository: ICouponRepository,
    private readonly couponUsageRepository: ICouponUsageRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly discountCalculator: CouponDiscountCalculator
  ) {}

  async execute(input: ApplyCouponInput): Promise<CouponUsage> {
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) {
      throw new Error(`Booking not found: ${input.bookingPublicId}`);
    }

    const coupon = await this.couponRepository.findByCode(input.code);
    if (!coupon) {
      throw new Error(`Invalid coupon code: ${input.code.toUpperCase()}`);
    }

    const existingUsage = await this.couponUsageRepository.findByCouponAndBooking(coupon.id!, booking.id!);
    if (existingUsage) {
      return existingUsage;
    }

    const calculation = await this.discountCalculator.calculateDiscount({
      coupon,
      userId: input.userId,
      bookingAmountPaise: booking.totalPricePaise,
    });

    if (!calculation.isValid) {
      throw new Error(`Cannot apply coupon: ${calculation.reason}`);
    }

    const usage = new CouponUsage({
      couponId: coupon.id!,
      userId: input.userId,
      bookingId: booking.id!,
      discountAmountPaise: calculation.discountMoney.amountPaise,
    });

    const createdUsage = await this.couponUsageRepository.create(usage);
    await this.couponRepository.incrementUsage(coupon.id!);

    return createdUsage;
  }
}
