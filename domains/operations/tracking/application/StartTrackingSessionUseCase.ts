import { TrackingSession } from '../domain/TrackingSession.js';
import type { ITrackingSessionRepository } from '../domain/repositories/ITrackingSessionRepository.js';

/** StartTrackingInput is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface StartTrackingInput {
  bookingId: number;
  partnerId: number;
  customerId: number;
  initialLatitude: number;
  initialLongitude: number;
}

/** StartTrackingSessionUseCase is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export class StartTrackingSessionUseCase {
  constructor(private readonly trackingRepository: ITrackingSessionRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  public async execute(input: StartTrackingInput): Promise<TrackingSession> {
    const existing = await this.trackingRepository.findByBookingId(input.bookingId);
    if (existing && existing.status === 'ACTIVE') {
      return existing;
    }

    const session = new TrackingSession({
      bookingId: input.bookingId,
      partnerId: input.partnerId,
      customerId: input.customerId,
      currentLatitude: input.initialLatitude,
      currentLongitude: input.initialLongitude,
      status: 'ACTIVE',
    });

    return this.trackingRepository.create(session);
  }
}
