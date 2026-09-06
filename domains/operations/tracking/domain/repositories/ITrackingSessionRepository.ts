import { TrackingSession } from '../TrackingSession.js';

/** ITrackingSessionRepository is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ITrackingSessionRepository {
  create(session: TrackingSession): Promise<TrackingSession>;
  findById(id: number): Promise<TrackingSession | null>;
  findByPublicId(publicId: string): Promise<TrackingSession | null>;
  findByBookingId(bookingId: number): Promise<TrackingSession | null>;
  findActiveByPartnerId(partnerId: number): Promise<TrackingSession | null>;
  update(session: TrackingSession): Promise<TrackingSession>;
}
