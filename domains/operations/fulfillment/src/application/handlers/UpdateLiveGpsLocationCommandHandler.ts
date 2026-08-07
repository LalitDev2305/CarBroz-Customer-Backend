import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { LocationPing } from '../../domain/entities/LocationPing.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';


export interface UpdateGpsInput {
  sessionId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  etaMinutes?: number;
}

export class UpdateLiveGpsLocationCommandHandler {
  constructor(private readonly trackingRepository: PrismaTrackingSessionRepository) {}

  public async execute(input: UpdateGpsInput): Promise<TrackingSession> {
    const session = await this.trackingRepository.findById(input.sessionId);
    if (!session) {
      throw new Error(`Tracking Session with ID ${input.sessionId} not found`);
    }

    const ping = new LocationPing({
      latitude: input.latitude,
      longitude: input.longitude,
      heading: input.heading,
      speed: input.speed,
    });

    session.updateLocation(ping, input.etaMinutes);
    return this.trackingRepository.update(session);
  }
}
