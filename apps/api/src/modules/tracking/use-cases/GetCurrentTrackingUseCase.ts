import { IBookingRepository, ITrackingSessionRepository, TrackingSession } from '@carbroz/common';

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
