import { Review, } from '@carbroz/common';
export class SubmitReviewUseCase {
    reviewRepository;
    bookingRepository;
    partnerRatingCalculator;
    constructor(reviewRepository, bookingRepository, partnerRatingCalculator) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.partnerRatingCalculator = partnerRatingCalculator;
    }
    async execute(input) {
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
        const existingReview = await this.reviewRepository.findByBookingId(booking.id);
        if (existingReview) {
            throw new Error('A review has already been submitted for this booking');
        }
        const review = new Review({
            bookingId: booking.id,
            customerId: booking.customerId,
            partnerId: booking.partnerId,
            serviceId: booking.serviceId,
            rating: input.rating,
            comment: input.comment,
            status: 'PUBLISHED',
        });
        const createdReview = await this.reviewRepository.create(review);
        // Atomically recalculate partner average rating and review counts
        await this.partnerRatingCalculator.recalculatePartnerRating(booking.partnerId);
        return createdReview;
    }
}
//# sourceMappingURL=SubmitReviewUseCase.js.map