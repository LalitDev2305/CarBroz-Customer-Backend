import {
  IBookingRepository,
  ITrackingSessionRepository,
  LocationPing,
  TrackingSession,
} from '@carbroz/common';

export interface StartTrackingSessionInput {
  bookingPublicId: string;
  partnerUserId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

export class StartTrackingSessionUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly trackingSessionRepository: ITrackingSessionRepository
  ) {}

  async execute(input: StartTrackingSessionInput): Promise<TrackingSession> {
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) {
      throw new Error(`Booking not found: ${input.bookingPublicId}`);
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new Error(`Cannot start tracking for booking in status ${booking.status}`);
    }

    const existingSession = await this.trackingSessionRepository.findByBookingId(booking.id!);
    if (existingSession && existingSession.status === 'ACTIVE') {
      return existingSession;
    }

    const initialPing = LocationPing.create(input.latitude, input.longitude, input.heading, input.speed);

    const session = new TrackingSession({
      bookingId: booking.id!,
      partnerId: booking.partnerId!,
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
