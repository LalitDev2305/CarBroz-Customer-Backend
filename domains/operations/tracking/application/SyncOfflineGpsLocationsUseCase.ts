import { TrackingSession } from '../domain/TrackingSession.js';
import { LocationPing } from '../domain/LocationPing.js';
import type { ITrackingSessionRepository } from '../domain/ITrackingSessionRepository.js';

/** OfflineGpsPing is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface OfflineGpsPing {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

/** SyncOfflineGpsInput is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface SyncOfflineGpsInput {
  sessionId: number;
  pings: OfflineGpsPing[];
}

/** SyncOfflineGpsLocationsUseCase is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export class SyncOfflineGpsLocationsUseCase {
  constructor(private readonly trackingRepository: ITrackingSessionRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  public async execute(input: SyncOfflineGpsInput): Promise<TrackingSession> {
    const session = await this.trackingRepository.findById(input.sessionId);
    if (!session) {
      throw new Error(`Tracking Session with ID ${input.sessionId} not found`);
    }

    if (!input.pings || input.pings.length === 0) {
      return session;
    }

    // Process the latest timestamped ping for session status update
    const sortedPings = [...input.pings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const latestPing = sortedPings[sortedPings.length - 1];

    if (!latestPing) {
      return session;
    }

    const ping = new LocationPing({
      latitude: latestPing.latitude,
      longitude: latestPing.longitude,
      heading: latestPing.heading,
      speed: latestPing.speed,
    });

    session.updateLocation(ping);
    return this.trackingRepository.update(session);
  }
}
