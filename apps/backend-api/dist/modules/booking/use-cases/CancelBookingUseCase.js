export class CancelBookingUseCase {
    bookingRepository;
    constructor(bookingRepository) {
        this.bookingRepository = bookingRepository;
    }
    async execute(input) {
        if (!input.reason || input.reason.trim().length === 0) {
            throw new Error('Cancellation reason is required');
        }
        const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
        if (!booking) {
            throw new Error('Booking not found');
        }
        if (!input.isAdmin && booking.customerId !== input.actorId) {
            throw new Error('Unauthorized to cancel this booking');
        }
        booking.cancel(input.actorId, input.reason);
        return await this.bookingRepository.update(booking);
    }
}
//# sourceMappingURL=CancelBookingUseCase.js.map