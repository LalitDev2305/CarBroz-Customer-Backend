import { CouponUsage } from '@carbroz/common';
export class PrismaCouponUsageRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToDomain(record) {
        return new CouponUsage({
            id: record.id,
            publicId: record.publicId,
            couponId: record.couponId,
            userId: record.userId,
            bookingId: record.bookingId,
            discountAmountPaise: record.discountAmountPaise,
            usedAt: record.usedAt,
        });
    }
    async create(usage) {
        const record = await this.prisma.couponUsage.create({
            data: {
                couponId: usage.couponId,
                userId: usage.userId,
                bookingId: usage.bookingId,
                discountAmountPaise: usage.discountAmountPaise,
                usedAt: usage.usedAt,
            },
        });
        return this.mapToDomain(record);
    }
    async countByUserAndCoupon(userId, couponId) {
        return await this.prisma.couponUsage.count({
            where: { userId, couponId },
        });
    }
    async findByCouponAndBooking(couponId, bookingId) {
        const record = await this.prisma.couponUsage.findUnique({
            where: {
                couponId_bookingId: {
                    couponId,
                    bookingId,
                },
            },
        });
        return record ? this.mapToDomain(record) : null;
    }
}
//# sourceMappingURL=PrismaCouponUsageRepository.js.map