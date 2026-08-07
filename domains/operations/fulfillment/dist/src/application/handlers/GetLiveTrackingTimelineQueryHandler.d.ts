import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';
export declare class GetLiveTrackingTimelineQueryHandler {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(bookingId: number): Promise<TrackingSession | null>;
}
