import { LocationPing, TrackingSession, } from '@carbroz/foundation-kernel';
export class StartTrackingSessionUseCase {
    bookingRepository;
    trackingSessionRepository;
    constructor(bookingRepository, trackingSessionRepository) {
        this.bookingRepository = bookingRepository;
        this.trackingSessionRepository = trackingSessionRepository;
    }
    async execute(input) {
        const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
        if (!booking) {
            throw new Error(`Booking not found: ${input.bookingPublicId}`);
        }
        if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
            throw new Error(`Cannot start tracking for booking in status ${booking.status}`);
        }
        const existingSession = await this.trackingSessionRepository.findByBookingId(booking.id);
        if (existingSession && existingSession.status === 'ACTIVE') {
            return existingSession;
        }
        const initialPing = LocationPing.create(input.latitude, input.longitude, input.heading, input.speed);
        const session = new TrackingSession({
            bookingId: booking.id,
            partnerId: booking.partnerId,
            customerId: booking.customerId,
            currentLatitude: initialPing.latitude,
            currentLongitude: initialPing.longitude,
            heading: initialPing.heading,
            speed: initialPing.speed,
            status: 'ACTIVE',
            startedAt: new Date(),
        });
        return await this.trackingSessionRepository.create(session);
    }
}
//# sourceMappingURL=StartTrackingSessionUseCase.js.map