import { TrackingSession } from '../domain/TrackingSession.js';
import type { ITrackingSessionRepository } from '../domain/ITrackingSessionRepository.js';

/** GetLiveTrackingTimelineUseCase is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export class GetLiveTrackingTimelineUseCase {
  constructor(private readonly trackingRepository: ITrackingSessionRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  public async execute(bookingId: number): Promise<TrackingSession | null> {
    return this.trackingRepository.findByBookingId(bookingId);
  }
}
