import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';


export class CompleteTrackingSessionCommandHandler {
  constructor(private readonly trackingRepository: PrismaTrackingSessionRepository) {}

  public async execute(sessionId: number): Promise<TrackingSession> {
    const session = await this.trackingRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Tracking Session with ID ${sessionId} not found`);
    }

    session.complete();
    return this.trackingRepository.update(session);
  }
}
