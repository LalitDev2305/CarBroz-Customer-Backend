import { TrackingSession } from '../entities/TrackingSession.js';
export interface TrackingSessionRepository {
    findByBookingId(bookingId: number): Promise<TrackingSession | null>;
    save(session: TrackingSession): Promise<TrackingSession>;
}
