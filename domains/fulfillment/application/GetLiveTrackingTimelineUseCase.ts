import { TrackingSession } from '../domain/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../infrastructure/repositories/PrismaTrackingSessionRepository.js';

export class GetLiveTrackingTimelineUseCase {
  constructor(private readonly trackingRepository: PrismaTrackingSessionRepository) {}

  public async execute(bookingId: number): Promise<TrackingSession | null> {
    return this.trackingRepository.findByBookingId(bookingId);
  }
}
