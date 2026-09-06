import { DomainError } from "@carbroz/foundation-kernel";
import { TrackingSession } from "../domain/TrackingSession.js";
import { LocationPing } from "../domain/LocationPing.js";
import type { ITrackingSessionRepository } from "../domain/repositories/ITrackingSessionRepository.js";

/** UpdateGpsInput is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface UpdateGpsInput {
  sessionId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  etaMinutes?: number;
}

/** UpdateLiveGpsLocationUseCase is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export class UpdateLiveGpsLocationUseCase {
  constructor(
    private readonly trackingRepository: ITrackingSessionRepository,
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  public async execute(input: UpdateGpsInput): Promise<TrackingSession> {
    const session = await this.trackingRepository.findById(input.sessionId);
    if (!session) {
      throw new DomainError(
        `Tracking Session with ID ${input.sessionId} not found`,
      );
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
