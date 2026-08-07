import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';


export class CancelTrackingSessionCommandHandler {
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
