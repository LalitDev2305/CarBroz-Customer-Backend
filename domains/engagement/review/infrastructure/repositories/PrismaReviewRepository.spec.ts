import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { Review } from '@carbroz/common';
import { PrismaReviewRepository } from './PrismaReviewRepository.js';

function record(overrides: Record<string, unknown> = {}) {
  return {
    id: 11,
    publicId: 'review_public_11',
    bookingId: 21,
    customerId: 31,
    partnerId: 41,
    serviceId: 51,
    rating: 5,
    comment: 'Excellent service',
    status: 'PUBLISHED' as const,
    moderationReason: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

function prismaFixture() {
  const review = {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  };
  const partnerProfile = { updateMany: vi.fn() };
  const prisma = { review, partnerProfile } as unknown as PrismaClient;
  return { prisma, review, partnerProfile };
}

function domainReview(): Review {
  return new Review(record());
}

describe('PrismaReviewRepository', () => {
  it('creates, reads, lists and updates reviews through the Prisma adapter', async () => {
    const { prisma, review } = prismaFixture();
    const repository = new PrismaReviewRepository(prisma);
    const source = domainReview();
    review.create.mockResolvedValue(record());
    review.findUnique
      .mockResolvedValueOnce(record())
      .mockResolvedValueOnce(record())
      .mockResolvedValueOnce(record())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    review.findMany.mockResolvedValue([record(), record({ id: 12, publicId: 'review_public_12', rating: 4 })]);
    review.update.mockResolvedValue(record({ status: 'FLAGGED', moderationReason: 'moderated' }));

    await expect(repository.create(source)).resolves.toMatchObject({ publicId: 'review_public_11', rating: 5 });
    await expect(repository.findById(11)).resolves.toMatchObject({ id: 11 });
    await expect(repository.findByPublicId('review_public_11')).resolves.toMatchObject({ publicId: 'review_public_11' });
    await expect(repository.findByBookingId(21)).resolves.toMatchObject({ bookingId: 21 });
    await expect(repository.findById(999)).resolves.toBeNull();
    await expect(repository.findByPublicId('missing')).resolves.toBeNull();
    await expect(repository.findByBookingId(999)).resolves.toBeNull();

    const listed = await repository.listByPartnerId(41);
    expect(listed.map((item) => item.rating)).toEqual([5, 4]);
    expect(review.findMany).toHaveBeenCalledWith({
      where: { partnerId: 41, status: 'PUBLISHED' },
      take: 50,
      skip: 0,
      orderBy: { createdAt: 'desc' },
    });

    source.status = 'FLAGGED';
    source.moderationReason = 'moderated';
    await expect(repository.update(source)).resolves.toMatchObject({
      status: 'FLAGGED',
      moderationReason: 'moderated',
    });
  });

  it('honors explicit pagination values', async () => {
    const { prisma, review } = prismaFixture();
    const repository = new PrismaReviewRepository(prisma);
    review.findMany.mockResolvedValue([]);

    await expect(repository.listByPartnerId(41, 7, 14)).resolves.toEqual([]);
    expect(review.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 7, skip: 14 }));
  });

  it('returns zeroed rating statistics when the partner has no published reviews', async () => {
    const { prisma, review } = prismaFixture();
    const repository = new PrismaReviewRepository(prisma);
    review.findMany.mockResolvedValue([]);

    await expect(repository.calculatePartnerRatingStats(41)).resolves.toEqual({
      averageRating: 0,
      totalReviews: 0,
      rating1Count: 0,
      rating2Count: 0,
      rating3Count: 0,
      rating4Count: 0,
      rating5Count: 0,
    });
  });

  it('calculates every rating bucket and a two-decimal average', async () => {
    const { prisma, review } = prismaFixture();
    const repository = new PrismaReviewRepository(prisma);
    review.findMany.mockResolvedValue([
      { rating: 1 },
      { rating: 2 },
      { rating: 3 },
      { rating: 4 },
      { rating: 5 },
      { rating: 5 },
    ]);

    await expect(repository.calculatePartnerRatingStats(41)).resolves.toEqual({
      averageRating: 3.33,
      totalReviews: 6,
      rating1Count: 1,
      rating2Count: 1,
      rating3Count: 1,
      rating4Count: 1,
      rating5Count: 2,
    });
  });

  it('persists calculated rating statistics onto the partner profile', async () => {
    const { prisma, partnerProfile } = prismaFixture();
    const repository = new PrismaReviewRepository(prisma);
    partnerProfile.updateMany.mockResolvedValue({ count: 1 });
    const stats = {
      averageRating: 4.25,
      totalReviews: 8,
      rating1Count: 0,
      rating2Count: 1,
      rating3Count: 1,
      rating4Count: 1,
      rating5Count: 5,
    };

    await repository.updatePartnerProfileRatingStats(41, stats);

    expect(partnerProfile.updateMany).toHaveBeenCalledWith({
      where: { partnerId: 41 },
      data: stats,
    });
  });
});
