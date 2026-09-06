import { TrackingSession } from '../domain/TrackingSession.js';
import type { ITrackingSessionRepository } from '../domain/repositories/ITrackingSessionRepository.js';

/** CompleteTrackingSessionUseCase is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export class CompleteTrackingSessionUseCase {
  constructor(private readonly trackingRepository: ITrackingSessionRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  public async execute(sessionId: number): Promise<TrackingSession> {
    const session = await this.trackingRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Tracking Session with ID ${sessionId} not found`);
    }

    session.complete();
    return this.trackingRepository.update(session);
  }
}
