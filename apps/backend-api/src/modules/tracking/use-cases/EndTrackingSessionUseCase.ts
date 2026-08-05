import { IBookingRepository, ITrackingSessionRepository, TrackingSession } from '@carbroz/common';

export class EndTrackingSessionUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly trackingSessionRepository: ITrackingSessionRepository
  ) {}

  async execute(bookingPublicId: string): Promise<TrackingSession> {
    const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking) {
      throw new Error(`Booking not found: ${bookingPublicId}`);
    }

    const session = await this.trackingSessionRepository.findByBookingId(booking.id!);
    if (!session) {
      throw new Error(`Tracking session not found for booking: ${bookingPublicId}`);
    }

    session.complete();
    return await this.trackingSessionRepository.update(session);
  }
}
