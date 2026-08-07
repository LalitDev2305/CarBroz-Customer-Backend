import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';


export interface StartTrackingInput {
  bookingId: number;
  partnerId: number;
  customerId: number;
  initialLatitude: number;
  initialLongitude: number;
}

export class StartTrackingSessionCommandHandler {
  constructor(private readonly trackingRepository: PrismaTrackingSessionRepository) {}

  public async execute(input: StartTrackingInput): Promise<TrackingSession> {
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
