import { TrackingSession } from '../domain/TrackingSession.js';
import { PrismaTrackingSessionRepository } from '../infrastructure/repositories/PrismaTrackingSessionRepository.js';
export interface StartTrackingInput {
    bookingId: number;
    partnerId: number;
    customerId: number;
    initialLatitude: number;
    initialLongitude: number;
}
export declare class StartTrackingSessionUseCase {
    private readonly trackingRepository;
    constructor(trackingRepository: PrismaTrackingSessionRepository);
    execute(input: StartTrackingInput): Promise<TrackingSession>;
}
//# sourceMappingURL=StartTrackingSessionUseCase.d.ts.map