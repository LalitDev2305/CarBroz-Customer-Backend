export class EndTrackingSessionUseCase {
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
        const session = await this.trackingSessionRepository.findByBookingId(booking.id);
        if (!session) {
            throw new Error(`Tracking session not found for booking: ${bookingPublicId}`);
        }
        session.complete();
        return await this.trackingSessionRepository.update(session);
    }
}
//# sourceMappingURL=EndTrackingSessionUseCase.js.map