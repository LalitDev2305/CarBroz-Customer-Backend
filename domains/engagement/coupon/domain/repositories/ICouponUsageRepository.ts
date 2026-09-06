import { CouponUsage } from '../CouponUsage.js';

/** ICouponUsageRepository is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ICouponUsageRepository {
  create(usage: CouponUsage): Promise<CouponUsage>;
  countByUserAndCoupon(userId: number, couponId: number): Promise<number>;
  findByCouponAndBooking(couponId: number, bookingId: number): Promise<CouponUsage | null>;
}
