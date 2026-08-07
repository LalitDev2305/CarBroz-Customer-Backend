import { PrismaClient } from '@prisma/client';
import { Coupon, DiscountType, ICouponRepository } from '@carbroz/common';

export class PrismaCouponRepository implements ICouponRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(record: any): Coupon {
    return new Coupon({
      id: record.id,
      publicId: record.publicId,
      code: record.code,
      description: record.description,
      discountType: record.discountType as DiscountType,
      discountValue: record.discountValue,
      maxDiscountPaise: record.maxDiscountPaise,
      minBookingAmountPaise: record.minBookingAmountPaise,
      usageLimit: record.usageLimit,
      perUserLimit: record.perUserLimit,
      currentUsageCount: record.currentUsageCount,
      validFrom: record.validFrom,
      validUntil: record.validUntil,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(coupon: Coupon): Promise<Coupon> {
    const record = await this.prisma.coupon.create({
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountPaise: coupon.maxDiscountPaise,
        minBookingAmountPaise: coupon.minBookingAmountPaise,
        usageLimit: coupon.usageLimit,
        perUserLimit: coupon.perUserLimit,
        currentUsageCount: coupon.currentUsageCount,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        isActive: coupon.isActive,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<Coupon | null> {
    const record = await this.prisma.coupon.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<Coupon | null> {
    const record = await this.prisma.coupon.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const formattedCode = code.trim().toUpperCase();
    const record = await this.prisma.coupon.findUnique({ where: { code: formattedCode } });
    return record ? this.mapToDomain(record) : null;
  }

  async listActive(now = new Date()): Promise<Coupon[]> {
    const records = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async update(coupon: Coupon): Promise<Coupon> {
    const record = await this.prisma.coupon.update({
      where: { id: coupon.id },
      data: {
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
      },
    });
    return this.mapToDomain(record);
  }

  async incrementUsage(couponId: number): Promise<void> {
    await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        currentUsageCount: { increment: 1 },
      },
    });
  }
}
