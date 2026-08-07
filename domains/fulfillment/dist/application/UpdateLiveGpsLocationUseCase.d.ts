import { TrackingSession } from '../domain/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../infrastructure/repositories/PrismaTrackingSessionRepository.js';
export interface UpdateGpsInput {
    sessionId: number;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    etaMinutes?: number;
}
export declare class UpdateLiveGpsLocationUseCase {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(input: UpdateGpsInput): Promise<TrackingSession>;
}
//# sourceMappingURL=UpdateLiveGpsLocationUseCase.d.ts.map