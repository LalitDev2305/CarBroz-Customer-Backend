import { TrackingSession } from '../domain/TrackingSession.js';
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
export declare class SyncOfflineGpsLocationsUseCase {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(input: SyncOfflineGpsInput): Promise<TrackingSession>;
}
//# sourceMappingURL=SyncOfflineGpsLocationsUseCase.d.ts.map