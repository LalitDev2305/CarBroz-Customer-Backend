import { Coupon, DiscountType, ICouponRepository } from '@carbroz/common';

export interface CreateCouponInput {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountPaise?: number;
  minBookingAmountPaise?: number;
  usageLimit?: number;
  perUserLimit?: number;
  validFrom: Date;
  validUntil: Date;
}

export class CreateCouponUseCase {
  constructor(private readonly couponRepository: ICouponRepository) {}

  async execute(input: CreateCouponInput): Promise<Coupon> {
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
