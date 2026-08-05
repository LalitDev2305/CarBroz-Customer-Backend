import { beforeEach, describe, expect, it } from 'vitest';
import {
  Booking,
  Coupon,
  CouponDiscountCalculator,
  CouponUsage,
  PartnerRatingCalculator,
  Review,
} from '@carbroz/common';
import type {
  IBookingRepository,
  ICouponRepository,
  ICouponUsageRepository,
  IPartnerRepository,
  IReviewRepository,
  Partner,
} from '@carbroz/common';
import { SubmitReviewUseCase } from '../src/modules/review/use-cases/SubmitReviewUseCase.js';
import { ModerateReviewUseCase } from '../src/modules/review/use-cases/ModerateReviewUseCase.js';
import { GetPartnerReviewsUseCase } from '../src/modules/review/use-cases/GetPartnerReviewsUseCase.js';
import { CreateCouponUseCase } from '../src/modules/coupon/use-cases/CreateCouponUseCase.js';
import { ValidateCouponUseCase } from '../src/modules/coupon/use-cases/ValidateCouponUseCase.js';
import { ApplyCouponUseCase } from '../src/modules/coupon/use-cases/ApplyCouponUseCase.js';

describe('Phase 19 — Reviews & Coupon Engine Integration Use Cases', () => {
  const now = new Date();
  const dummyBooking = new Booking({
    id: 101,
    publicId: '80000000-0000-0000-0000-000000000101',
    customerId: 5,
    partnerId: 20,
    vehicleId: 1,
    addressId: 2,
    serviceId: 3,
    status: 'COMPLETED',
    slotStartTime: now,
    slotEndTime: new Date(now.getTime() + 3600000),
    totalPricePaise: 100000,
    statusHistoryJson: [],
  });

  const dummyPartner: Partner = {
    id: 20,
    publicId: '90000000-0000-0000-0000-000000000020',
    type: 'INDIVIDUAL',
  } as Partner;

  const reviewsMap = new Map<number, Review>();
  const couponsMap = new Map<string, Coupon>();
  const couponUsages: CouponUsage[] = [];

  let partnerStatsUpdated = false;

  const mockBookingRepo: IBookingRepository = {
    async create(b) { return b; },
    async findById(id) { return id === 101 ? dummyBooking : null; },
    async findByPublicId(pubId) { return pubId === dummyBooking.publicId ? dummyBooking : null; },
    async update(b) { return b; },
    async listByCustomerId() { return []; },
    async listByPartnerId() { return []; },
    async listAll() { return []; },
    async findConflictingPartnerBooking() { return null; },
    async findConflictingSlotBooking() { return null; },
    async findExpiredPendingBookings() { return []; },
  };

  const mockPartnerRepo: IPartnerRepository = {
    async create(p: any) { return p; },
    async findById(id) { return id === 20 ? dummyPartner : null; },
    async findByPublicId(pubId) { return pubId === dummyPartner.publicId ? dummyPartner : null; },
    async update(p: any) { return p; },
    async findByUserId() { return null; },
    async listPendingVerification() { return []; },
    async updateVerificationStatus() { return dummyPartner; },
  };

  const mockReviewRepo: IReviewRepository = {
    async create(r) {
      r.id = 1;
      reviewsMap.set(r.bookingId, r);
      return r;
    },
    async findById(id) { return Array.from(reviewsMap.values()).find((r) => r.id === id) || null; },
    async findByPublicId(pubId) { return Array.from(reviewsMap.values()).find((r) => r.publicId === pubId) || null; },
    async findByBookingId(bId) { return reviewsMap.get(bId) || null; },
    async listByPartnerId(pId) { return Array.from(reviewsMap.values()).filter((r) => r.partnerId === pId && r.status === 'PUBLISHED'); },
    async update(r) {
      reviewsMap.set(r.bookingId, r);
      return r;
    },
    async calculatePartnerRatingStats() {
      const published = Array.from(reviewsMap.values()).filter((r) => r.status === 'PUBLISHED');
      const total = published.length;
      if (total === 0) {
        return { averageRating: 0, totalReviews: 0, rating1Count: 0, rating2Count: 0, rating3Count: 0, rating4Count: 0, rating5Count: 0 };
      }
      const sum = published.reduce((acc, curr) => acc + curr.rating, 0);
      return {
        averageRating: Number((sum / total).toFixed(2)),
        totalReviews: total,
        rating1Count: published.filter((r) => r.rating === 1).length,
        rating2Count: published.filter((r) => r.rating === 2).length,
        rating3Count: published.filter((r) => r.rating === 3).length,
        rating4Count: published.filter((r) => r.rating === 4).length,
        rating5Count: published.filter((r) => r.rating === 5).length,
      };
    },
    async updatePartnerProfileRatingStats() {
      partnerStatsUpdated = true;
    },
  };

  const mockCouponRepo: ICouponRepository = {
    async create(c) {
      c.id = 1;
      couponsMap.set(c.code, c);
      return c;
    },
    async findById(id) { return Array.from(couponsMap.values()).find((c) => c.id === id) || null; },
    async findByPublicId(pubId) { return Array.from(couponsMap.values()).find((c) => c.publicId === pubId) || null; },
    async findByCode(code) { return couponsMap.get(code.toUpperCase()) || null; },
    async listActive() { return Array.from(couponsMap.values()).filter((c) => c.isActive); },
    async update(c) {
      couponsMap.set(c.code, c);
      return c;
    },
    async incrementUsage(couponId) {
      const c = Array.from(couponsMap.values()).find((x) => x.id === couponId);
      if (c) c.currentUsageCount += 1;
    },
  };

  const mockCouponUsageRepo: ICouponUsageRepository = {
    async create(u) {
      u.id = 1;
      couponUsages.push(u);
      return u;
    },
    async countByUserAndCoupon(uId, cId) {
      return couponUsages.filter((cu) => cu.userId === uId && cu.couponId === cId).length;
    },
    async findByCouponAndBooking(cId, bId) {
      return couponUsages.find((cu) => cu.couponId === cId && cu.bookingId === bId) || null;
    },
  };

  beforeEach(() => {
    reviewsMap.clear();
    couponsMap.clear();
    couponUsages.length = 0;
    partnerStatsUpdated = false;
  });

  it('should submit review for completed booking and update partner ratings', async () => {
    const ratingCalculator = new PartnerRatingCalculator(mockReviewRepo);
    const submitUseCase = new SubmitReviewUseCase(mockReviewRepo, mockBookingRepo, ratingCalculator);

    const review = await submitUseCase.execute({
      bookingPublicId: dummyBooking.publicId!,
      customerUserId: 5,
      rating: 5,
      comment: 'Top quality service!',
    });

    expect(review.rating).toBe(5);
    expect(review.status).toBe('PUBLISHED');
    expect(partnerStatsUpdated).toBe(true);
  });

  it('should prevent duplicate reviews on same booking', async () => {
    const ratingCalculator = new PartnerRatingCalculator(mockReviewRepo);
    const submitUseCase = new SubmitReviewUseCase(mockReviewRepo, mockBookingRepo, ratingCalculator);

    await submitUseCase.execute({
      bookingPublicId: dummyBooking.publicId!,
      customerUserId: 5,
      rating: 4,
    });

    await expect(
      submitUseCase.execute({
        bookingPublicId: dummyBooking.publicId!,
        customerUserId: 5,
        rating: 5,
      })
    ).rejects.toThrow('A review has already been submitted for this booking');
  });

  it('should create, validate and apply promo coupon correctly', async () => {
    const createUseCase = new CreateCouponUseCase(mockCouponRepo);
    const discountCalculator = new CouponDiscountCalculator(mockCouponUsageRepo);
    const validateUseCase = new ValidateCouponUseCase(mockCouponRepo, discountCalculator);
    const applyUseCase = new ApplyCouponUseCase(mockCouponRepo, mockCouponUsageRepo, mockBookingRepo, discountCalculator);

    const coupon = await createUseCase.execute({
      code: 'FESTIVE500',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50000, // ₹500 discount
      minBookingAmountPaise: 80000, // min ₹800
      validFrom: new Date('2026-08-01T00:00:00Z'),
      validUntil: new Date('2026-08-31T23:59:59Z'),
    });

    expect(coupon.code).toBe('FESTIVE500');

    // Validation (should NOT increment usage count)
    const validationResult = await validateUseCase.execute({
      code: 'FESTIVE500',
      userId: 5,
      bookingAmountPaise: 100000, // ₹1000
    });

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.discountMoney.amountPaise).toBe(50000);
    expect(coupon.currentUsageCount).toBe(0);

    // Apply (MUST record usage & increment count)
    const usage = await applyUseCase.execute({
      code: 'FESTIVE500',
      userId: 5,
      bookingPublicId: dummyBooking.publicId!,
    });

    expect(usage.discountAmountPaise).toBe(50000);
    expect(coupon.currentUsageCount).toBe(1);
  });
});
