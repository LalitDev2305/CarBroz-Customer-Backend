import { DomainError } from "@carbroz/foundation-kernel";
import { BookingAccessPolicy } from "@carbroz/domain-booking";
import { IReviewRepository } from "../../domain/repositories/IReviewRepository.js";
import { PartnerRatingCalculator } from "../../domain/services/PartnerRatingCalculator.js";
import { Review } from "../../domain/Review.js";
/** SubmitReviewInput is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export interface SubmitReviewInput {
  bookingPublicId: string;
  customerUserId: number;
  rating: number;
  comment?: string;
}

/** SubmitReviewUseCase is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export class SubmitReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly bookingAccessPolicy: BookingAccessPolicy,
    private readonly partnerRatingCalculator: PartnerRatingCalculator,
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(input: SubmitReviewInput): Promise<Review> {
    const booking = await this.bookingAccessPolicy.requireCustomerBooking(
      input.bookingPublicId,
      input.customerUserId,
    );

    if (booking.status !== "COMPLETED") {
      throw new DomainError(
        `Reviews can only be submitted for completed bookings (current status: ${booking.status})`,
      );
    }

    const existingReview = await this.reviewRepository.findByBookingId(
      booking.id!,
    );
    if (existingReview) {
      throw new DomainError(
        "A review has already been submitted for this booking",
      );
    }

    const review = new Review({
      bookingId: booking.id!,
      customerId: booking.customerId,
      partnerId: booking.partnerId!,
      serviceId: booking.serviceId,
      rating: input.rating,
      comment: input.comment,
      status: "PUBLISHED",
    });

    const createdReview = await this.reviewRepository.create(review);

    await this.partnerRatingCalculator.recalculatePartnerRating(
      booking.partnerId!,
    );

    return createdReview;
  }
}
