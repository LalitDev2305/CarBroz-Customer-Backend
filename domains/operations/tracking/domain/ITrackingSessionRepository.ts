import type { TrackingSession } from './TrackingSession.js';

/** Persistence-neutral Operations tracking aggregate repository contract. */
export interface ITrackingSessionRepository {
  create(session: TrackingSession): Promise<TrackingSession>;
  findById(id: number): Promise<TrackingSession | null>;
  findByPublicId(publicId: string): Promise<TrackingSession | null>;
  findByBookingId(bookingId: number): Promise<TrackingSession | null>;
  findActiveByPartnerId(partnerId: number): Promise<TrackingSession | null>;
  update(session: TrackingSession): Promise<TrackingSession>;
}
