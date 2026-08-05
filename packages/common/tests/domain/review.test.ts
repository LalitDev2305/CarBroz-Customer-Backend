import { describe, expect, it } from 'vitest';
import { PartnerRatingCalculator, Review } from '../../src/index.js';
import { IReviewRepository, PartnerRatingStats } from '../../src/domain/review/repositories/IReviewRepository.js';

describe('Phase 19 — Review Domain Model & PartnerRatingCalculator', () => {
  it('should create a valid review entity with default status PUBLISHED', () => {
    const review = new Review({
      bookingId: 101,
      customerId: 5,
      partnerId: 20,
      serviceId: 1,
      rating: 5,
      comment: 'Excellent car wash service!',
    });

    expect(review.rating).toBe(5);
    expect(review.status).toBe('PUBLISHED');
    expect(review.comment).toBe('Excellent car wash service!');
  });

  it('should throw error for rating out of 1-5 range or non-integer', () => {
    expect(
      () =>
        new Review({
          bookingId: 101,
          customerId: 5,
          partnerId: 20,
          serviceId: 1,
          rating: 6,
        })
    ).toThrow('Review rating must be an integer between 1 and 5');

    expect(
      () =>
        new Review({
          bookingId: 101,
          customerId: 5,
          partnerId: 20,
          serviceId: 1,
          rating: 0,
        })
    ).toThrow('Review rating must be an integer between 1 and 5');
  });

  it('should moderate review status correctly', () => {
    const review = new Review({
      bookingId: 101,
      customerId: 5,
      partnerId: 20,
      serviceId: 1,
      rating: 1,
      comment: 'Abusive comment',
    });

    review.moderate('REJECTED', 'Violates community standards');

    expect(review.status).toBe('REJECTED');
    expect(review.moderationReason).toBe('Violates community standards');
  });

  it('should recalculate partner rating stats via PartnerRatingCalculator', async () => {
    const mockRepo: IReviewRepository = {
      async create(r) { return r; },
      async findById() { return null; },
      async findByPublicId() { return null; },
      async findByBookingId() { return null; },
      async listByPartnerId() { return []; },
      async update(r) { return r; },
      async calculatePartnerRatingStats() {
        return {
          averageRating: 4.5,
          totalReviews: 2,
          rating1Count: 0,
          rating2Count: 0,
          rating3Count: 0,
          rating4Count: 1,
          rating5Count: 1,
        };
      },
      async updatePartnerProfileRatingStats() {},
    };

    const calculator = new PartnerRatingCalculator(mockRepo);
    const stats = await calculator.recalculatePartnerRating(20);

    expect(stats.averageRating).toBe(4.5);
    expect(stats.totalReviews).toBe(2);
  });
});
