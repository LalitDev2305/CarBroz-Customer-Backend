import { describe, expect, it } from 'vitest';
import { Coupon, type ICouponRepository } from '@carbroz/common';
import { UpdateCouponUseCase } from './UpdateCouponUseCase.js';

class InMemoryCouponRepository implements ICouponRepository {
  constructor(private coupon: Coupon | null) {}

  async create(coupon: Coupon): Promise<Coupon> {
    this.coupon = coupon;
    return coupon;
  }

  async findById(id: number): Promise<Coupon | null> {
    return this.coupon?.id === id ? this.coupon : null;
  }

  async findByPublicId(publicId: string): Promise<Coupon | null> {
    return this.coupon?.publicId === publicId ? this.coupon : null;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.coupon?.code === code ? this.coupon : null;
  }

  async listActive(now = new Date()): Promise<Coupon[]> {
    return this.coupon?.isValidAt(now) ? [this.coupon] : [];
  }

  async update(coupon: Coupon): Promise<Coupon> {
    this.coupon = coupon;
    return coupon;
  }

  async incrementUsage(couponId: number): Promise<void> {
    if (this.coupon?.id === couponId) this.coupon.incrementUsage();
  }
}

function existingCoupon(): Coupon {
  return new Coupon({
    id: 1,
    publicId: 'coupon_public_1',
    code: 'SAVE10',
    description: 'Original description',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxDiscountPaise: 5000,
    minBookingAmountPaise: 10000,
    usageLimit: 100,
    perUserLimit: 1,
    currentUsageCount: 4,
    validFrom: new Date('2026-01-01T00:00:00.000Z'),
    validUntil: new Date('2026-12-31T23:59:59.000Z'),
    isActive: true,
  });
}

describe('UpdateCouponUseCase', () => {
  it('updates every explicitly supplied mutable coupon field, including nullable and false values', async () => {
    const repository = new InMemoryCouponRepository(existingCoupon());
    const useCase = new UpdateCouponUseCase(repository);
    const validFrom = new Date('2026-02-01T00:00:00.000Z');
    const validUntil = new Date('2027-02-01T00:00:00.000Z');

    const updated = await useCase.execute({
      publicId: 'coupon_public_1',
      description: 'Updated description',
      discountType: 'FIXED_AMOUNT',
      discountValue: 2500,
      maxDiscountPaise: null,
      minBookingAmountPaise: 0,
      usageLimit: null,
      perUserLimit: 3,
      validFrom,
      validUntil,
      isActive: false,
    });

    expect(updated).toMatchObject({
      description: 'Updated description',
      discountType: 'FIXED_AMOUNT',
      discountValue: 2500,
      maxDiscountPaise: null,
      minBookingAmountPaise: 0,
      usageLimit: null,
      perUserLimit: 3,
      validFrom,
      validUntil,
      isActive: false,
    });
    expect(await repository.findByPublicId('coupon_public_1')).toBe(updated);
  });

  it('preserves every mutable field when the patch omits it', async () => {
    const coupon = existingCoupon();
    const repository = new InMemoryCouponRepository(coupon);
    const useCase = new UpdateCouponUseCase(repository);
    const before = {
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountPaise: coupon.maxDiscountPaise,
      minBookingAmountPaise: coupon.minBookingAmountPaise,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
    };

    const updated = await useCase.execute({ publicId: 'coupon_public_1' });

    expect(updated).toMatchObject(before);
  });

  it('rejects an unknown coupon instead of attempting an update', async () => {
    const repository = new InMemoryCouponRepository(null);
    const useCase = new UpdateCouponUseCase(repository);

    await expect(useCase.execute({ publicId: 'missing_coupon' })).rejects.toThrow(
      'Coupon not found: missing_coupon',
    );
  });
});
