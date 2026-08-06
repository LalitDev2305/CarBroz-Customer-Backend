import { TrackingSession } from '../domain/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../infrastructure/repositories/PrismaTrackingSessionRepository.js';

export class CancelTrackingSessionUseCase {
  constructor(private readonly trackingRepository: PrismaTrackingSessionRepository) {}

  public async execute(sessionId: number): Promise<TrackingSession> {
    const session = await this.trackingRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Tracking Session with ID ${sessionId} not found`);
    }

    session.cancel();
    return this.trackingRepository.update(session);
  }
}
