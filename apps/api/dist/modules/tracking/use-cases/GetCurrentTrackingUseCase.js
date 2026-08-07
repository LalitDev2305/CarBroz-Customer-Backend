export class GetCurrentTrackingUseCase {
    bookingRepository;
    trackingSessionRepository;
    constructor(bookingRepository, trackingSessionRepository) {
        this.bookingRepository = bookingRepository;
        this.trackingSessionRepository = trackingSessionRepository;
    }
    async execute(bookingPublicId) {
        const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
        if (!booking) {
            throw new Error(`Booking not found: ${bookingPublicId}`);
        }
        return await this.trackingSessionRepository.findByBookingId(booking.id);
    }
}
//# sourceMappingURL=GetCurrentTrackingUseCase.js.map