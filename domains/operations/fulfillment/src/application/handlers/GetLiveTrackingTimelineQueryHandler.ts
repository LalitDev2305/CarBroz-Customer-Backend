import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';


export class GetLiveTrackingTimelineQueryHandler {
  constructor(private readonly trackingRepository: PrismaTrackingSessionRepository) {}

  public async execute(bookingId: number): Promise<TrackingSession | null> {
    return this.trackingRepository.findByBookingId(bookingId);
  }
}
