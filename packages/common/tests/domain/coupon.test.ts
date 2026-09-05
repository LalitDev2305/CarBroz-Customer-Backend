import { describe, expect, it } from 'vitest';
import { Coupon, CouponDiscountCalculator, CouponUsage } from '../../src/index.js';
import type { ICouponUsageRepository } from '../../src/domain/coupon/repositories/ICouponUsageRepository.js';

describe('Phase 19 — Coupon Domain Model & CouponDiscountCalculator', () => {
  const now = new Date('2026-08-05T10:00:00Z');
  const validFrom = new Date('2026-08-01T00:00:00Z');
  const validUntil = new Date('2026-08-31T23:59:59Z');

  const mockUsageRepo: ICouponUsageRepository = {
    async create(usage) { return usage; },
    async countByUserAndCoupon() { return 0; },
    async findByCouponAndBooking() { return null; },
  };

  it('should create uppercase coupon code', () => {
    const coupon = new Coupon({
      code: '  welcome50 ',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      validFrom,
      validUntil,
    });

    expect(coupon.code).toBe('WELCOME50');
    expect(coupon.isValidAt(now)).toBe(true);
  });

  it('should calculate percentage discount correctly and cap by maxDiscountPaise', async () => {
    const coupon = new Coupon({
      id: 1,
      code: 'SAVE20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscountPaise: 10000,
      minBookingAmountPaise: 10000,
      validFrom,
      validUntil,
    });

    const calculator = new CouponDiscountCalculator(mockUsageRepo);
    const result = await calculator.calculateDiscount({
      coupon,
      userId: 5,
      bookingAmountPaise: 100000,
      now,
    });

    expect(result.isValid).toBe(true);
    expect(result.discountMoney.amountMinor).toBe(10000);
    expect(result.finalPriceMoney.amountMinor).toBe(90000);
  });

  it('should calculate fixed amount discount correctly', async () => {
    const coupon = new Coupon({
      id: 2,
      code: 'FLAT150',
      discountType: 'FIXED_AMOUNT',
      discountValue: 15000,
      minBookingAmountPaise: 50000,
      validFrom,
      validUntil,
    });

    const calculator = new CouponDiscountCalculator(mockUsageRepo);
    const result = await calculator.calculateDiscount({
      coupon,
      userId: 5,
      bookingAmountPaise: 60000,
      now,
    });

    expect(result.isValid).toBe(true);
    expect(result.discountMoney.amountMinor).toBe(15000);
    expect(result.finalPriceMoney.amountMinor).toBe(45000);
  });

  it('should reject coupon if booking amount is below minBookingAmountPaise', async () => {
    const coupon = new Coupon({
      id: 3,
      code: 'BIGDISCOUNT',
      discountType: 'FIXED_AMOUNT',
      discountValue: 10000,
      minBookingAmountPaise: 50000,
      validFrom,
      validUntil,
    });

    const calculator = new CouponDiscountCalculator(mockUsageRepo);
    const result = await calculator.calculateDiscount({
      coupon,
      userId: 5,
      bookingAmountPaise: 30000,
      now,
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Minimum booking amount required');
    expect(result.discountMoney.amountMinor).toBe(0);
  });

  it('should reject coupon if per-user usage limit is exceeded', async () => {
    const coupon = new Coupon({
      id: 4,
      code: 'ONETIME',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      perUserLimit: 1,
      validFrom,
      validUntil,
    });

    const mockExceededRepo: ICouponUsageRepository = {
      async create(u) { return u; },
      async countByUserAndCoupon() { return 1; },
      async findByCouponAndBooking() { return null; },
    };

    const calculator = new CouponDiscountCalculator(mockExceededRepo);
    const result = await calculator.calculateDiscount({
      coupon,
      userId: 5,
      bookingAmountPaise: 50000,
      now,
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Per-user coupon usage limit exceeded');
  });
});
