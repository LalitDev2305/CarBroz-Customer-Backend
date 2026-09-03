import { PrismaClient } from '@prisma/client';
import { IReviewRepository, PartnerRatingStats, Review, ReviewStatus } from '@carbroz/common';

export class PrismaReviewRepository implements IReviewRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaClient;
  }

  private mapToDomain(record: any): Review {
    return new Review({
      id: record.id,
      publicId: record.publicId,
      bookingId: record.bookingId,
      customerId: record.customerId,
      partnerId: record.partnerId,
      serviceId: record.serviceId,
      rating: record.rating,
      comment: record.comment,
      status: record.status as ReviewStatus,
      moderationReason: record.moderationReason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(review: Review): Promise<Review> {
    const record = await this.prisma.review.create({
      data: {
        bookingId: review.bookingId,
        customerId: review.customerId,
        partnerId: review.partnerId,
        serviceId: review.serviceId,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        moderationReason: review.moderationReason,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<Review | null> {
    const record = await this.prisma.review.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<Review | null> {
    const record = await this.prisma.review.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByBookingId(bookingId: number): Promise<Review | null> {
    const record = await this.prisma.review.findUnique({ where: { bookingId } });
    return record ? this.mapToDomain(record) : null;
  }

  async listByPartnerId(partnerId: number, limit = 50, offset = 0): Promise<Review[]> {
    const records = await this.prisma.review.findMany({
      where: { partnerId, status: 'PUBLISHED' },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async update(review: Review): Promise<Review> {
    const record = await this.prisma.review.update({
      where: { id: review.id },
      data: {
        status: review.status,
        moderationReason: review.moderationReason,
      },
    });
    return this.mapToDomain(record);
  }

  async calculatePartnerRatingStats(partnerId: number): Promise<PartnerRatingStats> {
    const reviews = await this.prisma.review.findMany({
      where: { partnerId, status: 'PUBLISHED' },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0.0,
        totalReviews: 0,
        rating1Count: 0,
        rating2Count: 0,
        rating3Count: 0,
        rating4Count: 0,
        rating5Count: 0,
      };
    }

    let sum = 0;
    let r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0;

    for (const r of reviews) {
      sum += r.rating;
      if (r.rating === 1) r1++;
      else if (r.rating === 2) r2++;
      else if (r.rating === 3) r3++;
      else if (r.rating === 4) r4++;
      else if (r.rating === 5) r5++;
    }

    const avg = Number((sum / totalReviews).toFixed(2));

    return {
      averageRating: avg,
      totalReviews,
      rating1Count: r1,
      rating2Count: r2,
      rating3Count: r3,
      rating4Count: r4,
      rating5Count: r5,
    };
  }

  async updatePartnerProfileRatingStats(partnerId: number, stats: PartnerRatingStats): Promise<void> {
    await this.prisma.partnerProfile.updateMany({
      where: { partnerId },
      data: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        rating1Count: stats.rating1Count,
        rating2Count: stats.rating2Count,
        rating3Count: stats.rating3Count,
        rating4Count: stats.rating4Count,
        rating5Count: stats.rating5Count,
      },
    });
  }
}
