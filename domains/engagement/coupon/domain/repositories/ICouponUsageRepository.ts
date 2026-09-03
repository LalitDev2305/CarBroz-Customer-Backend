import { CouponUsage } from '../../../coupon/domain/CouponUsage.js';

export interface ICouponUsageRepository {
  create(usage: CouponUsage): Promise<CouponUsage>;
  countByUserAndCoupon(userId: number, couponId: number): Promise<number>;
  findByCouponAndBooking(couponId: number, bookingId: number): Promise<CouponUsage | null>;
}
