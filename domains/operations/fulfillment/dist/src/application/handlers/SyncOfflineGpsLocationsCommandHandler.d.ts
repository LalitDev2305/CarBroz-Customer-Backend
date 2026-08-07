import { TrackingSession } from '../../domain/entities/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../../infrastructure/persistence/prisma/PrismaTrackingSessionRepository.js';
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
export declare class SyncOfflineGpsLocationsCommandHandler {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(input: SyncOfflineGpsInput): Promise<TrackingSession>;
}
