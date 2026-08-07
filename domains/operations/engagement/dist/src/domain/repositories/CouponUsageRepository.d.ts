import { CouponUsage } from '../entities/CouponUsage.js';
export interface CouponUsageRepository {
    recordUsage(usage: Omit<CouponUsage, 'id' | 'usedAt'>): Promise<CouponUsage>;
    countByUserIdAndCouponId(userId: number, couponId: number): Promise<number>;
}
