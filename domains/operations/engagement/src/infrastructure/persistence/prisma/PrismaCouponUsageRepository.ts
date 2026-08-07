import { PrismaProvider } from '@carbroz/platform-database';
import { CouponUsage } from '../../../domain/entities/CouponUsage.js';

export class PrismaCouponUsageRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaProvider.getClient();
  }


  private mapToDomain(record: any): CouponUsage {
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

  async create(usage: CouponUsage): Promise<CouponUsage> {
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

  async countByUserAndCoupon(userId: number, couponId: number): Promise<number> {
    return await this.prisma.couponUsage.count({
      where: { userId, couponId },
    });
  }

  async findByCouponAndBooking(couponId: number, bookingId: number): Promise<CouponUsage | null> {
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
