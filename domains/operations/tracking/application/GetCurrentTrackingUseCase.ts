import { type IBookingRepository } from '@carbroz/domain-booking';
import { type ITrackingSessionRepository } from '../../domain/location/repositories/ITrackingSessionRepository.js';
import { TrackingSession } from '../domain/TrackingSession.js';

export class GetCurrentTrackingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly trackingSessionRepository: ITrackingSessionRepository
  ) {}

  async execute(bookingPublicId: string): Promise<TrackingSession | null> {
    const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking) {
      throw new Error(`Booking not found: ${bookingPublicId}`);
    }

    return await this.trackingSessionRepository.findByBookingId(booking.id!);
  }
}
