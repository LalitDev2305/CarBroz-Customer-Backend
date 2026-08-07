import { TrackingSession } from '../domain/TrackingSession.js';
export class StartTrackingSessionUseCase {
    trackingRepository;
    constructor(trackingRepository) {
        this.trackingRepository = trackingRepository;
    }
    async execute(input) {
        const existing = await this.trackingRepository.findByBookingId(input.bookingId);
        if (existing && existing.status === 'ACTIVE') {
            return existing;
        }
        const session = new TrackingSession({
            bookingId: input.bookingId,
            partnerId: input.partnerId,
            customerId: input.customerId,
            currentLatitude: input.initialLatitude,
            currentLongitude: input.initialLongitude,
            status: 'ACTIVE',
        });
        return this.trackingRepository.create(session);
    }
}
//# sourceMappingURL=StartTrackingSessionUseCase.js.map