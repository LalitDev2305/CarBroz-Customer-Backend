import { type IBookingRepository } from '@carbroz/domain-booking';
import { type IReviewRepository } from '../../review/domain/repositories/IReviewRepository.js';
import { PartnerRatingCalculator } from '../../review/domain/services/PartnerRatingCalculator.js';
import { Review } from '../../review/domain/Review.js';

export interface SubmitReviewInput {
  bookingPublicId: string;
  customerUserId: number;
  rating: number;
  comment?: string;
}

export class SubmitReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly partnerRatingCalculator: PartnerRatingCalculator
  ) {}

  async execute(input: SubmitReviewInput): Promise<Review> {
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) {
      throw new Error(`Booking not found: ${input.bookingPublicId}`);
    }

    if (booking.customerId !== input.customerUserId) {
      throw new Error('You can only review your own booking');
    }

    if (booking.status !== 'COMPLETED') {
      throw new Error(`Reviews can only be submitted for completed bookings (current status: ${booking.status})`);
    }

    const existingReview = await this.reviewRepository.findByBookingId(booking.id!);
    if (existingReview) {
      throw new Error('A review has already been submitted for this booking');
    }

    const review = new Review({
      bookingId: booking.id!,
      customerId: booking.customerId,
      partnerId: booking.partnerId!,
      serviceId: booking.serviceId,
      rating: input.rating,
      comment: input.comment,
      status: 'PUBLISHED',
    });

    const createdReview = await this.reviewRepository.create(review);

    // Atomically recalculate partner average rating and review counts
    await this.partnerRatingCalculator.recalculatePartnerRating(booking.partnerId!);

    return createdReview;
  }
}
