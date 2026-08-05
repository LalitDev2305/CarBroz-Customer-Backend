import { LocationPing, } from '@carbroz/common';
export class UpdateLocationPingUseCase {
    trackingSessionRepository;
    bookingRepository;
    mapsProvider;
    constructor(trackingSessionRepository, bookingRepository, mapsProvider) {
        this.trackingSessionRepository = trackingSessionRepository;
        this.bookingRepository = bookingRepository;
        this.mapsProvider = mapsProvider;
    }
    async execute(input) {
        const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
        if (!booking) {
            throw new Error(`Booking not found: ${input.bookingPublicId}`);
        }
        const session = await this.trackingSessionRepository.findByBookingId(booking.id);
        if (!session || session.status !== 'ACTIVE') {
            throw new Error(`Active tracking session not found for booking: ${input.bookingPublicId}`);
        }
        const newPing = LocationPing.create(input.latitude, input.longitude, input.heading, input.speed);
        const lastPing = session.currentLocationPing;
        const distanceMovedMeters = lastPing.distanceToMeters(newPing);
        const timeElapsedMs = session.updatedAt ? new Date().getTime() - session.updatedAt.getTime() : 0;
        let recalculatedEtaMinutes = session.etaMinutes;
        // Recalculate ETA via IMapsProvider only if distance moved > 500m OR time > 3 minutes (180,000 ms)
        if (distanceMovedMeters >= 500 || timeElapsedMs >= 180000 || session.etaMinutes === null) {
            try {
                const destLat = booking.snapshots.address.latitude;
                const destLng = booking.snapshots.address.longitude;
                if (destLat && destLng) {
                    const route = await this.mapsProvider.calculateDistance({ latitude: newPing.latitude, longitude: newPing.longitude }, { latitude: destLat, longitude: destLng });
                    recalculatedEtaMinutes = Math.ceil(route.durationInSeconds / 60);
                }
            }
            catch {
                // Fallback to previous ETA if maps API call fails
            }
        }
        session.updateLocation(newPing, recalculatedEtaMinutes);
        return await this.trackingSessionRepository.update(session);
    }
}
//# sourceMappingURL=UpdateLocationPingUseCase.js.map