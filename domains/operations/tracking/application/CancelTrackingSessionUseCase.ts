import { TrackingSession } from '../domain/TrackingSession.js';
import type { ITrackingSessionRepository } from '../domain/ITrackingSessionRepository.js';

/** CancelTrackingSessionUseCase is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export class CancelTrackingSessionUseCase {
  constructor(private readonly trackingRepository: ITrackingSessionRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  public async execute(sessionId: number): Promise<TrackingSession> {
    const session = await this.trackingRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Tracking Session with ID ${sessionId} not found`);
    }

    session.cancel();
    return this.trackingRepository.update(session);
  }
}
