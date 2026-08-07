import { TrackingSession } from '../domain/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../infrastructure/repositories/PrismaTrackingSessionRepository.js';
export declare class GetLiveTrackingTimelineUseCase {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(bookingId: number): Promise<TrackingSession | null>;
}
//# sourceMappingURL=GetLiveTrackingTimelineUseCase.d.ts.map