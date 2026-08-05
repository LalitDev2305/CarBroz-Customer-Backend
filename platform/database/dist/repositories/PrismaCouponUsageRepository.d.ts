import { PrismaClient } from '@prisma/client';
import { CouponUsage, ICouponUsageRepository } from '@carbroz/common';
export declare class PrismaCouponUsageRepository implements ICouponUsageRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(usage: CouponUsage): Promise<CouponUsage>;
    countByUserAndCoupon(userId: number, couponId: number): Promise<number>;
    findByCouponAndBooking(couponId: number, bookingId: number): Promise<CouponUsage | null>;
}
//# sourceMappingURL=PrismaCouponUsageRepository.d.ts.map