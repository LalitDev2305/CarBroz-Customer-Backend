import { type IBookingRepository } from '@carbroz/domain-booking';
import { type IMapsProvider } from '../../application/ports/IMapsProvider.js';
import { type ITrackingSessionRepository } from '../../domain/location/repositories/ITrackingSessionRepository.js';
import { LocationPing } from '../domain/LocationPing.js';
import { TrackingSession } from '../domain/TrackingSession.js';

export interface UpdateLocationPingInput {
  bookingPublicId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

export class UpdateLocationPingUseCase {
  constructor(
    private readonly trackingSessionRepository: ITrackingSessionRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly mapsProvider: IMapsProvider
  ) {}

  async execute(input: UpdateLocationPingInput): Promise<TrackingSession> {
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) {
      throw new Error(`Booking not found: ${input.bookingPublicId}`);
    }

    const session = await this.trackingSessionRepository.findByBookingId(booking.id!);
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
          const route = await this.mapsProvider.calculateDistance(
            { latitude: newPing.latitude, longitude: newPing.longitude },
            { latitude: destLat, longitude: destLng }
          );
          recalculatedEtaMinutes = Math.ceil(route.durationInSeconds / 60);
        }
      } catch {
        // Fallback to previous ETA if maps API call fails
      }
    }

    session.updateLocation(newPing, recalculatedEtaMinutes);
    return await this.trackingSessionRepository.update(session);
  }
}
