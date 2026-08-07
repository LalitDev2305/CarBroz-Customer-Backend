import { PrismaProvider } from '@carbroz/platform-database';
import { CouponUsage } from '../../../domain/entities/CouponUsage.js';
export declare class PrismaCouponUsageRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(usage: CouponUsage): Promise<CouponUsage>;
    countByUserAndCoupon(userId: number, couponId: number): Promise<number>;
    findByCouponAndBooking(couponId: number, bookingId: number): Promise<CouponUsage | null>;
}
