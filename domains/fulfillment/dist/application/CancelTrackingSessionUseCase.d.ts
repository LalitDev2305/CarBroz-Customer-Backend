import { TrackingSession } from '../domain/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../infrastructure/repositories/PrismaTrackingSessionRepository.js';
export declare class CancelTrackingSessionUseCase {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(sessionId: number): Promise<TrackingSession>;
}
//# sourceMappingURL=CancelTrackingSessionUseCase.d.ts.map