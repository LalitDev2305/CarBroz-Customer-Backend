import { TrackingSession } from '../domain/TrackingSession.js';
import { LocationPing } from '../domain/LocationPing.js';
import { PrismaTrackingSessionRepository } from '../infrastructure/repositories/PrismaTrackingSessionRepository.js';

export interface OfflineGpsPing {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface SyncOfflineGpsInput {
  sessionId: number;
  pings: OfflineGpsPing[];
}

export class SyncOfflineGpsLocationsUseCase {
  constructor(private readonly trackingRepository: PrismaTrackingSessionRepository) {}

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
